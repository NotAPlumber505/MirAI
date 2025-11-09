-- Fix for foreign key constraint error in usersplants table
-- Your users table already exists with the correct structure.
-- This script just needs to:
-- 1. Insert existing auth users into the users table
-- 2. Create a trigger to auto-populate it for new signups

-- Step 1: Insert any existing auth users into the users table
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create a function that will insert into users table when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a trigger that runs when a user signs up (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END;
$$;

-- Verify the users table now has records
SELECT COUNT(*) as user_count FROM public.users;
SELECT * FROM public.users;
