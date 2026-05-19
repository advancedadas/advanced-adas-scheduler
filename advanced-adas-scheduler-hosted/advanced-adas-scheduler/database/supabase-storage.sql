-- Run this in Supabase SQL Editor after creating your project.
-- It creates a public bucket for job photos. The API uploads with the service role key.
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do update set public = true;

-- Public read policy for uploaded job photos.
create policy "Public read job photos"
on storage.objects for select
using (bucket_id = 'job-photos');
