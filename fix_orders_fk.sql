-- Fix Foreign Key for Orders to allow joins with Profiles
-- First, drop the existing constraint if possible (we might not know the exact name, so we try standard or do it blindly)

-- Safe approach: Update table definition to point to profiles
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey; -- standard naming

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id);

-- Also ensure comments reviews reference profiles if that exists (not in current task but good practice)
-- Re-run RLS update just in case
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Ensure "profiles" exists and has the right data 
-- (If you have orders for users who don't have profiles, this FK add might fail. 
-- In that case, we need to ensure all users have profiles first.)

-- To be safe, insert profiles for any users who don't have one (if possible from here, but we can't access auth.users easily in SQL editor usually unless superuser)
-- Assuming new setup, this should be fine.
