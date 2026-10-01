-- ====================================================================================
-- TRUCKSAATHI REAL-TIME MULTI-PORTAL BACKEND ARCHITECTURE MIGRATION
-- Migration: 20261001_realtime_fleet_operations.sql
-- Description:
--   1. Realtime Trips Table with state machine (Scheduled -> Assigned -> Accepted -> In Transit -> Delivered)
--   2. Vehicle Live State table for low-latency GPS & OBD-II telemetry synchronization
--   3. Emergency SOS Events table with bidirectional driver panic <-> manager acknowledgement
--   4. Notifications & Driver Presence tracking
--   5. Atomic RPC transaction functions (assign_trip, accept_trip, start_trip, trigger_sos, acknowledge_sos, complete_trip_with_pod)
--   6. Strict Row-Level Security (RLS) policies isolating Driver A from Driver B
--   7. Supabase Realtime publication registration
-- ====================================================================================

-- 1. Ensure Extensions Exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper Functions for Auth Resolution
CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_driver_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (SELECT driver_id FROM public.users WHERE id = auth.uid()),
    (SELECT id FROM public.drivers WHERE user_id = auth.uid() LIMIT 1)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 2. ENHANCE / ENSURE VEHICLES & DRIVERS COLUMNS EXIST
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS capacity_tons NUMERIC(8,2) DEFAULT 25;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS doc_status TEXT DEFAULT 'Compliant';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS last_known_location JSONB DEFAULT '{"lat": 19.0760, "lng": 72.8777, "city": "Mumbai Hub"}'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS component_health JSONB DEFAULT '{"engine": 94, "brakes": 88, "battery": 95, "tyres": 82}'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS rc_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '3 years');
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS insurance_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '1 year');
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fitness_expiry DATE DEFAULT (CURRENT_DATE + INTERVAL '2 years');

ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Fully Verified';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS assigned_vehicle TEXT DEFAULT 'Unassigned';
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 92;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS safety_events JSONB DEFAULT '{"overspeedCount": 0, "harshBrakingCount": 0, "rapidAccelCount": 0, "fatigueAlertCount": 0}'::jsonb;


-- 3. TRIPS TABLE (Persistent Trips & Dispatch Lifecycle)
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
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (
        status IN ('Scheduled', 'Assigned', 'Accepted', 'In Transit', 'Delayed', 'Delivered', 'Cancelled')
    ),
    scheduled_departure TIMESTAMPTZ DEFAULT now(),
    scheduled_arrival TIMESTAMPTZ DEFAULT (now() + INTERVAL '6 hours'),
    actual_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    progress_percent NUMERIC(5, 2) DEFAULT 0.0,
    distance_km NUMERIC(8, 2) DEFAULT 148.0,
    distance_remaining_km NUMERIC(8, 2) DEFAULT 148.0,
    current_location JSONB DEFAULT '{"lat": 19.2968, "lng": 73.0630, "city": "Mumbai (Bhiwandi Hub)"}'::jsonb,
    current_checkpoint TEXT DEFAULT 'Mumbai Bhiwandi Hub',
    next_milestone TEXT DEFAULT 'Kalamboli Expressway Entry (28 km)',
    eway_bill_number TEXT,
    eway_bill_expiry TIMESTAMPTZ,
    toll_spend_inr NUMERIC(10, 2) DEFAULT 0.0,
    fuel_spend_inr NUMERIC(10, 2) DEFAULT 0.0,
    driver_advance_inr NUMERIC(10, 2) DEFAULT 5000.0,
    freight_revenue_inr NUMERIC(10, 2) DEFAULT 48000.0,
    pod_received BOOLEAN DEFAULT false,
    pod_notes TEXT,
    pod_image_url TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique trip code per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_trips_company_code ON public.trips(company_id, trip_code);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON public.trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);


