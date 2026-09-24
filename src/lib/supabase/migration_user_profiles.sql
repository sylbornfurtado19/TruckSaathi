-- =========================================================================
-- TruckSaathi Database Migration: User Profiles, Roles, and RLS
-- Target: Supabase PostgreSQL
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure Companies Table Exists & Seed Default Enterprise Tenant
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    gstin VARCHAR(15) UNIQUE,
    pan VARCHAR(10),
    mto_number TEXT,
    logo_url TEXT,
    address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default company so foreign key constraints resolve cleanly
INSERT INTO public.companies (id, legal_name, trade_name, gstin, pan)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Mahindra Logistics India',
    'TruckSaathi Enterprise Fleet',
    '27AAAAA0000A1Z5',
    'AAAAA0000A'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create or Update Users (Application Profiles) Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Company Admin' CHECK (role IN ('Super Admin', 'Company Admin', 'Fleet Manager', 'Dispatcher', 'Driver')),
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    role_id UUID,
    branch_id UUID,
    phone TEXT,
    department TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns if public.users was already created from a previous migration
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Company Admin' CHECK (role IN ('Super Admin', 'Company Admin', 'Fleet Manager', 'Dispatcher', 'Driver'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department TEXT;

-- 4. Enable Row Level Security (RLS) on Users Table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflict on rerun
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users in same company can view each other" ON public.users;

-- Policy: Authenticated users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Policy: Authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy: Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- 5. Tenant Isolation Helper Function
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policy: Users in the same company can view teammate profiles
CREATE POLICY "Users in same company can view each other" ON public.users
    FOR SELECT TO authenticated
    USING (
      company_id IS NOT NULL AND company_id = public.get_auth_company_id()
    );

-- 6. Supabase Auth Automatic Profile Creation Trigger
-- Whenever a user is created via Supabase Auth (email signup or admin invite),
-- this trigger automatically provisions their profile in public.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_comp_id UUID;
BEGIN
  -- Grab first company or fallback to seeded tenant
  SELECT id INTO default_comp_id FROM public.companies LIMIT 1;

  INSERT INTO public.users (id, email, full_name, role, company_id, phone, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.raw_user_meta_data->>'role',
      'Company Admin'
    ),
    COALESCE(
      (new.raw_user_meta_data->>'company_id')::UUID,
      default_comp_id
    ),
    new.raw_user_meta_data->>'phone',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = COALESCE(EXCLUDED.role, public.users.role);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Backfill: If any user was created in auth.users prior to this migration, backfill into public.users
INSERT INTO public.users (id, email, full_name, role, company_id, status)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'Company Admin'),
    (SELECT id FROM public.companies LIMIT 1),
    'active'
FROM auth.users au
ON CONFLICT (id) DO NOTHING;
