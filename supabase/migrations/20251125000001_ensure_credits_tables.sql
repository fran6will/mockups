-- Create user_credits table if it doesn't exist
create table if not exists user_credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null unique,
  auth_user_id uuid references auth.users(id), -- Redundant but used in code
  email text,
  balance integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table if it doesn't exist
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  amount integer not null,
  type text not null, -- 'credit', 'debit'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_credits enable row level security;
alter table transactions enable row level security;

-- Policies for user_credits
create policy "Users can view their own credits"
  on user_credits for select
  using (auth.uid() = user_id);

-- Policies for transactions
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);
