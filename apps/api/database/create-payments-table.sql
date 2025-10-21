-- Simple payments table creation for PayTR
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS webhook_callbacks CASCADE;

CREATE TABLE payments (
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

-- Indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_merchant_oid ON payments(merchant_oid);
CREATE INDEX idx_payments_paytr_token ON payments(paytr_token);

-- Webhook callbacks table
CREATE TABLE webhook_callbacks (
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

CREATE INDEX idx_webhook_callbacks_merchant_oid ON webhook_callbacks(merchant_oid);
CREATE INDEX idx_webhook_callbacks_processed ON webhook_callbacks(processed);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();