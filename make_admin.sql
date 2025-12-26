-- 1. Update your user to be an admin
-- REPLACE 'your_email@example.com' matches the email you used to login
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your_email@example.com';

-- 2. Verify the update
SELECT * FROM public.profiles WHERE role = 'admin';

-- 3. (Optional) If you want to disable RLS checks for storage temporarily (NOT RECOMMENDED for production):
-- DROP POLICY "Admins can upload images" ON storage.objects;
-- CREATE POLICY "Allow all authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
