-- 1. Create Flash Sale Items Table
CREATE TABLE IF NOT EXISTS public.flash_sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    discount_percentage INTEGER CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;

-- Policies for Flash Sale Items
-- Everyone can read active flash sales
CREATE POLICY "Public can view active flash sales" 
ON public.flash_sale_items FOR SELECT 
USING (true);

-- Admins can insert/update/delete
CREATE POLICY "Admins can manage flash sales" 
ON public.flash_sale_items FOR ALL 
USING (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

-- 2. Storage Setup (Instructions for User)
-- You must create a public bucket named 'product-images' in Supabase Storage.

-- Storage Policies (Run these after creating the bucket)

-- Allow public read access to product-images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);
