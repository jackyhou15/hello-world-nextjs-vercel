begin;
alter table public.generations add column if not exists image_path text;
alter table public.generations add column if not exists image_description text;
alter table public.generations add column if not exists image_prompt text;
create table if not exists public.saved_captions (
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, generation_id)
);
alter table public.saved_captions enable row level security;
create policy "Read own saved captions" on public.saved_captions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Save captions for yourself" on public.saved_captions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Remove own saved captions" on public.saved_captions
  for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on public.saved_captions to authenticated;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('caption-images', 'caption-images', true, 131072, array['image/svg+xml'])
on conflict (id) do nothing;
create policy "Read public caption illustrations" on storage.objects
  for select to anon, authenticated using (bucket_id = 'caption-images');
create policy "Upload own caption illustrations" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'caption-images' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Remove own caption illustrations" on storage.objects
  for delete to authenticated using (
    bucket_id = 'caption-images' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
commit;
