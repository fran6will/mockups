-- Batch update categories based on keywords in title or slug

-- Men's Clothing (Hoodies, Sweatshirts, Men's Tees)
UPDATE products
SET category = 'Men''s Clothing'
WHERE category IS NULL
AND (
  title ILIKE '%hoodie%' OR slug ILIKE '%hoodie%' OR
  title ILIKE '%sweatshirt%' OR slug ILIKE '%sweatshirt%' OR
  title ILIKE '%men%' OR slug ILIKE '%men%'
);

-- Women's Clothing (Women's Tees, Tanks, Crops)
UPDATE products
SET category = 'Women''s Clothing'
WHERE category IS NULL
AND (
  title ILIKE '%women%' OR slug ILIKE '%women%' OR
  title ILIKE '%tee%' OR slug ILIKE '%tee%' OR
  title ILIKE '%shirt%' OR slug ILIKE '%shirt%' OR
  title ILIKE '%crop%' OR slug ILIKE '%crop%' OR
  title ILIKE '%tank%' OR slug ILIKE '%tank%'
);

-- Kids' Clothing (Onesies, Youth, Toddler)
UPDATE products
SET category = 'Kids'' Clothing'
WHERE category IS NULL
AND (
  title ILIKE '%kid%' OR slug ILIKE '%kid%' OR
  title ILIKE '%baby%' OR slug ILIKE '%baby%' OR
  title ILIKE '%onesie%' OR slug ILIKE '%onesie%' OR
  title ILIKE '%youth%' OR slug ILIKE '%youth%' OR
  title ILIKE '%toddler%' OR slug ILIKE '%toddler%'
);

-- Accessories (Totes, Hats, Caps, Phone Cases)
UPDATE products
SET category = 'Accessories'
WHERE category IS NULL
AND (
  title ILIKE '%tote%' OR slug ILIKE '%tote%' OR
  title ILIKE '%bag%' OR slug ILIKE '%bag%' OR
  title ILIKE '%hat%' OR slug ILIKE '%hat%' OR
  title ILIKE '%cap%' OR slug ILIKE '%cap%' OR
  title ILIKE '%case%' OR slug ILIKE '%case%'
);

-- Home & Living (Mugs, Frames, Canvas, Pillows)
UPDATE products
SET category = 'Home & Living'
WHERE category IS NULL
AND (
  title ILIKE '%mug%' OR slug ILIKE '%mug%' OR
  title ILIKE '%cup%' OR slug ILIKE '%cup%' OR
  title ILIKE '%frame%' OR slug ILIKE '%frame%' OR
  title ILIKE '%canvas%' OR slug ILIKE '%canvas%' OR
  title ILIKE '%poster%' OR slug ILIKE '%poster%' OR
  title ILIKE '%pillow%' OR slug ILIKE '%pillow%' OR
  title ILIKE '%wall%' OR slug ILIKE '%wall%'
);

-- Default everything else to Accessories if still null (Optional, commented out for safety)
-- UPDATE products SET category = 'Accessories' WHERE category IS NULL;
