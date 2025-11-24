-- Fix permissions for user_credits (The 406 Error)
alter table user_credits enable row level security;

create policy "Users can view own credits"
  on user_credits for select
  using (auth.uid() = user_id);

-- Fix permissions for subscriptions (The 400 Error)
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Grant access to authenticated users (sometimes needed explicitly)
grant select on user_credits to authenticated;
grant select on subscriptions to authenticated;
