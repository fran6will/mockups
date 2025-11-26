-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('mockup-bases', 'mockup-bases', true)
on conflict (id) do nothing;

-- Enable RLS (Commented out as it usually requires superuser/owner and is enabled by default)
-- alter table storage.objects enable row level security;

-- Allow public read access to all files in the bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'mockup-bases' );

-- Allow authenticated users to upload files
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'mockup-bases' );

-- Allow authenticated users to update their own files (optional, but good for edits)
create policy "Authenticated Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'mockup-bases' );

-- Allow authenticated users to delete files
create policy "Authenticated Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'mockup-bases' );
