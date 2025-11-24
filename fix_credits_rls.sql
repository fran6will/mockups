-- Enable RLS on user_credits if not already enabled
alter table user_credits enable row level security;

-- Allow users to view their own credits
create policy "Users can view own credits"
  on user_credits for select
  using (auth.uid() = user_id);

-- Allow users to insert their own credits (if needed, though usually server-side)
-- For now, we only need select for the UI.
