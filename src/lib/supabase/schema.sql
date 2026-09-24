-- TruckSaathi Series-A Enterprise Supabase Database Schema DDL & RLS Policies
-- Target DB: PostgreSQL (Supabase)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
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

-- 2. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_name TEXT NOT NULL,
    branch_code VARCHAR(20),
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false
);

-- 4. USERS TABLE (Application Profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Company Admin' CHECK (role IN ('Super Admin', 'Company Admin', 'Fleet Manager', 'Dispatcher', 'Driver')),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    phone TEXT,
    department TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone VARCHAR(15) NOT NULL,
    emergency_contact JSONB,
    license_number VARCHAR(30) NOT NULL,
    license_category TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    aadhaar_number VARCHAR(12),
    experience_years INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    reg_number VARCHAR(20) NOT NULL UNIQUE,
    category TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    chassis_number TEXT,
    engine_number TEXT,
    payload_capacity_tons NUMERIC(8, 2),
    maintenance_status TEXT DEFAULT 'in_service' CHECK (maintenance_status IN ('in_service', 'scheduled_maintenance', 'breakdown')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VEHICLE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('rc', 'insurance', 'fitness', 'permit', 'puc')),
    doc_number TEXT,
    expiry_date DATE NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policy Function
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Vehicle Tenant Isolation Policy
CREATE POLICY "Tenant vehicles isolation" ON public.vehicles
    FOR ALL USING (company_id = public.get_auth_company_id());

-- Driver Tenant Isolation Policy
CREATE POLICY "Tenant drivers isolation" ON public.drivers
    FOR ALL USING (company_id = public.get_auth_company_id());

-- User Profile RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Automatic Auth Profile Provisioning Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_comp_id UUID;
BEGIN
  SELECT id INTO default_comp_id FROM public.companies LIMIT 1;

  INSERT INTO public.users (id, email, full_name, role, company_id, phone, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'Company Admin'),
    COALESCE((new.raw_user_meta_data->>'company_id')::UUID, default_comp_id),
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
