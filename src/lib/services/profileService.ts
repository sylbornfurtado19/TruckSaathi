import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, UserRole, Driver } from '@/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { INITIAL_DRIVERS, INITIAL_USERS } from '@/data/mockData';

const DEFAULT_COMPANY_NAME = 'Mahindra Logistics India';

/**
 * Retrieves the application profile for a given authenticated user ID from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    // In mock demo mode, check INITIAL_USERS
    const mock = INITIAL_USERS.find(u => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (mock) {
      return {
        id: mock.id,
        userId: mock.id,
        name: mock.fullName,
        email: mock.email,
        role: mock.role,
        driverId: mock.driverId || null,
        companyId: mock.companyId || null,
        companyName: DEFAULT_COMPANY_NAME,
        phone: mock.phone,
        department: mock.department,
        status: mock.status,
        createdAt: new Date().toISOString()
      };
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, company:companies(legal_name)')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching user profile from public.users:', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.id,
      name: data.full_name || 'Fleet User',
      email: data.email || '',
      role: (data.role as UserRole) || 'Company Admin',
      driverId: data.driver_id || null,
      companyId: data.company_id || null,
      companyName: data.company?.legal_name || DEFAULT_COMPANY_NAME,
      phone: data.phone || '',
      department: data.department || '',
      status: data.status || 'Active',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Unexpected exception in fetchUserProfile:', err);
    return null;
  }
}

/**
 * Ensures an application profile exists for the authenticated user.
 * If the user's role is Driver, it ensures a linked Driver record exists in public.drivers.
 */
