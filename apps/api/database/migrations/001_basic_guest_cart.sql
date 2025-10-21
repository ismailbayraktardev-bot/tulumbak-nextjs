-- Basic guest cart support - add columns first
ALTER TABLE carts
ADD COLUMN IF NOT EXISTS guest_cart_id VARCHAR(36) UNIQUE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_token VARCHAR(255);