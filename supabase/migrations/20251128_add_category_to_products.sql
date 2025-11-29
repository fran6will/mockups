-- Add category column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
