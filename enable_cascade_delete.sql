/*
  ENABLE CASCADE DELETE SCRIPT
  Run this in your Supabase SQL Editor to make user deletion easy.
  
  What this does:
  1. Drops existing "blocking" foreign key constraints.
  2. Re-adds them with "ON DELETE CASCADE" (or SET NULL for products).
  
  Effect: When you delete a User from the Auth panel, all their history (credits, generations) 
  will simply disappear automatically.
*/

DO $$
BEGIN
    -- 1. Generations -> Auth Users (DROP)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'generations_user_id_fkey') THEN
        ALTER TABLE generations DROP CONSTRAINT generations_user_id_fkey;
    END IF;

    -- 2. User Credits -> Auth Users (DROP)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_credits_auth_user_id_fkey') THEN
        ALTER TABLE user_credits DROP CONSTRAINT user_credits_auth_user_id_fkey;
    END IF;

    -- 3. Transactions -> User Credits (DROP)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_id_fkey') THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_user_id_fkey;
    END IF;

    -- 4. Product Claims -> User Credits (DROP)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_claims_user_id_fkey') THEN
        ALTER TABLE product_claims DROP CONSTRAINT product_claims_user_id_fkey;
    END IF;

    -- 5. Subscriptions -> Auth Users (DROP)
    -- Checking schema, typically exists for 'subscriptions' table if present
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_fkey') THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
    END IF;

END $$;

-- RE-ADD WITH CASCADE

-- 1. Generations: Delete history if user is gone
ALTER TABLE generations
ADD CONSTRAINT generations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. User Credits: Delete wallet if user is gone
ALTER TABLE user_credits
ADD CONSTRAINT user_credits_auth_user_id_fkey
FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Transactions: Delete ledger if wallet is gone (Cascades from #2)
ALTER TABLE transactions
ADD CONSTRAINT transactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_credits(user_id) ON DELETE CASCADE;

-- 4. Product Claims: Delete claims if wallet/user is gone
ALTER TABLE product_claims
ADD CONSTRAINT product_claims_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_credits(user_id) ON DELETE CASCADE;

-- 5. Subscriptions: Cancel/Delete if user is gone
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- NOTE: Products are NOT cascaded. If an Admin/Creator is deleted, 
-- their products typically stay (or you can manually set ON DELETE SET NULL).
-- We leave them as is for safety.
