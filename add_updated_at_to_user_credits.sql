-- Add updated_at column to user_credits if it doesn't exist
alter table user_credits 
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Reload the schema cache to ensure Supabase API picks it up
NOTIFY pgrst, 'reload schema';
