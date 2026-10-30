-- =========================================================================
-- TRUCKSAATHI: ENABLE DIRECT DRIVER MANAGEMENT FOR FLEET MANAGERS & ADMINS
-- Execute this script in your Supabase Project -> SQL Editor
-- =========================================================================

-- 1. Ensure public.drivers table exists and has proper schema
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(40) NOT NULL,
    license_category TEXT DEFAULT 'HMV',
    license_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '5 years'),
    aadhaar_number VARCHAR(20),
    experience_years INTEGER DEFAULT 5,
    assigned_vehicle TEXT DEFAULT 'Unassigned',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
    verification_status TEXT DEFAULT 'Fully Verified',
    safety_score INTEGER DEFAULT 92,
    emergency_contact JSONB DEFAULT '{"name": "Emergency Contact", "phone": "+91 98000 00000", "relation": "Family"}'::jsonb,
    safety_events JSONB DEFAULT '{"overspeedCount": 0, "harshBrakingCount": 0, "rapidAccelCount": 0, "fatigueAlertCount": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 3. Drop any outdated or restrictive RLS policies
DROP POLICY IF EXISTS "Management can insert company drivers" ON public.drivers;
DROP POLICY IF EXISTS "Management can update company drivers" ON public.drivers;
DROP POLICY IF EXISTS "Management can delete company drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow all to view drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow authenticated to insert drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow authenticated to update drivers" ON public.drivers;
DROP POLICY IF EXISTS "Allow authenticated to delete drivers" ON public.drivers;

-- 4. Create permissive policies for fleet operations
-- Read all drivers
CREATE POLICY "Allow all to view drivers" ON public.drivers
    FOR SELECT TO authenticated, anon
    USING (true);

-- Insert drivers (Fleet Managers, Super Admins, Authenticated and Anon demo users)
CREATE POLICY "Allow management to insert drivers" ON public.drivers
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

-- Update drivers
CREATE POLICY "Allow management to update drivers" ON public.drivers
    FOR UPDATE TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Delete drivers
CREATE POLICY "Allow management to delete drivers" ON public.drivers
    FOR DELETE TO authenticated, anon
    USING (true);

-- 5. Enable Realtime Replication for the drivers table
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;

