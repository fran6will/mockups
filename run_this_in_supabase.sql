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

-- Create 'product_variants' table
create table product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  name text not null,
  base_image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS for product_variants
alter table product_variants enable row level security;

create policy "Public can view variants"
  on product_variants for select
  to anon, authenticated
  using (true);

create policy "Admins can insert variants"
  on product_variants for insert
  to authenticated
  with check (
    auth.jwt() ->> 'email' = 'francis.w.rheaume@gmail.com'
  );

create policy "Admins can delete variants"
  on product_variants for delete
  to authenticated
  using (
    auth.jwt() ->> 'email' = 'francis.w.rheaume@gmail.com'
  );
