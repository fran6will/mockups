-- Add is_free column to products table
ALTER TABLE products ADD COLUMN is_free BOOLEAN DEFAULT FALSE;

-- Update RLS policies if necessary (usually public read is already enabled)
-- Ensure the API can read this column (it selects *)
