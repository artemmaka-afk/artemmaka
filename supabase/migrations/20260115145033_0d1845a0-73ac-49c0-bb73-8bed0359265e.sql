-- Create public bucket for project media (images, videos, gifs)
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do update set public = excluded.public;

-- Public read access to project media
create policy "Project media is publicly readable"
on storage.objects
for select
using (bucket_id = 'project-media');

-- Admins can upload project media
create policy "Admins can upload project media"
on storage.objects
for insert
with check (
  bucket_id = 'project-media'
  and has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update project media
create policy "Admins can update project media"
on storage.objects
for update
using (
  bucket_id = 'project-media'
  and has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete project media
create policy "Admins can delete project media"
on storage.objects
for delete
using (
  bucket_id = 'project-media'
  and has_role(auth.uid(), 'admin'::app_role)
);
