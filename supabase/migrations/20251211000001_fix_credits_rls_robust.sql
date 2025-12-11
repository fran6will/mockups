-- Robust fix for user_credits RLS and permissions

-- 1. Ensure RLS is enabled
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Service role content" ON user_credits;

-- 3. Create permissive SELECT policy for owners
-- Allow finding row by either user_id OR auth_user_id column
CREATE POLICY "Users can view own credits"
ON user_credits FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() = auth_user_id
);

-- 4. Create INSERT policy (so users technically *could* insert their own record if we wanted, though admin handles it)
-- This is useful if we switch to client-side creation, but for now we keep it restrictive or admin-only.
-- Actually, let's keep INSERT restricted to service role (no policy for ANON/USER means deny).

-- 5. Grant usage to authenticated users (just in case)
GRANT SELECT ON user_credits TO authenticated;
GRANT SELECT ON user_credits TO service_role;
GRANT ALL ON user_credits TO service_role;

-- 6. Ensure transactions RLS is also robust
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

GRANT SELECT ON transactions TO authenticated;
