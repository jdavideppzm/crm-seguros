
-- Seed migration to ensure admin access for the main user
DO $$ 
DECLARE
    target_user_id UUID;
    target_email TEXT := 'jdavidep@gmail.com';
BEGIN 
    -- 1. Find the user ID from auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NOT NULL THEN
        -- 2. Ensure profile exists
        INSERT INTO public.profiles (user_id, display_name, email, active)
        VALUES (target_user_id, 'Admin User', target_email, true)
        ON CONFLICT (user_id) DO UPDATE 
        SET display_name = EXCLUDED.display_name, active = true;

        -- 3. Ensure admin role exists
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- If user had 'vendedor' role, we might want to ensure they have 'admin'
        IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
            -- In case the conflict was on user_id but role was different (if we had a unique constraint on user_id)
            -- But our table doesn't have a unique constraint on user_id alone, it's (user_id, role) or none.
            -- Based on types.ts, there is no unique constraint on user_id.
            INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin');
        END IF;
    END IF;
END $$;
