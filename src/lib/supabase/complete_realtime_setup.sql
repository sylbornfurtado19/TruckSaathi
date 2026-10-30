-- =========================================================================
-- TRUCKSAATHI: COMPLETE ONE-CLICK REALTIME SETUP SCRIPT
-- Execute this script in your Supabase Project -> SQL Editor
-- This enables all real-time tables, indexes, RLS policies, and publications.
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COMPANIES (Default System Organization)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name TEXT NOT NULL DEFAULT 'TruckSaathi Logistics Pvt Ltd',
    trade_name TEXT DEFAULT 'TruckSaathi Fleet',
    gstin VARCHAR(15) DEFAULT '27AABCT3518Q1Z5',
    pan VARCHAR(10) DEFAULT 'AABCT3518Q',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo company if empty
INSERT INTO public.companies (id, legal_name, trade_name)
SELECT 'a0000000-0000-0000-0000-000000000001'::uuid, 'TruckSaathi Logistics Pvt Ltd', 'TruckSaathi Fleet'
WHERE NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1);

-- 2. DRIVERS TABLE
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
    emergency_contact JSONB DEFAULT '{"name": "Family Contact", "phone": "+91 98000 00000", "relation": "Family"}'::jsonb,
    safety_events JSONB DEFAULT '{"overspeedCount": 0, "harshBrakingCount": 0, "rapidAccelCount": 0, "fatigueAlertCount": 0, "seatbeltViolationCount": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    reg_number VARCHAR(20) NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Container',
    make TEXT NOT NULL DEFAULT 'Tata Motors',
    model TEXT NOT NULL DEFAULT 'Signa 4825.T',
    payload_capacity_tons NUMERIC(8, 2) DEFAULT 30,
    maintenance_status TEXT DEFAULT 'in_service' CHECK (maintenance_status IN ('in_service', 'scheduled_maintenance', 'breakdown')),
    doc_status TEXT DEFAULT 'Compliant',
    chassis_number TEXT DEFAULT 'MAT628045M1290381',
    engine_number TEXT DEFAULT 'ENG89021349',
    rc_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '2 years'),
    insurance_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    fitness_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '2 years'),
    last_known_location JSONB DEFAULT '{"lat": 19.0760, "lng": 72.8777, "city": "Mumbai Hub"}'::jsonb,
    component_health JSONB DEFAULT '{"brakes": 85, "battery": 90, "engine": 92, "tyres": 80, "lastServiceDate": "2026-05-10", "predictedNextServiceDate": "2026-11-15"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default vehicles if table is empty
INSERT INTO public.vehicles (company_id, reg_number, category, make, model, payload_capacity_tons, maintenance_status)
SELECT 
    (SELECT id FROM public.companies LIMIT 1),
    v.reg, v.cat, v.make, v.model, v.cap, v.maint
FROM (VALUES
    ('MH-12-Q-4521', 'Container', 'Tata Motors', 'Signa 4825.T', 30.0, 'in_service'),
    ('KA-01-EA-9011', 'Trailer', 'Ashok Leyland', 'AVTR 5525', 35.0, 'in_service'),
    ('GJ-06-ZZ-3342', 'Open Body', 'Eicher', 'Pro 6028', 20.0, 'scheduled_maintenance'),
    ('HR-55-AB-1290', 'Tipper', 'BharatBenz', '2823R', 28.0, 'breakdown'),
    ('MH-04-JK-7810', 'Tanker', 'Tata Motors', 'Prima 3530.K', 25.0, 'in_service')
) AS v(reg, cat, make, model, cap, maint)
WHERE NOT EXISTS (SELECT 1 FROM public.vehicles LIMIT 1);

