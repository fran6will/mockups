-- SQL Script to safely delete a specific user and all their related data
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
  -- The User ID to delete
  target_user_id uuid := '5b8f7a7d-c212-4956-a2a6-8a1b266717bb';
BEGIN
  RAISE NOTICE 'Starting deletion for user: %', target_user_id;

  --------------------------------------------
  -- 1. APPLICATON DATA
  --------------------------------------------
  
  -- Delete Favorites
  DELETE FROM public.favorites WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted records from favorites';

  -- Delete Transactions
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted records from transactions';

  -- Delete User Credits
  DELETE FROM public.user_credits WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted records from user_credits';

  -- Delete Subscriptions
  DELETE FROM public.subscriptions WHERE user_id = target_user_id;
  RAISE NOTICE 'Deleted records from subscriptions';

  -- Delete Generations (Safely check if column exists)
  BEGIN
    DELETE FROM public.generations WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted records from generations';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Skipped generations (user_id column might not exist)';
  END;

  --------------------------------------------
  -- 2. STORAGE (Optional but recommended)
  --------------------------------------------
  -- Delete files uploaded by this user (e.g. mockups, logos)
  -- Note: This deletes the metadata. Examples:
  BEGIN
      DELETE FROM storage.objects WHERE owner = target_user_id;
      RAISE NOTICE 'Deleted files from storage.objects';
  EXCEPTION WHEN OTHERS THEN
       RAISE NOTICE 'Skipped storage deletion (check permissions)';
  END;

  --------------------------------------------
  -- 3. AUTH USER (The Root)
  --------------------------------------------
  DELETE FROM auth.users WHERE id = target_user_id;
  RAISE NOTICE 'Successfully deleted user from auth.users';

END $$;
