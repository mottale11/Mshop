-- Create REVIEWS Table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  full_name text, -- Optional: Cache user name here or join with profiles
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Users can insert own reviews" on reviews for insert with check (auth.uid() = user_id);
-- Optionally update product rating stats on insert (advanced, skipping for now)

-- Dummy Data for display
insert into public.reviews (user_id, product_id, rating, comment, full_name, created_at)
select 
  id as user_id, 
  (select id from products limit 1) as product_id,
  5 as rating,
  'good. I like it', 
  'Auleria',
  now() - interval '1 day'
from auth.users limit 1;

insert into public.reviews (user_id, product_id, rating, comment, full_name, created_at)
select 
  id as user_id, 
  (select id from products limit 1) as product_id,
  5 as rating,
  'I like it. So far working very well for the 3rd month now', 
  'SHEM',
  now() - interval '2 days'
from auth.users limit 1;
