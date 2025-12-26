-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  first_name text,
  last_name text,
  role text default 'customer', -- 'admin' or 'customer'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. PRODUCTS Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null,
  old_price numeric,
  stock integer default 0,
  category text,
  image_url text,
  rating numeric default 0,
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Products
alter table public.products enable row level security;

-- Policies for Products
create policy "Products are viewable by everyone" on products for select using (true);
create policy "Admins can insert products" on products for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update products" on products for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete products" on products for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 3. ORDERS Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  total_amount numeric not null,
  status text default 'Processing', -- 'Pending', 'Processing', 'Delivered', 'Cancelled'
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Orders
alter table public.orders enable row level security;

-- Policies for Orders
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders" on orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);

-- 4. ORDER ITEMS Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id),
  quantity integer default 1,
  price numeric not null
);

-- Enable RLS for Order Items
alter table public.order_items enable row level security;

-- Policies for Order Items
create policy "Users can view own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Admins can view all order items" on order_items for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert own order items" on order_items for insert with check (
   exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- 5. WISHLIST Table
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references public.products(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Enable RLS for Wishlist
alter table public.wishlist enable row level security;

-- Policies for Wishlist
create policy "Users can view own wishlist" on wishlist for select using (auth.uid() = user_id);
create policy "Users can insert into own wishlist" on wishlist for insert with check (auth.uid() = user_id);
create policy "Users can delete from own wishlist" on wishlist for delete using (auth.uid() = user_id);

-- 6. Trigger to create Profile on User Sign Up (Optional but recommended)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (new.id, new.email, '', '');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Insert Dummy Data (Optional, run if you want initial data)
insert into public.products (title, description, price, old_price, stock, category, image_url)
values
('Wireless Headphones', 'High quality noise cancelling headphones.', 120.00, 150.00, 50, 'Electronics', ''),
('Smart Watch', 'Fitness tracker with heart rate monitor.', 199.50, 250.00, 30, 'Wearables', ''),
('Running Shoes', 'Comfortable sneakers for daily running.', 89.99, 120.00, 100, 'Fashion', '');
