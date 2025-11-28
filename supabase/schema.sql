-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create 'products' table
create table products (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  password_hash text not null,
  base_image_url text not null, -- URL to the 4K base image in Storage
  gallery_image_url text, -- Optional: Different image for the gallery/storefront
  custom_prompt text default '', -- Custom instructions for the AI generation
  overlay_config jsonb not null default '{}'::jsonb, -- Stores coordinates, prompt hints, etc.
  tags text[] default '{}', -- Array of tags for filtering
  user_id uuid references auth.users(id), -- Link to the admin user who created it
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_public boolean default false,
  created_by uuid references auth.users(id)
);

-- Create 'downloads' table (optional tracking)
create table downloads (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) not null,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create 'generations' table (usage tracking)
create table generations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references products(id),
  status text not null,
  duration_ms integer,
  error_message text,
  meta jsonb default '{}'::jsonb,
  user_id uuid references auth.users(id), -- Link to the authenticated user
  image_url text -- URL to the generated image in Storage
);

-- Storage Bucket for Generated Mockups
insert into storage.buckets (id, name, public)
values ('generated-mockups', 'generated-mockups', true)
on conflict (id) do nothing;

create policy "Public Access to Generated Mockups"
  on storage.objects for select
  using ( bucket_id = 'generated-mockups' );

create policy "Auth Upload Generated Mockups"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'generated-mockups' );

-- Create 'user_credits' table
create table user_credits (
  user_id uuid primary key default uuid_generate_v4(), -- Using uuid as a simple user identifier for now (mapped to email)
  email text unique not null,
  balance integer default 0 not null,
  total_purchased integer default 0 not null,
  total_used integer default 0 not null,
  auth_user_id uuid references auth.users(id), -- Link to the authenticated user (optional, for guest->user migration)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create 'transactions' table
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_credits(user_id) not null,
  amount integer not null,
  type text not null check (type in ('credit', 'debit')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create 'product_claims' table to prevent double dipping on the same product
create table product_claims (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references user_credits(user_id) not null,
  product_id uuid references products(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- RLS Policies
alter table products enable row level security;
alter table downloads enable row level security;
alter table generations enable row level security;
alter table user_credits enable row level security;
alter table transactions enable row level security;
alter table product_claims enable row level security;

-- Public read access for products (needed for the password gate check, but maybe restrict columns in a real app)
-- For now, we allow reading products by slug to verify existence/password.
create policy "Public products access"
  on products for select
  using ( true );

-- Admin only write access
create policy "Admin insert products"
  on products for insert
  to authenticated
  with check ( auth.uid() = user_id );

create policy "Admin update products"
  on products for update
  to authenticated
  using ( auth.uid() = user_id );

-- Storage Bucket Setup (Script to be run in SQL Editor)
-- Bucket: 'mockup-bases' (Public read, Authenticated write)
insert into storage.buckets (id, name, public)
values ('mockup-bases', 'mockup-bases', true)
on conflict (id) do nothing;

create policy "Public Access to Mockups"
  on storage.objects for select
  using ( bucket_id = 'mockup-bases' );

create policy "Auth Upload Mockups"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'mockup-bases' );
