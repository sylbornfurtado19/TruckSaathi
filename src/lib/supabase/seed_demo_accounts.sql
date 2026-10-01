-- =========================================================================
-- TruckSaathi Demo & Production Account Seed Script
-- Accounts:
--   1. Admin:         sylborn@trucksaathi.in (Company Admin)
--   2. Fleet Manager: rajesh.v@trucksaathi.in (Fleet Manager)
--   3. Driver:        ramesh.k@trucksaathi.in (Driver)
-- Password for all seed accounts: TruckSaathi@2026
-- =========================================================================

-- 1. Ensure uuid-ossp and pgcrypto extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Seed Default Enterprise Organization
INSERT INTO public.companies (id, legal_name, trade_name, gstin, pan)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Mahindra Logistics India',
    'TruckSaathi Enterprise Fleet',
    '27AAAAA0000A1Z5',
    'AAAAA0000A'
)
ON CONFLICT (id) DO UPDATE SET
    legal_name = EXCLUDED.legal_name,
    trade_name = EXCLUDED.trade_name;

-- 3. Seed Driver in public.drivers (for Ramesh Kumar)
INSERT INTO public.drivers (
    id,
    company_id,
    full_name,
    phone,
    license_number,
    license_category,
    license_expiry,
    aadhaar_number,
    experience_years,
    status
)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Ramesh Kumar',
    '+91 98765 43210',
    'MH12 20150091234',
    'HMV',
    '2028-04-12',
    '9012 3456 7890',
    8,
    'active'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    license_number = EXCLUDED.license_number;

-- 4. Seed Auth Users into auth.users (Supabase Auth)
-- Note: Uses standard Supabase password hashing with pgcrypto crypt()
DO $$
DECLARE
  v_company_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_driver_id UUID := 'd0000000-0000-0000-0000-000000000001';
  v_admin_id UUID := 'u0000000-0000-0000-0000-000000000001';
  v_manager_id UUID := 'u0000000-0000-0000-0000-000000000002';
  v_driver_user_id UUID := 'u0000000-0000-0000-0000-000000000003';
  v_encrypted_pw TEXT;
BEGIN
  v_encrypted_pw := crypt('TruckSaathi@2026', gen_salt('bf'));

  -- Account 1: Admin (Sylborn Furtado)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_admin_id,
    'authenticated',
    'authenticated',
    'sylborn@trucksaathi.in',
    v_encrypted_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'full_name', 'Sylborn Furtado',
      'role', 'Company Admin',
      'company_id', v_company_id,
      'department', 'Executive Management'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- Account 2: Fleet Manager (Rajesh Varma)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_manager_id,
    'authenticated',
    'authenticated',
    'rajesh.v@trucksaathi.in',
    v_encrypted_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'full_name', 'Rajesh Varma',
      'role', 'Fleet Manager',
      'company_id', v_company_id,
      'department', 'Operations'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- Account 3: Driver (Ramesh Kumar)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_driver_user_id,
    'authenticated',
    'authenticated',
    'ramesh.k@trucksaathi.in',
    v_encrypted_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'full_name', 'Ramesh Kumar',
      'role', 'Driver',
      'driver_id', v_driver_id,
      'company_id', v_company_id,
      'department', 'Fleet Logistics'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

  -- 5. Seed / Sync in public.users table
  INSERT INTO public.users (id, email, full_name, role, company_id, department, status, driver_id)
  VALUES
    (v_admin_id, 'sylborn@trucksaathi.in', 'Sylborn Furtado', 'Company Admin', v_company_id, 'Executive Management', 'active', NULL),
    (v_manager_id, 'rajesh.v@trucksaathi.in', 'Rajesh Varma', 'Fleet Manager', v_company_id, 'Operations', 'active', NULL),
    (v_driver_user_id, 'ramesh.k@trucksaathi.in', 'Ramesh Kumar', 'Driver', v_company_id, 'Fleet Logistics', 'active', v_driver_id)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    driver_id = EXCLUDED.driver_id;

  -- Update user_id on drivers table for Ramesh Kumar
  UPDATE public.drivers SET user_id = v_driver_user_id WHERE id = v_driver_id;

END $$;
