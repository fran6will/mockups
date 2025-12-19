-- Add is_trending column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

-- Update the Supabase Schema Cache (sometimes required)
NOTIFY pgrst, 'reload config';
