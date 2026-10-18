-- Gym Juno private archive: run only in the dedicated FREE Supabase project.
-- Never create a public bucket. Invite the owner's email using Supabase Authentication.
-- All photo bytes are accessible only to their authenticated owner.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('gym-juno-private','gym-juno-private',false,15728640,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=15728640,allowed_mime_types=excluded.allowed_mime_types;

create policy "GymJuno select own originals" on storage.objects for select to authenticated
using (bucket_id='gym-juno-private' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "GymJuno insert own originals" on storage.objects for insert to authenticated
with check (bucket_id='gym-juno-private' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "GymJuno update own originals" on storage.objects for update to authenticated
using (bucket_id='gym-juno-private' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='gym-juno-private' and (storage.foldername(name))[1]=auth.uid()::text);
-- No delete policy: irreversible removal deliberately requires admin authorization.
-- Avoid creating public read policies. Do not expose the service_role secret.
