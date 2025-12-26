-- Add images column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Optional: Backfill images from image_url if needed (so old products still have a gallery of 1)
UPDATE public.products 
SET images = ARRAY[image_url] 
WHERE images IS NULL OR cardinality(images) = 0 AND image_url IS NOT NULL;
