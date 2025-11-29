-- Enable RLS on product_claims (already enabled, but safe to repeat)
ALTER TABLE product_claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Users can view own claims" ON product_claims;

-- Create Policy: Users can view their own claims
-- We need to link product_claims.user_id (which is the user_credits PK)
-- to the auth.uid() via the user_credits table.

CREATE POLICY "Users can view own claims"
ON product_claims
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT user_id FROM user_credits
    WHERE auth_user_id = auth.uid()
  )
);