export async function ensureUserProfile(authUser: SupabaseUser): Promise<UserProfile> {
  // 1. Check if profile already exists in public.users
  const existing = await fetchUserProfile(authUser.id);
  if (existing) {
    // If user is a Driver but lacks driverId, attempt to link it
    if (existing.role === 'Driver' && !existing.driverId) {
      const linkedDriverId = await resolveDriverIdForUser(
        authUser.id,
        existing.name,
        existing.phone || '',
        existing.companyId,
        authUser.email
      );
      if (linkedDriverId) {
        existing.driverId = linkedDriverId;
        if (isSupabaseConfigured()) {
          await supabase.from('users').update({ driver_id: linkedDriverId }).eq('id', authUser.id);
        }
      }
    }
    return existing;
  }

  // 2. Extract profile details from Auth metadata
  const metadata = authUser.user_metadata || {};
  const defaultName =
    metadata.full_name ||
    metadata.name ||
    authUser.email?.split('@')[0] ||
    'Fleet User';
  const defaultRole: UserRole = (metadata.role as UserRole) || 'Company Admin';

  if (!isSupabaseConfigured()) {
    // Mock fallback
    const matchedMockUser = INITIAL_USERS.find(
      u => u.email.toLowerCase() === (authUser.email || '').toLowerCase()
    );
    const mockDriverMatch = INITIAL_DRIVERS.find(
      d =>
        (d.userId && d.userId === authUser.id) ||
        (d.email && d.email.toLowerCase() === (authUser.email || '').toLowerCase()) ||
        d.fullName.toLowerCase() === (matchedMockUser?.fullName || defaultName).toLowerCase()
    );
    const mockDriverId = defaultRole === 'Driver' ? (matchedMockUser?.driverId || mockDriverMatch?.id || null) : null;

    return {
      id: authUser.id,
      userId: authUser.id,
      name: matchedMockUser?.fullName || defaultName,
      email: authUser.email || '',
      role: matchedMockUser?.role || defaultRole,
      driverId: mockDriverId,
      companyId: null,
      companyName: DEFAULT_COMPANY_NAME,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    // Locate default company
    const { data: comp } = await supabase
      .from('companies')
      .select('id, legal_name')
      .limit(1)
      .maybeSingle();

    const companyId = metadata.company_id || comp?.id || null;
    const companyName = comp?.legal_name || DEFAULT_COMPANY_NAME;

    // Resolve or provision Driver record if role is Driver
    let driverId: string | null = null;
    if (defaultRole === 'Driver') {
      driverId = await resolveDriverIdForUser(
        authUser.id,
        defaultName,
        metadata.phone || '',
        companyId,
        authUser.email
      );
    }

    // Insert or update profile in public.users
    const newRecord = {
      id: authUser.id,
      email: authUser.email,
      full_name: defaultName,
      role: defaultRole,
      company_id: companyId,
      driver_id: driverId,
      phone: metadata.phone || null,
      department: metadata.department || (defaultRole === 'Driver' ? 'Fleet Logistics' : null),
      status: 'active'
    };

    const { data: created, error } = await supabase
      .from('users')
      .upsert(newRecord, { onConflict: 'id' })
      .select('*, company:companies(legal_name)')
      .single();

    if (error || !created) {
      console.warn('Could not upsert profile in public.users:', error?.message);
      return {
        id: authUser.id,
        userId: authUser.id,
        name: defaultName,
        email: authUser.email || '',
        role: defaultRole,
        driverId,
        companyId,
        companyName,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: created.id,
      userId: created.id,
      name: created.full_name,
      email: created.email || authUser.email || '',
      role: (created.role as UserRole) || defaultRole,
      driverId: created.driver_id || driverId,
      companyId: created.company_id,
      companyName: created.company?.legal_name || companyName,
      phone: created.phone || '',
      department: created.department || '',
      status: created.status || 'Active',
      createdAt: created.created_at,
    };
  } catch (err) {
    console.error('Exception in ensureUserProfile:', err);
    return {
      id: authUser.id,
      userId: authUser.id,
      name: defaultName,
      email: authUser.email || '',
      role: defaultRole,
      driverId: null,
      companyId: null,
      companyName: DEFAULT_COMPANY_NAME,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Helper to resolve an existing Driver record or provision a new one for an authenticated Driver user
 */
async function resolveDriverIdForUser(
  userId: string,
  fullName: string,
  phone: string,
  companyId?: string | null,
  email?: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    const match = INITIAL_DRIVERS.find(
      d =>
        (d.userId && d.userId === userId) ||
        (email && d.email && d.email.toLowerCase() === email.toLowerCase()) ||
        d.fullName.toLowerCase() === fullName.toLowerCase()
    );
    return match ? match.id : null;
  }

  try {
    // 1. Check if public.drivers already has a record linked to this user_id or phone
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('id')
      .or(`user_id.eq.${userId},phone.eq.${phone || 'none'}`)
      .limit(1)
      .maybeSingle();

    if (existingDriver?.id) {
      // Ensure user_id is saved on the driver row
      await supabase.from('drivers').update({ user_id: userId }).eq('id', existingDriver.id);
      return existingDriver.id;
    }

    // 2. If not found in DB, check if matching mock driver name or email exists
    const mockMatch = INITIAL_DRIVERS.find(
      d =>
        (email && d.email && d.email.toLowerCase() === email.toLowerCase()) ||
        d.fullName.toLowerCase() === fullName.toLowerCase()
    );

    // 3. Insert a new driver profile record into public.drivers
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);

    const { data: newDriver, error } = await supabase
      .from('drivers')
      .insert({
        company_id: companyId || null,
        user_id: userId,
        full_name: fullName,
        phone: phone || mockMatch?.phone || '+91 90000 00000',
        license_number: mockMatch?.licenseNumber || `DL-${Date.now().toString().slice(-8)}`,
        license_category: mockMatch?.licenseCategory || 'HMV',
        license_expiry: mockMatch?.licenseExpiry || expiryDate.toISOString().slice(0, 10),
        experience_years: mockMatch?.experienceYears || 5,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) {
      console.warn('Could not insert driver record in public.drivers:', error.message);
      return mockMatch ? mockMatch.id : null;
    }

    return newDriver?.id || null;
  } catch (e) {
    console.error('Error resolving driver record:', e);
    return null;
  }
}