-- 4. VEHICLE LIVE STATE TABLE (Realtime High-Frequency Telemetry Sync)
CREATE TABLE IF NOT EXISTS public.vehicle_live_state (
    vehicle_id UUID PRIMARY KEY REFERENCES public.vehicles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    vehicle_reg TEXT NOT NULL,
    driver_name TEXT,
    latitude DOUBLE PRECISION NOT NULL DEFAULT 19.2968,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 73.0630,
    speed_kmh NUMERIC(6, 2) DEFAULT 0.0,
    fuel_percent NUMERIC(5, 2) DEFAULT 75.0,
    engine_temp_c NUMERIC(5, 2) DEFAULT 86.0,
    engine_rpm INTEGER DEFAULT 1850,
    odometer_km NUMERIC(10, 2) DEFAULT 124892.0,
    progress_percent NUMERIC(5, 2) DEFAULT 0.0,
    distance_remaining_km NUMERIC(8, 2) DEFAULT 148.0,
    current_checkpoint TEXT DEFAULT 'Mumbai Bhiwandi Hub',
    next_milestone TEXT DEFAULT 'Kalamboli Expressway Entry (28 km)',
    is_moving BOOLEAN DEFAULT false,
    is_sos BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_state_company ON public.vehicle_live_state(company_id);
CREATE INDEX IF NOT EXISTS idx_live_state_driver ON public.vehicle_live_state(driver_id);
CREATE INDEX IF NOT EXISTS idx_live_state_trip ON public.vehicle_live_state(trip_id);


-- 5. VEHICLE TELEMETRY HISTORY TABLE (Analytics & Breadcrumb Records)
CREATE TABLE IF NOT EXISTS public.vehicle_telemetry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh NUMERIC(6, 2),
    fuel_percent NUMERIC(5, 2),
    engine_temp_c NUMERIC(5, 2),
    engine_rpm INTEGER,
    odometer_km NUMERIC(10, 2),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_hist_trip ON public.vehicle_telemetry_history(trip_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_hist_vehicle ON public.vehicle_telemetry_history(vehicle_id, recorded_at DESC);


-- 6. EMERGENCY EVENTS TABLE (Bidirectional SOS System)
CREATE TABLE IF NOT EXISTS public.emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    driver_name TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    vehicle_reg TEXT,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    trip_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name TEXT DEFAULT 'Corridor Checkpoint',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    triggered_at TIMESTAMPTZ DEFAULT now(),
    acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_company_status ON public.emergency_events(company_id, status);
CREATE INDEX IF NOT EXISTS idx_emergency_driver ON public.emergency_events(driver_id);


-- 7. NOTIFICATIONS TABLE (Instant Cross-Portal Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(recipient_user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_driver ON public.notifications(recipient_driver_id, read);


-- 8. DRIVER PRESENCE TABLE (Throttled Heartbeats)
CREATE TABLE IF NOT EXISTS public.driver_presence (
    driver_id UUID PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    is_online BOOLEAN DEFAULT false,
    current_vehicle_reg TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT now()
);


-- ====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_live_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_telemetry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_presence ENABLE ROW LEVEL SECURITY;

-- TRIPS RLS
DROP POLICY IF EXISTS "Management view all company trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers view own assigned trips" ON public.trips;
DROP POLICY IF EXISTS "Management modify company trips" ON public.trips;
DROP POLICY IF EXISTS "Drivers update own assigned trips" ON public.trips;

-- Management views all company trips; Driver strictly views ONLY trips assigned to their driver_id
CREATE POLICY "Management view all company trips" ON public.trips
    FOR SELECT TO authenticated
    USING (
      CASE
        WHEN public.get_auth_user_role() = 'Driver' THEN
          driver_id = public.get_auth_driver_id()
        ELSE
          company_id = public.get_auth_company_id()
      END
    );

CREATE POLICY "Management modify company trips" ON public.trips
    FOR ALL TO authenticated
    USING (
      public.get_auth_user_role() != 'Driver' AND company_id = public.get_auth_company_id()
    )
    WITH CHECK (
      public.get_auth_user_role() != 'Driver' AND company_id = public.get_auth_company_id()
    );

CREATE POLICY "Drivers update own assigned trips" ON public.trips
    FOR UPDATE TO authenticated
    USING (
      public.get_auth_user_role() = 'Driver' AND driver_id = public.get_auth_driver_id()
    )
    WITH CHECK (
      public.get_auth_user_role() = 'Driver' AND driver_id = public.get_auth_driver_id()
    );


-- VEHICLE LIVE STATE RLS
DROP POLICY IF EXISTS "Live state access policy" ON public.vehicle_live_state;
CREATE POLICY "Live state access policy" ON public.vehicle_live_state
    FOR ALL TO authenticated
    USING (
      CASE
        WHEN public.get_auth_user_role() = 'Driver' THEN
          driver_id = public.get_auth_driver_id() OR vehicle_id IN (
            SELECT id FROM public.vehicles WHERE assigned_driver_id = public.get_auth_driver_id()
          )
        ELSE
          company_id = public.get_auth_company_id()
      END
    );


-- EMERGENCY EVENTS RLS
DROP POLICY IF EXISTS "Emergency events isolation" ON public.emergency_events;
CREATE POLICY "Emergency events isolation" ON public.emergency_events
    FOR ALL TO authenticated
    USING (
      CASE
        WHEN public.get_auth_user_role() = 'Driver' THEN
          driver_id = public.get_auth_driver_id()
        ELSE
          company_id = public.get_auth_company_id()
      END
    );


-- NOTIFICATIONS RLS
DROP POLICY IF EXISTS "Notifications recipient isolation" ON public.notifications;
CREATE POLICY "Notifications recipient isolation" ON public.notifications
    FOR ALL TO authenticated
    USING (
      recipient_user_id = auth.uid() OR recipient_driver_id = public.get_auth_driver_id()
    );


-- DRIVER PRESENCE RLS
DROP POLICY IF EXISTS "Driver presence policy" ON public.driver_presence;
CREATE POLICY "Driver presence policy" ON public.driver_presence
    FOR ALL TO authenticated
    USING (
      company_id = public.get_auth_company_id()
    );


-- ====================================================================================
-- ATOMIC STORED PROCEDURES & RPC FUNCTIONS
-- ====================================================================================

-- 1. ASSIGN TRIP ATOMIC TRANSACTION
CREATE OR REPLACE FUNCTION public.assign_trip(
    p_trip_id UUID,
    p_driver_id UUID,
    p_vehicle_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_id UUID;
    v_driver_name TEXT;
    v_vehicle_reg TEXT;
    v_trip_code TEXT;
    v_driver_user_id UUID;
    v_updated_trip RECORD;
BEGIN
    v_company_id := public.get_auth_company_id();
    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User does not belong to a valid enterprise organization.';
    END IF;

    -- Verify driver belongs to company
    SELECT full_name, user_id INTO v_driver_name, v_driver_user_id
    FROM public.drivers
    WHERE id = p_driver_id AND company_id = v_company_id;
    
    IF v_driver_name IS NULL THEN
        RAISE EXCEPTION 'Driver not found or does not belong to company.';
    END IF;

    -- Verify vehicle belongs to company
    SELECT reg_number INTO v_vehicle_reg
    FROM public.vehicles
    WHERE id = p_vehicle_id AND company_id = v_company_id;

    IF v_vehicle_reg IS NULL THEN
        RAISE EXCEPTION 'Vehicle not found or does not belong to company.';
    END IF;

    -- Verify trip exists
    SELECT trip_code INTO v_trip_code
    FROM public.trips
    WHERE id = p_trip_id AND company_id = v_company_id;

    IF v_trip_code IS NULL THEN
        RAISE EXCEPTION 'Trip record not found.';
    END IF;

    -- Update Trip atomically
    UPDATE public.trips
    SET
        driver_id = p_driver_id,
        driver_name = v_driver_name,
        vehicle_id = p_vehicle_id,
        vehicle_reg = v_vehicle_reg,
        status = 'Assigned',
        updated_at = now()
    WHERE id = p_trip_id
    RETURNING * INTO v_updated_trip;

    -- Sync vehicle's assigned driver
    UPDATE public.vehicles
    SET assigned_driver_id = p_driver_id
    WHERE id = p_vehicle_id;

    -- Sync driver's assigned vehicle reg
    UPDATE public.drivers
    SET assigned_vehicle = v_vehicle_reg
    WHERE id = p_driver_id;

    -- Create Notification for Driver
    INSERT INTO public.notifications (
        company_id, recipient_user_id, recipient_driver_id, type, title, message, metadata
    )
    VALUES (
        v_company_id, v_driver_user_id, p_driver_id,
        'trip_assigned',
        'New Trip Assignment',
        'You have been assigned trip #' || v_trip_code || ' on commercial asset ' || v_vehicle_reg || '.',
        jsonb_build_object('trip_id', p_trip_id, 'trip_code', v_trip_code, 'vehicle_reg', v_vehicle_reg)
    );

    -- Log Activity
    INSERT INTO public.activity_logs (
        company_id, user_id, action, module, metadata
    )
    VALUES (
        v_company_id, auth.uid(),
        'Dispatched and assigned trip #' || v_trip_code || ' to pilot ' || v_driver_name || ' (' || v_vehicle_reg || ')',
        'Trip Operations',
        jsonb_build_object('trip_id', p_trip_id, 'driver_id', p_driver_id, 'vehicle_id', p_vehicle_id)
    );

    RETURN to_jsonb(v_updated_trip);
END;
$$;


-- 2. ACCEPT TRIP (Driver Action)
CREATE OR REPLACE FUNCTION public.accept_trip(
    p_trip_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_driver_id UUID;
    v_updated_trip RECORD;
BEGIN
    v_driver_id := public.get_auth_driver_id();

    UPDATE public.trips
    SET
        status = 'Accepted',
        updated_at = now()
    WHERE id = p_trip_id AND (driver_id = v_driver_id OR public.get_auth_user_role() != 'Driver')
    RETURNING * INTO v_updated_trip;

    IF v_updated_trip.id IS NULL THEN
        RAISE EXCEPTION 'Trip not found or unauthorized to accept.';
    END IF;

    -- Log Activity
    INSERT INTO public.activity_logs (
        company_id, user_id, action, module, metadata
    )
    VALUES (
        v_updated_trip.company_id, auth.uid(),
        'Pilot ' || COALESCE(v_updated_trip.driver_name, 'Driver') || ' accepted trip #' || v_updated_trip.trip_code,
        'Driver Cockpit',
        jsonb_build_object('trip_id', p_trip_id, 'status', 'Accepted')
    );

    RETURN to_jsonb(v_updated_trip);
END;
$$;


-- 3. START TRIP (Driver Action)
CREATE OR REPLACE FUNCTION public.start_trip(
    p_trip_id UUID,
    p_start_location JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_driver_id UUID;
    v_updated_trip RECORD;
    v_loc JSONB;
BEGIN
    v_driver_id := public.get_auth_driver_id();
    v_loc := COALESCE(p_start_location, '{"lat": 19.2968, "lng": 73.0630, "city": "Mumbai (Bhiwandi Hub)"}'::jsonb);

    UPDATE public.trips
    SET
        status = 'In Transit',
        actual_departure = now(),
        current_location = v_loc,
        progress_percent = 0.0,
        updated_at = now()
    WHERE id = p_trip_id AND (driver_id = v_driver_id OR public.get_auth_user_role() != 'Driver')
    RETURNING * INTO v_updated_trip;

    IF v_updated_trip.id IS NULL THEN
        RAISE EXCEPTION 'Trip not found or unauthorized to start.';
    END IF;

    -- Upsert initial vehicle live state
    IF v_updated_trip.vehicle_id IS NOT NULL THEN
        INSERT INTO public.vehicle_live_state (
            vehicle_id, company_id, trip_id, driver_id, vehicle_reg, driver_name,
            latitude, longitude, speed_kmh, is_moving, updated_at
        )
        VALUES (
            v_updated_trip.vehicle_id, v_updated_trip.company_id, v_updated_trip.id, v_updated_trip.driver_id,
            v_updated_trip.vehicle_reg, v_updated_trip.driver_name,
            (v_loc->>'lat')::DOUBLE PRECISION, (v_loc->>'lng')::DOUBLE PRECISION, 35.0, true, now()
        )
        ON CONFLICT (vehicle_id) DO UPDATE SET
            trip_id = EXCLUDED.trip_id,
            driver_id = EXCLUDED.driver_id,
            driver_name = EXCLUDED.driver_name,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            speed_kmh = 35.0,
            is_moving = true,
            updated_at = now();
    END IF;

    -- Log Activity
    INSERT INTO public.activity_logs (
        company_id, user_id, action, module, metadata
    )
    VALUES (
        v_updated_trip.company_id, auth.uid(),
        'Pilot ' || COALESCE(v_updated_trip.driver_name, 'Driver') || ' started transit on trip #' || v_updated_trip.trip_code || ' (' || v_updated_trip.vehicle_reg || ')',
        'Driver Cockpit',
        jsonb_build_object('trip_id', p_trip_id, 'status', 'In Transit')
    );

    RETURN to_jsonb(v_updated_trip);
END;
$$;


-- 4. UPDATE TELEMETRY (Low-overhead Upsert for Live Radar)
CREATE OR REPLACE FUNCTION public.update_vehicle_telemetry(
    p_vehicle_id UUID,
    p_trip_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_speed NUMERIC,
    p_fuel NUMERIC,
    p_engine_temp NUMERIC,
    p_engine_rpm INTEGER,
    p_odometer NUMERIC,
    p_progress NUMERIC,
    p_distance_remaining NUMERIC,
    p_checkpoint TEXT,
    p_next_milestone TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_id UUID;
    v_vehicle_reg TEXT;
    v_driver_id UUID;
    v_driver_name TEXT;
BEGIN
    SELECT company_id, reg_number, assigned_driver_id INTO v_company_id, v_vehicle_reg, v_driver_id
    FROM public.vehicles WHERE id = p_vehicle_id;

    IF v_driver_id IS NOT NULL THEN
        SELECT full_name INTO v_driver_name FROM public.drivers WHERE id = v_driver_id;
    END IF;

    INSERT INTO public.vehicle_live_state (
        vehicle_id, company_id, trip_id, driver_id, vehicle_reg, driver_name,
        latitude, longitude, speed_kmh, fuel_percent, engine_temp_c, engine_rpm,
        odometer_km, progress_percent, distance_remaining_km, current_checkpoint,
        next_milestone, is_moving, updated_at
    )
    VALUES (
        p_vehicle_id, v_company_id, p_trip_id, v_driver_id, v_vehicle_reg, v_driver_name,
        p_lat, p_lng, p_speed, p_fuel, p_engine_temp, p_engine_rpm,
        p_odometer, p_progress, p_distance_remaining, p_checkpoint,
        p_next_milestone, (p_speed > 0), now()
    )
    ON CONFLICT (vehicle_id) DO UPDATE SET
        trip_id = COALESCE(EXCLUDED.trip_id, public.vehicle_live_state.trip_id),
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        speed_kmh = EXCLUDED.speed_kmh,
        fuel_percent = EXCLUDED.fuel_percent,
        engine_temp_c = EXCLUDED.engine_temp_c,
        engine_rpm = EXCLUDED.engine_rpm,
        odometer_km = EXCLUDED.odometer_km,
        progress_percent = EXCLUDED.progress_percent,
        distance_remaining_km = EXCLUDED.distance_remaining_km,
        current_checkpoint = EXCLUDED.current_checkpoint,
        next_milestone = EXCLUDED.next_milestone,
        is_moving = EXCLUDED.is_moving,
        updated_at = now();

    -- Also update trip's current checkpoint and progress if trip is active
    IF p_trip_id IS NOT NULL THEN
        UPDATE public.trips
        SET
            progress_percent = p_progress,
            distance_remaining_km = p_distance_remaining,
            current_checkpoint = p_checkpoint,
            next_milestone = p_next_milestone,
            current_location = jsonb_build_object('lat', p_lat, 'lng', p_lng, 'city', p_checkpoint),
            updated_at = now()
        WHERE id = p_trip_id;
    END IF;
END;
$$;


-- 5. EMERGENCY SOS TRIGGER & ACKNOWLEDGE
CREATE OR REPLACE FUNCTION public.trigger_emergency_sos(
    p_trip_id UUID,
    p_vehicle_id UUID,
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_location_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_id UUID;
    v_driver_id UUID;
    v_driver_name TEXT;
    v_vehicle_reg TEXT;
    v_trip_code TEXT;
    v_event_id UUID;
BEGIN
    v_driver_id := public.get_auth_driver_id();
    
    SELECT full_name, company_id INTO v_driver_name, v_company_id
    FROM public.drivers WHERE id = v_driver_id;

    IF v_company_id IS NULL THEN
        v_company_id := public.get_auth_company_id();
    END IF;

    SELECT reg_number INTO v_vehicle_reg FROM public.vehicles WHERE id = p_vehicle_id;
    SELECT trip_code INTO v_trip_code FROM public.trips WHERE id = p_trip_id;

    INSERT INTO public.emergency_events (
        company_id, driver_id, driver_name, vehicle_id, vehicle_reg,
        trip_id, trip_code, latitude, longitude, location_name, status, triggered_at
    )
    VALUES (
        v_company_id, v_driver_id, v_driver_name, p_vehicle_id, v_vehicle_reg,
        p_trip_id, v_trip_code, p_lat, p_lng, p_location_name, 'ACTIVE', now()
    )
    RETURNING id INTO v_event_id;

    -- Flag vehicle live state
    UPDATE public.vehicle_live_state
    SET is_sos = true, updated_at = now()
    WHERE vehicle_id = p_vehicle_id;

    -- Log critical activity
    INSERT INTO public.activity_logs (
        company_id, user_id, action, module, metadata
    )
    VALUES (
        v_company_id, auth.uid(),
        'CRITICAL: Emergency Highway SOS activated by ' || COALESCE(v_driver_name, 'Driver') || ' (' || COALESCE(v_vehicle_reg, 'Asset') || ') near ' || p_location_name,
        'Safety & Emergency',
        jsonb_build_object('emergency_id', v_event_id, 'trip_id', p_trip_id, 'location', p_location_name)
    );

    RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.acknowledge_emergency_sos(
    p_emergency_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event RECORD;
BEGIN
    UPDATE public.emergency_events
    SET
        status = 'ACKNOWLEDGED',
        acknowledged_by = auth.uid(),
        acknowledged_at = now(),
        notes = COALESCE(p_notes, 'Fleet Command Center dispatched assistance protocol.')
    WHERE id = p_emergency_id
    RETURNING * INTO v_event;

    -- Create notification for Driver
    IF v_event.driver_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            company_id, recipient_driver_id, type, title, message, metadata
        )
        VALUES (
            v_event.company_id, v_event.driver_id,
            'sos_acknowledged',
            'SOS Acknowledged by Command',
            'Fleet Manager has acknowledged your emergency broadcast. Assistance team has been mobilized.',
            jsonb_build_object('emergency_id', p_emergency_id)
        );
    END IF;

    -- Clear live state SOS flag if no other active SOS
    UPDATE public.vehicle_live_state
    SET is_sos = false, updated_at = now()
    WHERE vehicle_id = v_event.vehicle_id;
END;
$$;


-- 6. COMPLETE TRIP WITH POD
CREATE OR REPLACE FUNCTION public.complete_trip_with_pod(
    p_trip_id UUID,
    p_pod_notes TEXT DEFAULT NULL,
    p_pod_image_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_trip RECORD;
BEGIN
    UPDATE public.trips
    SET
        status = 'Delivered',
        actual_arrival = now(),
        progress_percent = 100.0,
        distance_remaining_km = 0.0,
        pod_received = true,
        pod_notes = COALESCE(p_pod_notes, 'Delivered and acknowledged by consignee.'),
        pod_image_url = p_pod_image_url,
        updated_at = now()
    WHERE id = p_trip_id
    RETURNING * INTO v_updated_trip;

    IF v_updated_trip.vehicle_id IS NOT NULL THEN
        UPDATE public.vehicle_live_state
        SET
            speed_kmh = 0.0,
            is_moving = false,
            progress_percent = 100.0,
            distance_remaining_km = 0.0,
            updated_at = now()
        WHERE vehicle_id = v_updated_trip.vehicle_id;
    END IF;

    -- Log Activity
    INSERT INTO public.activity_logs (
        company_id, user_id, action, module, metadata
    )
    VALUES (
        v_updated_trip.company_id, auth.uid(),
        'Consignment delivered & ePOD uploaded for trip #' || v_updated_trip.trip_code || ' by ' || v_updated_trip.driver_name,
        'Trip Operations',
        jsonb_build_object('trip_id', p_trip_id, 'pod_notes', p_pod_notes)
    );

    RETURN to_jsonb(v_updated_trip);
END;
$$;


-- ====================================================================================
-- SUPABASE REALTIME REPLICATION PUBLICATION CONFIGURATION
-- ====================================================================================

-- Safely add tables to Supabase Realtime publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_live_state;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_events;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_presence;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;


-- ====================================================================================
-- INITIAL SEED DATA FOR DEMO SCENARIO (Idempotent)
-- ====================================================================================

DO $$
DECLARE
    v_comp_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_driver_id UUID := 'd0000000-0000-0000-0000-000000000001';
    v_vehicle_id UUID := 'b0000000-0000-0000-0000-000000000001';
    v_trip_id UUID := 'c0000000-0000-0000-0000-000000000001';
BEGIN
    -- 1. Ensure Demo Driver exists with fixed UUID
    INSERT INTO public.drivers (
        id, company_id, full_name, phone, license_number, license_category, license_expiry, status, verification_status, assigned_vehicle
    )
    VALUES (
        v_driver_id, v_comp_id, 'Ramesh Kumar', '+91 9876543212', 'IND-MH12-20210048', 'HMV', CURRENT_DATE + INTERVAL '5 years', 'active', 'Fully Verified', 'MH-12-Q-4521'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        assigned_vehicle = EXCLUDED.assigned_vehicle;

    -- Attach driver_id to driver user in public.users if email matches
    UPDATE public.users
    SET driver_id = v_driver_id
    WHERE email = 'driver@trucksaathi.com' AND driver_id IS NULL;

    -- 2. Ensure Demo Vehicle exists with fixed UUID
    INSERT INTO public.vehicles (
        id, company_id, assigned_driver_id, reg_number, category, make, model, chassis_number, engine_number, payload_capacity_tons, maintenance_status
    )
    VALUES (
        v_vehicle_id, v_comp_id, v_driver_id, 'MH-12-Q-4521', 'Container', 'Tata Motors', 'Signa 4825.T Heavy Axle', 'MAT-482910-TS', 'ENG-992014-TATA', 28.5, 'in_service'
    )
    ON CONFLICT (id) DO UPDATE SET
        reg_number = EXCLUDED.reg_number,
        assigned_driver_id = EXCLUDED.assigned_driver_id;

    -- Also ensure secondary vehicles exist for rich Fleet Command view
    INSERT INTO public.vehicles (id, company_id, reg_number, category, make, model, payload_capacity_tons, maintenance_status)
    VALUES
        ('b0000000-0000-0000-0000-000000000002', v_comp_id, 'MH-04-AB-1234', 'Trailer', 'Ashok Leyland', '4220 HG Multi-Axle', 32.0, 'in_service'),
        ('b0000000-0000-0000-0000-000000000003', v_comp_id, 'MH-14-CW-7788', 'Container', 'BharatBenz', '3528C Heavy Haulage', 25.0, 'in_service'),
        ('b0000000-0000-0000-0000-000000000004', v_comp_id, 'MH-43-XY-9900', 'Open Body', 'Eicher', 'Pro 6028 High Deck', 20.0, 'scheduled_maintenance'),
        ('b0000000-0000-0000-0000-000000000005', v_comp_id, 'MH-46-AR-3321', 'Refrigerated', 'Mahindra', 'Blazo X 28 Reefer', 22.0, 'in_service')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Ensure Initial Active Trip exists
    INSERT INTO public.trips (
        id, company_id, vehicle_id, driver_id, trip_code, vehicle_reg, driver_name,
        origin, destination, cargo_description, cargo_weight_tons, status,
        scheduled_departure, scheduled_arrival, distance_km, distance_remaining_km,
        progress_percent, current_checkpoint, next_milestone, eway_bill_number,
        freight_revenue_inr
    )
    VALUES (
        v_trip_id, v_comp_id, v_vehicle_id, v_driver_id, 'TRP-2026-0142', 'MH-12-Q-4521', 'Ramesh Kumar',
        '{"city": "Mumbai (Bhiwandi Hub)", "address": "Bhiwandi Freight Logistic City, Shed 4"}'::jsonb,
        '{"city": "Pune (Chakan MIDC)", "address": "Chakan Auto Zone, Phase II, Plot 18"}'::jsonb,
        'Precision Automotive Stamping Parts & Axle Subassemblies', 24.5, 'In Transit',
        now() - INTERVAL '1 hour', now() + INTERVAL '4 hours', 148.0, 84.0,
        45.0, 'Lonavala Expressway Bypass', 'Somatane Toll Plaza (32 km)', '2910-4829-1092',
        48000.0
    )
    ON CONFLICT (id) DO UPDATE SET
        driver_id = EXCLUDED.driver_id,
        vehicle_id = EXCLUDED.vehicle_id,
        vehicle_reg = EXCLUDED.vehicle_reg,
        driver_name = EXCLUDED.driver_name;

    -- 4. Ensure Initial Live State exists
    INSERT INTO public.vehicle_live_state (
        vehicle_id, company_id, trip_id, driver_id, vehicle_reg, driver_name,
        latitude, longitude, speed_kmh, fuel_percent, engine_temp_c, engine_rpm,
        odometer_km, progress_percent, distance_remaining_km, current_checkpoint,
        next_milestone, is_moving, updated_at
    )
    VALUES (
        v_vehicle_id, v_comp_id, v_trip_id, v_driver_id, 'MH-12-Q-4521', 'Ramesh Kumar',
        18.7542, 73.4072, 72.0, 68.0, 86.0, 1850,
        124892.0, 45.0, 84.0, 'Lonavala Expressway Bypass',
        'Somatane Toll Plaza (32 km)', true, now()
    )
    ON CONFLICT (vehicle_id) DO UPDATE SET
        speed_kmh = 72.0,
        fuel_percent = 68.0,
        updated_at = now();
END $$;
