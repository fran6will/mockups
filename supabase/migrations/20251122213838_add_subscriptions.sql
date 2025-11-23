-- Create 'subscriptions' table for Lemon Squeezy
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  status text not null,
  variant_id text not null,
  customer_id text not null,
  renews_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS for subscriptions
alter table subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on subscriptions for select
  to authenticated
  using ( auth.uid() = user_id );

-- Add 'is_pro_included' to products
alter table products add column is_pro_included boolean default true;
