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
  custom_prompt text default '', -- Custom instructions for the AI generation
  overlay_config jsonb not null default '{}'::jsonb, -- Stores coordinates, prompt hints, etc.
  user_id uuid references auth.users(id) -- Link to the admin user who created it
);

-- Create 'downloads' table (optional tracking)
create table downloads (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) not null,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table products enable row level security;
alter table downloads enable row level security;

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
