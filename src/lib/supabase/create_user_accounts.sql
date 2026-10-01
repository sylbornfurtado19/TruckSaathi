-- ====================================================================================
-- TRUCKSAATHI: CREATE PROPER USER ACCOUNTS IN SUPABASE
-- ====================================================================================
-- Run this script in your Supabase Project's "SQL Editor" to create your proper
-- Admin, Fleet Manager, and Driver accounts.
--
-- Roles Supported:
--   - 'Company Admin': Full control tower, all 14+ modules, and user management
--   - 'Fleet Manager': Operations, Live Fleet, Trips, Predictive Maintenance, Fuel & P&L
--   - 'Driver': Direct routing to the Driver Field Portal & camera POD upload
-- ====================================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure default enterprise organization exists
INSERT INTO public.companies (id, legal_name, trade_name, gstin, pan)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'TruckSaathi Enterprise Logistics',
    'TruckSaathi Fleet',
    '27AAAAA0000A1Z5',
    'AAAAA0000A'
)
ON CONFLICT (id) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    trade_name = EXCLUDED.trade_name;

-- 3. Function to easily create or update a user account in both Supabase Auth & public.users
CREATE OR REPLACE FUNCTION public.create_trucksaathi_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_role TEXT,              -- 'Company Admin', 'Fleet Manager', or 'Driver'
    p_phone TEXT DEFAULT NULL,
    p_department TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_driver_id UUID;
    v_company_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_encrypted_pw TEXT;
    v_clean_role TEXT;
BEGIN
    -- Normalize role
    IF LOWER(p_role) IN ('admin', 'company admin', 'company_admin', 'super admin', 'superadmin') THEN
        v_clean_role := 'Company Admin';
    ELSIF LOWER(p_role) IN ('fleet manager', 'fleet_manager', 'manager') THEN
        v_clean_role := 'Fleet Manager';
    ELSIF LOWER(p_role) IN ('driver') THEN
        v_clean_role := 'Driver';
    ELSE
        v_clean_role := p_role;
    END IF;

    -- Encrypt password with pgcrypto Blowfish
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    -- Check if user already exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(p_email));

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            LOWER(TRIM(p_email)),
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object(
                'full_name', p_full_name,
                'role', v_clean_role,
                'company_id', v_company_id,
                'phone', p_phone,
                'department', COALESCE(p_department, CASE WHEN v_clean_role = 'Driver' THEN 'Fleet Logistics' WHEN v_clean_role = 'Fleet Manager' THEN 'Operations' ELSE 'Management' END)
            ),
            NOW(),
            NOW()
        );
    ELSE
        -- Update password and metadata for existing user
        UPDATE auth.users
        SET encrypted_password = v_encrypted_pw,
            raw_user_meta_data = jsonb_build_object(
                'full_name', p_full_name,
                'role', v_clean_role,
                'company_id', v_company_id,
                'phone', p_phone,
                'department', COALESCE(p_department, CASE WHEN v_clean_role = 'Driver' THEN 'Fleet Logistics' WHEN v_clean_role = 'Fleet Manager' THEN 'Operations' ELSE 'Management' END)
            ),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- If the account is a Driver, ensure an entry exists in public.drivers
    IF v_clean_role = 'Driver' THEN
        SELECT id INTO v_driver_id FROM public.drivers WHERE user_id = v_user_id OR phone = p_phone LIMIT 1;
        
        IF v_driver_id IS NULL THEN
            v_driver_id := gen_random_uuid();
            INSERT INTO public.drivers (
                id,
                user_id,
                company_id,
                full_name,
                phone,
                license_number,
                license_category,
                status
            )
            VALUES (
                v_driver_id,
                v_user_id,
                v_company_id,
                p_full_name,
                COALESCE(p_phone, '+91 98000 00000'),
                'IND-' || UPPER(SUBSTRING(MD5(p_email) FROM 1 FOR 10)),
                'HMV',
                'active'
            );
        ELSE
            UPDATE public.drivers
            SET user_id = v_user_id,
                full_name = p_full_name,
                phone = COALESCE(p_phone, phone)
            WHERE id = v_driver_id;
        END IF;
    END IF;

    -- Sync / insert into public.users table
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        company_id,
        department,
        status,
        phone,
        driver_id
    )
    VALUES (
        v_user_id,
        LOWER(TRIM(p_email)),
        p_full_name,
        v_clean_role,
        v_company_id,
        COALESCE(p_department, CASE WHEN v_clean_role = 'Driver' THEN 'Fleet Logistics' WHEN v_clean_role = 'Fleet Manager' THEN 'Operations' ELSE 'Management' END),
        'active',
        p_phone,
        v_driver_id
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        phone = EXCLUDED.phone,
        driver_id = COALESCE(EXCLUDED.driver_id, public.users.driver_id);

    RETURN v_user_id;
END;
$$;

-- ====================================================================================
-- 4. RUN QUERIES: PROVISION THE 3 PROPER ACCOUNTS DIRECTLY
-- ====================================================================================

-- Account 1: Admin
SELECT public.create_trucksaathi_user(
    'admin@trucksaathi.com',
    'Admin@TruckSaathi2026!',
    'Sylborn Furtado',
    'Company Admin',
    '+91 9876543210',
    'Executive Management'
);

-- Account 2: Fleet Manager
SELECT public.create_trucksaathi_user(
    'manager@trucksaathi.com',
    'Manager@TruckSaathi2026!',
    'Rajesh Varma',
    'Fleet Manager',
    '+91 9876543211',
    'Operations'
);

-- Account 3: Driver
SELECT public.create_trucksaathi_user(
    'driver@trucksaathi.com',
    'Driver@TruckSaathi2026!',
    'Ramesh Kumar',
    'Driver',
    '+91 9876543212',
    'Fleet Logistics'
);
