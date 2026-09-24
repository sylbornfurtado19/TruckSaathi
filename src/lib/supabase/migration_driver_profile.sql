-- TruckSaathi Migration: Connect Driver Auth User -> TruckSaathi User Profile -> Driver Profile
-- Enables fine-grained driver role association and enforces strict driver profile isolation

-- 1. Add driver_id foreign key to public.users table (TruckSaathi User Profile -> Driver Profile)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;

-- 2. Add user_id foreign key to public.drivers table (Driver Profile -> Supabase Auth User)
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_driver_id ON public.users(driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);

-- 4. Helper function to get current authenticated user's role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Update RLS Policies on public.drivers to ensure Driver A cannot access Driver B's profile
DROP POLICY IF EXISTS "Tenant drivers isolation" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view own profile or management can view company drivers" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can update own profile" ON public.drivers;

-- Management users can view all company drivers; Drivers can strictly view ONLY their own driver profile
CREATE POLICY "Drivers can view own profile or management can view company drivers" ON public.drivers
    FOR SELECT TO authenticated
    USING (
      CASE
        WHEN public.get_auth_user_role() = 'Driver' THEN
          (user_id = auth.uid() OR id IN (SELECT driver_id FROM public.users WHERE id = auth.uid()))
        ELSE
          company_id = public.get_auth_company_id()
      END
    );

-- Drivers can update their own driver record (e.g., emergency contact, phone)
CREATE POLICY "Drivers can update own profile" ON public.drivers
    FOR UPDATE TO authenticated
    USING (
      user_id = auth.uid() OR id IN (SELECT driver_id FROM public.users WHERE id = auth.uid())
    )
    WITH CHECK (
      user_id = auth.uid() OR id IN (SELECT driver_id FROM public.users WHERE id = auth.uid())
    );

-- Management users can insert and delete drivers in their company
CREATE POLICY "Management can insert company drivers" ON public.drivers
    FOR INSERT TO authenticated
    WITH CHECK (
      public.get_auth_user_role() != 'Driver' AND company_id = public.get_auth_company_id()
    );

CREATE POLICY "Management can delete company drivers" ON public.drivers
    FOR DELETE TO authenticated
    USING (
      public.get_auth_user_role() != 'Driver' AND company_id = public.get_auth_company_id()
    );
