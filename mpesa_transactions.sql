-- ======================================================
-- LIPA NA M-Pesa Transactions Table
-- Run this in your Supabase SQL Editor  
-- ======================================================

CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    checkout_request_id text UNIQUE NOT NULL,          -- Safaricom CheckoutRequestID
    merchant_request_id text,                           -- Safaricom MerchantRequestID
    phone_number        text NOT NULL,
    amount              numeric(10,2) NOT NULL,
    status              text NOT NULL DEFAULT 'PENDING', -- PENDING | SUCCESS | FAILED
    mpesa_receipt_number text,                          -- e.g. QFB12KL5RT
    result_code         integer,                        -- 0 = success, other = failure
    result_desc         text,
    raw_callback        jsonb,                          -- Full Safaricom callback payload
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Row level security (optional but recommended)
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (backend only)
CREATE POLICY "Service role only" ON public.mpesa_transactions
    USING (false)
    WITH CHECK (false);

-- Index for fast lookup by checkout_request_id (used in callback)
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_checkout_request_id
    ON public.mpesa_transactions(checkout_request_id);

-- Index for order lookups
CREATE INDEX IF NOT EXISTS idx_mpesa_transactions_order_id
    ON public.mpesa_transactions(order_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mpesa_transactions_updated_at
    BEFORE UPDATE ON public.mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
