import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Driver } from '@/types';

export const mapDbDriverToDriver = (row: Record<string, unknown>): Driver => {
  return {
    id: String(row.id || ''),
    userId: (row.user_id as string) || undefined,
    fullName: String(row.full_name || 'Driver'),
    phone: String(row.phone || '+91 98000 00000'),
    licenseNumber: String(row.license_number || 'DL-MH-2022-001'),
    licenseCategory: (row.license_category as Driver['licenseCategory']) || 'HMV',
    licenseExpiry: String(row.license_expiry || '2029-10-30'),
    experienceYears: Number(row.experience_years || 5),
    assignedVehicle: (row.assigned_vehicle as string) || 'Unassigned',
    status:
      row.status === 'on_leave'
        ? 'On Leave'
        : row.status === 'terminated'
          ? 'Terminated'
          : 'Active',
    verificationStatus: (row.verification_status as Driver['verificationStatus']) || 'Fully Verified',
    aadhaarNumber: String(row.aadhaar_number || '9000 0000 0000'),
    emergencyContact: (row.emergency_contact as Driver['emergencyContact']) || {
      name: 'Family Contact',
      phone: '+91 98000 00000',
      relation: 'Spouse'
    },
    safetyScore: Number(row.safety_score || 92),
    safetyEvents: (row.safety_events as Driver['safetyEvents']) || {
      overspeedCount: 0,
      harshBrakingCount: 0,
      rapidAccelCount: 0,
      fatigueAlertCount: 0,
      seatbeltViolationCount: 0
    }
  };
};

export const driverService = {
  /**
   * Fetch all drivers from Supabase
   */
  async fetchDrivers(): Promise<Driver[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('driverService.fetchDrivers error:', error.message);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) => mapDbDriverToDriver(row));
    } catch (err: unknown) {
      console.warn('driverService.fetchDrivers catch:', err);
      return [];
    }
  },

  /**
   * Create a new driver record directly in Supabase
   */
  async createDriver(
    driverData: Omit<Driver, 'id'>,
    companyId?: string
  ): Promise<{ success: boolean; driver?: Driver; error?: string }> {
    const fallbackId = `d-${crypto.randomUUID()}`;
    const localDriver: Driver = {
      ...driverData,
      id: fallbackId
    };

    if (!isSupabaseConfigured()) {
      return { success: true, driver: localDriver };
    }

    try {
      // Build Supabase columns payload
      const payload: Record<string, unknown> = {
        full_name: driverData.fullName.trim(),
        phone: driverData.phone.trim(),
        license_number: driverData.licenseNumber.toUpperCase().trim(),
        license_category: driverData.licenseCategory || 'HMV',
        license_expiry: driverData.licenseExpiry || '2029-10-30',
        experience_years: Number(driverData.experienceYears) || 0,
        aadhaar_number: driverData.aadhaarNumber ? driverData.aadhaarNumber.trim() : null,
        assigned_vehicle: driverData.assignedVehicle || 'Unassigned',
        status:
          driverData.status === 'On Leave'
            ? 'on_leave'
            : driverData.status === 'Terminated'
              ? 'terminated'
              : 'active',
        verification_status: driverData.verificationStatus || 'Fully Verified',
        safety_score: Number(driverData.safetyScore) || 92,
        emergency_contact: driverData.emergencyContact || {
          name: 'Emergency Contact',
          phone: driverData.phone,
          relation: 'Family'
        }
      };

      if (companyId) {
        payload.company_id = companyId;
      }

      const { data, error } = await supabase
        .from('drivers')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('driverService.createDriver Supabase error:', error.message);
        return {
          success: false,
          driver: localDriver,
          error: error.message
        };
      }

      const newDriver = mapDbDriverToDriver(data as Record<string, unknown>);
      return { success: true, driver: newDriver };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create driver in Supabase';
      console.warn('driverService.createDriver catch:', message);
      return {
        success: false,
        driver: localDriver,
        error: message
      };
    }
  },

  /**
   * Update an existing driver in Supabase
   */
  async updateDriver(
    id: string,
    updated: Partial<Driver>
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const payload: Record<string, unknown> = {};
      if (updated.fullName) payload.full_name = updated.fullName;
      if (updated.phone) payload.phone = updated.phone;
      if (updated.licenseNumber) payload.license_number = updated.licenseNumber;
      if (updated.licenseCategory) payload.license_category = updated.licenseCategory;
      if (updated.licenseExpiry) payload.license_expiry = updated.licenseExpiry;
      if (updated.experienceYears !== undefined) payload.experience_years = updated.experienceYears;
      if (updated.assignedVehicle !== undefined) payload.assigned_vehicle = updated.assignedVehicle;
      if (updated.status) {
        payload.status =
          updated.status === 'On Leave'
            ? 'on_leave'
            : updated.status === 'Terminated'
              ? 'terminated'
              : 'active';
      }
      if (updated.verificationStatus) payload.verification_status = updated.verificationStatus;
      if (updated.safetyScore !== undefined) payload.safety_score = updated.safetyScore;

      const { error } = await supabase
        .from('drivers')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.warn('driverService.updateDriver error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update driver in Supabase';
      return { success: false, error: message };
    }
  },

  /**
   * Delete a driver in Supabase
   */
  async deleteDriver(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) {
        console.warn('driverService.deleteDriver error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete driver in Supabase';
      return { success: false, error: message };
    }
  }
};