-- Create Banners Table
create table public.banners (
  id uuid default uuid_generate_v4() primary key,
  title text,
  description text,
  image_url text not null,
  link text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.banners enable row level security;

-- Policies
create policy "Banners are viewable by everyone" on banners
  for select using (true);

create policy "Admins can insert banners" on banners
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update banners" on banners
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete banners" on banners
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Create storage bucket for banner images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('banner-images', 'banner-images', true)
on conflict (id) do nothing;

-- Storage policies for banner-images
create policy "Banner images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'banner-images' );

create policy "Admins can upload banner images"
  on storage.objects for insert
  with check (
    bucket_id = 'banner-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
