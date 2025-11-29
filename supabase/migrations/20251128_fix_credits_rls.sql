-- Enable RLS on user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Drop potential existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;

-- Create the correct policy
-- We check both user_id and auth_user_id to be safe, as the schema definition has varied.
CREATE POLICY "Users can view own credits"
ON user_credits
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() = auth_user_id
);

-- Transactions Policy
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT user_id FROM user_credits 
    WHERE auth_user_id = auth.uid() OR user_id = auth.uid()
  )
);
