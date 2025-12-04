-- Create the etsy_links table
create table if not exists public.etsy_links (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text not null unique,
  product_id uuid references public.products(id) on delete cascade,
  google_drive_url text not null
);

-- Add RLS policies (adjust as needed, currently public read for download page)
alter table public.etsy_links enable row level security;

-- Allow public read access (so the download page can fetch it)
create policy "Enable read access for all users"
on public.etsy_links for select
using (true);

-- Allow admin write access (assuming admin uses service role or specific user check)
-- For now, we'll allow authenticated users to insert/update if they are admins
-- But since we are using the supabase client in admin page which checks for session,
-- we might need a policy for insert/update/delete.
-- Ideally, restrict this to the admin email.

create policy "Enable insert for admin users"
on public.etsy_links for insert
with check (auth.jwt() ->> 'email' = 'francis.w.rheaume@gmail.com');

create policy "Enable update for admin users"
on public.etsy_links for update
using (auth.jwt() ->> 'email' = 'francis.w.rheaume@gmail.com');

create policy "Enable delete for admin users"
on public.etsy_links for delete
using (auth.jwt() ->> 'email' = 'francis.w.rheaume@gmail.com');
