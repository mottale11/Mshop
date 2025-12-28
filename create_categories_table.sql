-- Create CATEGORIES Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique, -- 'Electronics', 'Fashion'
  slug text not null unique, -- 'electronics', 'fashion'
  parent_id uuid references public.categories(id), -- For subcategories
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies
create policy "Categories are viewable by everyone" on categories for select using (true);
create policy "Admins can insert categories" on categories for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update categories" on categories for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete categories" on categories for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Seed initial categories (optional, based on what exists)
insert into public.categories (name, slug) values
('Phones & Tablets', 'phones-tablets'),
('Fashion', 'fashion'),
('Home & Office', 'home-office'),
('Computing', 'computing'),
('Electronics', 'electronics'),
('Health & Beauty', 'health-beauty'),
('Baby Products', 'baby-products'),
('Watches', 'watches')
on conflict (slug) do nothing;
