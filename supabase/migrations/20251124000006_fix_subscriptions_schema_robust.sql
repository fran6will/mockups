-- ROBUST FIX FOR SUBSCRIPTIONS TABLE
-- Run this entire script in your Supabase SQL Editor

-- 1. Cleanup duplicates (keep the most recently updated one)
-- This is required to add the UNIQUE constraint on user_id
DELETE FROM subscriptions
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (partition BY user_id ORDER BY updated_at DESC) as r
    FROM subscriptions
  ) t
  WHERE t.r > 1
);

-- 2. Add lemon_squeezy_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'lemon_squeezy_id') THEN
        ALTER TABLE subscriptions ADD COLUMN lemon_squeezy_id text;
    END IF;
END $$;

-- 3. Add unique constraint to lemon_squeezy_id (safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_lemon_squeezy_id_key') THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_lemon_squeezy_id_key UNIQUE (lemon_squeezy_id);
    END IF;
END $$;

-- 4. Add unique constraint to user_id (safely)
-- This allows the UPSERT to work correctly with onConflict: 'user_id'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key') THEN
        ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;