-- 4. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    trip_code TEXT NOT NULL,
    vehicle_reg TEXT,
    driver_name TEXT,
    origin JSONB NOT NULL,
    destination JSONB NOT NULL,
    cargo_description TEXT DEFAULT 'Commercial Freight',
    cargo_weight_tons NUMERIC(8, 2) DEFAULT 20.0,
    status TEXT NOT NULL DEFAULT 'In Transit' CHECK (
        status IN ('Scheduled', 'Assigned', 'Accepted', 'In Transit', 'Delayed', 'Delivered', 'Cancelled')
    ),
    scheduled_departure TIMESTAMPTZ DEFAULT now(),
    scheduled_arrival TIMESTAMPTZ DEFAULT (now() + INTERVAL '6 hours'),
    actual_departure TIMESTAMPTZ DEFAULT now(),
    actual_arrival TIMESTAMPTZ,
    progress_percent NUMERIC(5, 2) DEFAULT 45.0,
    distance_km NUMERIC(8, 2) DEFAULT 148.0,
    distance_remaining_km NUMERIC(8, 2) DEFAULT 81.4,
    current_location JSONB DEFAULT '{"lat": 18.7500, "lng": 73.4000, "city": "Lonavala Ghat Pass"}'::jsonb,
    current_checkpoint TEXT DEFAULT 'Lonavala Ghat Pass',
    next_milestone TEXT DEFAULT 'Talegaon Toll Plaza (32 km)',
    eway_bill_number TEXT DEFAULT 'EWB-8921-0941',
    eway_bill_expiry TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
    toll_spend_inr NUMERIC(10, 2) DEFAULT 480.0,
    fuel_spend_inr NUMERIC(10, 2) DEFAULT 3200.0,
    driver_advance_inr NUMERIC(10, 2) DEFAULT 5000.0,
    freight_revenue_inr NUMERIC(10, 2) DEFAULT 48000.0,
    pod_received BOOLEAN DEFAULT false,
    pod_notes TEXT,
    pod_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed an active trip if trips is empty
INSERT INTO public.trips (
    company_id, trip_code, vehicle_reg, driver_name, 
    origin, destination, cargo_description, cargo_weight_tons,
    status, progress_percent, distance_km, distance_remaining_km,
    current_checkpoint, next_milestone
)
SELECT 
    (SELECT id FROM public.companies LIMIT 1),
    'TRIP-MUM-PUN-101',
    'MH-12-Q-4521',
    'Ramesh Kumar',
    '{"hub": "Mumbai Bhiwandi Hub", "city": "Mumbai", "lat": 19.2968, "lng": 73.0630}'::jsonb,
    '{"hub": "Pune Chakan Logistics Park", "city": "Pune", "lat": 18.7606, "lng": 73.8567}'::jsonb,
    'Automotive Components & Engine Blocks',
    24.5,
    'In Transit',
    45.0,
    148.0,
    81.4,
    'Lonavala Ghat Pass',
    'Talegaon Toll Plaza (32 km)'
WHERE NOT EXISTS (SELECT 1 FROM public.trips LIMIT 1);

-- 5. VEHICLE LIVE STATE (Telemetry Synchronization)
CREATE TABLE IF NOT EXISTS public.vehicle_live_state (
    vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    vehicle_reg TEXT NOT NULL,
    driver_name TEXT,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 18.7500,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 73.4000,
    speed_kmh NUMERIC(6, 2) DEFAULT 62.0,
    fuel_percent NUMERIC(5, 2) DEFAULT 78.0,
    engine_temp_c NUMERIC(5, 2) DEFAULT 88.0,
    engine_rpm INTEGER DEFAULT 1820,
    odometer_km NUMERIC(10, 2) DEFAULT 124892.0,
    progress_percent NUMERIC(5, 2) DEFAULT 45.0,
    distance_remaining_km NUMERIC(8, 2) DEFAULT 81.4,
    current_checkpoint TEXT DEFAULT 'Lonavala Ghat Pass',
    next_milestone TEXT DEFAULT 'Talegaon Toll Plaza (32 km)',
    is_moving BOOLEAN DEFAULT true,
    is_sos BOOLEAN DEFAULT false,
    last_ping TIMESTAMPTZ DEFAULT now()
);

-- 6. EMERGENCY SOS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    driver_name TEXT NOT NULL,
    vehicle_reg TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    current_location TEXT NOT NULL,
    sos_type TEXT DEFAULT 'COLLISION_ALERT',
    status TEXT DEFAULT 'TRIGGERED' CHECK (status IN ('TRIGGERED', 'ACKNOWLEDGED', 'PATROL_DISPATCHED', 'RESOLVED')),
    notes TEXT,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 7. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- PERMISSIVE ROW LEVEL SECURITY (RLS) FOR SMOOTH OPERATIONS
-- =========================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_live_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop prior policies
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('companies', 'drivers', 'vehicles', 'trips', 'vehicle_live_state', 'emergency_events', 'activity_logs') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated and anon" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow all for authenticated and anon" ON public.%I FOR ALL TO authenticated, anon USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- =========================================================================
-- REALTIME PUBLICATION SUBSCRIPTION REGISTRATION
-- =========================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_live_state;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_events;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    EXCEPTION WHEN duplicate_object THEN END;
END $$;

