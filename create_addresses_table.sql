create table public.user_addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  first_name text not null,
  last_name text not null,
  phone_prefix text default '+254',
  phone_number text not null,
  additional_phone_prefix text,
  additional_phone_number text,
  address text not null,
  additional_info text,
  region text not null,
  city text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_addresses enable row level security;

-- Policies
create policy "Users can view own addresses" on user_addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on user_addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on user_addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on user_addresses for delete using (auth.uid() = user_id);
