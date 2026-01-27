-- Add shipping_fees jsonb column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shipping_fees JSONB DEFAULT '[]'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.products.shipping_fees IS 'Array of shipping rules: [{county, town, fee}]';
