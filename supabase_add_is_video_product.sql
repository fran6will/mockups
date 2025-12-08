-- Add is_video_product column to products table
-- This column indicates whether an Etsy product includes video generation credits

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_video_product BOOLEAN DEFAULT FALSE;

-- Add a comment to explain the column purpose
COMMENT ON COLUMN products.is_video_product IS 'When true, Etsy buyers claiming this product will receive 25 extra credits for video generation';

-- Optionally update existing video products if you know their IDs
-- UPDATE products SET is_video_product = true WHERE slug = 'coffee-mug-01';
