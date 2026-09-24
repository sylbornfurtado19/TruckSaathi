import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/types';
import { User as SupabaseUser } from '@supabase/supabase-js';

const DEFAULT_COMPANY_NAME = 'Mahindra Logistics India';

/**
 * Retrieves the application profile for a given authenticated user ID from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
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
 * If the profile does not exist in public.users yet (e.g., auth user created before DB trigger),
 * this function automatically provisions and persists it to public.users.
 */
export async function ensureUserProfile(authUser: SupabaseUser): Promise<UserProfile> {
  // 1. Check if profile already exists in public.users
  const existing = await fetchUserProfile(authUser.id);
  if (existing) {
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
    return {
      id: authUser.id,
      userId: authUser.id,
      name: defaultName,
      email: authUser.email || '',
      role: defaultRole,
      companyId: null,
      companyName: DEFAULT_COMPANY_NAME,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    // Attempt to locate an active default company in the database
    const { data: comp } = await supabase
      .from('companies')
      .select('id, legal_name')
      .limit(1)
      .maybeSingle();

    const companyId = metadata.company_id || comp?.id || null;
    const companyName = comp?.legal_name || DEFAULT_COMPANY_NAME;

    // Self-heal: insert application profile into public.users
    const newRecord = {
      id: authUser.id,
      email: authUser.email,
      full_name: defaultName,
      role: defaultRole,
      company_id: companyId,
      phone: metadata.phone || null,
      department: metadata.department || null,
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
      companyId: null,
      companyName: DEFAULT_COMPANY_NAME,
      createdAt: new Date().toISOString(),
    };
  }
}
