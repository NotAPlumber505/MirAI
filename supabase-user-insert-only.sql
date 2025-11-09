-- Simple fix: Just insert existing auth users into the users table
-- This is 100% safe - no destructive operations

INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Check how many users were inserted
SELECT COUNT(*) as user_count FROM public.users;
