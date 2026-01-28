-- Run this in your Supabase Dashboard SQL Editor AFTER the user has been created

-- 1. Check if user exists (just for your info)
SELECT id, email, created_at FROM auth.users WHERE email = 'mosesmwai100@gmail.com';

-- 2. Update the profile role to admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'mosesmwai100@gmail.com'
);

-- 3. Verify the role is set
SELECT * FROM public.profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'mosesmwai100@gmail.com'
);
