-- Create payments table for PayTR integration
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  paytr_token VARCHAR(255) UNIQUE NOT NULL,
  merchant_oid VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  payment_type VARCHAR(50) DEFAULT 'card',
  installment_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  card_type VARCHAR(50),
  card_bank VARCHAR(100),
  paid_amount DECIMAL(12,2),
  merchant_commission_fee DECIMAL(12,2),
  merchant_service_fee DECIMAL(12,2),
  paid_price DECIMAL(12,2),
  ip_address INET,
  hash_data VARCHAR(255),
  callback_data JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_oid ON payments(merchant_oid);
CREATE INDEX IF NOT EXISTS idx_payments_paytr_token ON payments(paytr_token);

-- Add constraints
ALTER TABLE payments
ADD CONSTRAINT check_payment_amount
CHECK (amount > 0);

ALTER TABLE payments
ADD CONSTRAINT check_paid_amount
CHECK (paid_amount IS NULL OR paid_amount >= 0);

-- Create function to generate unique merchant order ID
CREATE OR REPLACE FUNCTION generate_merchant_oid()
RETURNS VARCHAR(255) AS $$
BEGIN
  RETURN 'ORD' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || substr(md5(random()::TEXT), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Function to update payment status with validation
CREATE OR REPLACE FUNCTION update_payment_status(
  payment_id INTEGER,
  new_status VARCHAR(20),
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_status VARCHAR(20);
  valid_transitions TEXT[];
BEGIN
  -- Get current status
  SELECT status INTO current_status
  FROM payments
  WHERE id = payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  -- Define valid transitions
  valid_transitions := CASE current_status
    WHEN 'pending' THEN ARRAY['processing', 'failed', 'cancelled']
    WHEN 'processing' THEN ARRAY['paid', 'failed', 'cancelled']
    WHEN 'paid' THEN ARRAY['refunded', 'partial_refunded']
    WHEN 'failed' THEN ARRAY['pending'] -- Allow retry
    WHEN 'cancelled' THEN ARRAY[] -- Terminal state
    WHEN 'refunded' THEN ARRAY[] -- Terminal state
    WHEN 'partial_refunded' THEN ARRAY['refunded']
    ELSE ARRAY[]
  END;

  -- Validate transition
  IF NOT (new_status = ANY(valid_transitions)) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', current_status, new_status;
  END IF;

  -- Update payment
  UPDATE payments
  SET status = new_status,
      updated_at = CURRENT_TIMESTAMP,
      completed_at = CASE WHEN new_status IN ('paid', 'failed', 'cancelled') THEN CURRENT_TIMESTAMP ELSE completed_at END
  WHERE id = payment_id;

  -- Log status change (optional - create payment_status_history table if needed)
  -- INSERT INTO payment_status_history (payment_id, status, reason, created_at)
  -- VALUES (payment_id, new_status, reason, CURRENT_TIMESTAMP);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create webhook tracking table
CREATE TABLE IF NOT EXISTS webhook_callbacks (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  merchant_oid VARCHAR(255) NOT NULL,
  webhook_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_callbacks_merchant_oid ON webhook_callbacks(merchant_oid);
CREATE INDEX IF NOT EXISTS idx_webhook_callbacks_processed ON webhook_callbacks(processed);

-- Function to handle idempotent webhook processing
CREATE OR REPLACE FUNCTION process_webhook_idempotently(
  merchant_oid_param VARCHAR(255),
  webhook_data JSONB,
  received_hash VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  payment_record RECORD;
  webhook_record RECORD;
BEGIN
  -- Find payment
  SELECT * INTO payment_record
  FROM payments
  WHERE merchant_oid = merchant_oid_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found for merchant_oid: %', merchant_oid_param;
  END IF;

  -- Check if already processed
  SELECT * INTO webhook_record
  FROM webhook_callbacks
  WHERE merchant_oid = merchant_oid_param
  AND processed = TRUE
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Already processed, return success (idempotent)
    RETURN TRUE;
  END IF;

  -- Create webhook record
  INSERT INTO webhook_callbacks (payment_id, merchant_oid, webhook_data, created_at)
  VALUES (payment_record.id, merchant_oid_param, webhook_data, CURRENT_TIMESTAMP)
  RETURNING * INTO webhook_record;

  -- Process webhook logic here
  -- This would typically update payment status based on webhook data

  -- Mark as processed
  UPDATE webhook_callbacks
  SET processed = TRUE,
      processed_at = CURRENT_TIMESTAMP,
      processing_attempts = processing_attempts + 1
  WHERE id = webhook_record.id;

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Mark as failed
  UPDATE webhook_callbacks
  SET error_message = SQLERRM,
      processing_attempts = processing_attempts + 1
  WHERE id = COALESCE(webhook_record.id, (
    SELECT id FROM webhook_callbacks
    WHERE merchant_oid = merchant_oid_param
    ORDER BY created_at DESC
    LIMIT 1
  ));

  RAISE;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE payments IS 'PayTR payment integration table with full transaction tracking';
COMMENT ON TABLE webhook_callbacks IS 'PayTR webhook callback tracking for idempotent processing';