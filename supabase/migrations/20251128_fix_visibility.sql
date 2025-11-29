-- Fix visibility: Set all existing products to public
UPDATE products SET is_public = true;

-- Update/Ensure Public Access Policy
-- This ensures that only products marked as public are visible to everyone
DROP POLICY IF EXISTS "Public products access" ON products;
CREATE POLICY "Public products access" ON products FOR SELECT USING (is_public = true);
