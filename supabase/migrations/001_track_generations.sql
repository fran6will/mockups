-- Run this in your Supabase SQL Editor to enable tracking

create table generations (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references products(id),
  status text not null, -- 'success' or 'error'
  duration_ms integer,
  error_message text,
  meta jsonb default '{}'::jsonb -- Store extra info like aspect ratio, etc.
);

-- Enable RLS (optional for now, but good practice)
alter table generations enable row level security;

-- Allow the service role (server-side) to insert logs
-- (We don't need a specific policy for service role bypass, but we can add one for viewing if needed later)
create policy "Enable read access for authenticated users only"
on generations for select
to authenticated
using (true);
