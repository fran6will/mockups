-- Add indexes for foreign keys to improve performance

-- favorites.product_id
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON public.favorites(product_id);

-- generations.product_id
CREATE INDEX IF NOT EXISTS idx_generations_product_id ON public.generations(product_id);

-- generations.user_id
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);

-- product_claims.product_id
CREATE INDEX IF NOT EXISTS idx_product_claims_product_id ON public.product_claims(product_id);

-- product_variants.product_id (Note: Check if table exists first, usually safe with IF NOT EXISTS on index if table exists, but if table is missing it errors. Assuming table exists based on linter report)
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- products.created_by
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);

-- products.user_id
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- transactions.user_id
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- user_credits.auth_user_id
CREATE INDEX IF NOT EXISTS idx_user_credits_auth_user_id ON public.user_credits(auth_user_id);
