import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Trip, TripStatus } from '@/types';

// Helper for safe error strings
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface DbTripRow {
  id?: string;
  company_id?: string;
  trip_code?: string;
  vehicle_id?: string;
  vehicle_reg?: string;
  driver_id?: string;
  driver_name?: string;
  origin?: unknown;
  destination?: unknown;
  cargo_description?: string;
  cargo_weight_tons?: number;
  status?: string;
  scheduled_departure?: string;
  scheduled_arrival?: string;
  actual_departure?: string;
  actual_arrival?: string;
  distance_km?: number;
  distance_remaining_km?: number;
  progress_percent?: number;
  current_location?: unknown;
  current_checkpoint?: string;
  next_milestone?: string;
  eway_bill_number?: string;
  eway_bill_expiry?: string;
  toll_spend_inr?: number;
  fuel_spend_inr?: number;
  driver_advance_inr?: number;
  freight_revenue_inr?: number;
  pod_received?: boolean;
  pod_notes?: string;
  pod_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Convert DB row (snake_case) to Trip (camelCase)
export function mapDbTripToTrip(row: DbTripRow): Trip {
  return {
    id: row.id || '',
    companyId: row.company_id || '',
    tripCode: row.trip_code || '',
    vehicleId: row.vehicle_id || '',
    vehicleReg: row.vehicle_reg || 'Standby Asset',
    driverId: row.driver_id || '',
    driverName: row.driver_name || 'Unassigned',
    origin: typeof row.origin === 'string' ? JSON.parse(row.origin) : (row.origin as Trip['origin']) || { city: 'Mumbai', address: 'Hub' },
    destination: typeof row.destination === 'string' ? JSON.parse(row.destination) : (row.destination as Trip['destination']) || { city: 'Pune', address: 'Hub' },
    cargoDescription: row.cargo_description || 'Commercial Freight',
    cargoWeightTons: Number(row.cargo_weight_tons || 20),
    status: (row.status as TripStatus) || 'Scheduled',
    scheduledDeparture: row.scheduled_departure || new Date().toISOString(),
    scheduledArrival: row.scheduled_arrival || new Date().toISOString(),
    actualDeparture: row.actual_departure,
    actualArrival: row.actual_arrival,
    distanceKm: Number(row.distance_km || 148),
    distanceRemainingKm: Number(row.distance_remaining_km ?? 148),
    progressPercent: Number(row.progress_percent ?? 0),
    currentLocation: row.current_location
      ? typeof row.current_location === 'string'
        ? JSON.parse(row.current_location)
        : (row.current_location as Trip['currentLocation'])
      : undefined,
    currentCheckpoint: row.current_checkpoint || 'Mumbai Bhiwandi Hub',
    nextMilestone: row.next_milestone || 'Kalamboli Expressway Entry (28 km)',
    ewayBillNumber: row.eway_bill_number,
    ewayBillExpiry: row.eway_bill_expiry,
    tollSpendINR: Number(row.toll_spend_inr || 0),
    fuelSpendINR: Number(row.fuel_spend_inr || 0),
    driverAdvanceINR: Number(row.driver_advance_inr || 0),
    freightRevenueINR: Number(row.freight_revenue_inr || 0),
    podReceived: Boolean(row.pod_received),
    podNotes: row.pod_notes,
    podImageUrl: row.pod_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const tripService = {
  /**
   * Fetch all trips accessible to current user (filtered by RLS)
   */
  async fetchTrips(): Promise<Trip[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('tripService.fetchTrips error:', error.message);
        return [];
      }

      return (data || []).map(mapDbTripToTrip);
    } catch (err) {
      console.warn('tripService.fetchTrips exception:', err);
      return [];
    }
  },

  /**
   * Fetch trips assigned to a specific driver ID
   */
  async fetchDriverTrips(driverId: string): Promise<Trip[]> {
    if (!isSupabaseConfigured() || !driverId) return [];

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('tripService.fetchDriverTrips error:', error.message);
        return [];
      }

      return (data || []).map(mapDbTripToTrip);
    } catch (err) {
      console.warn('tripService.fetchDriverTrips exception:', err);
      return [];
    }
  },

  /**
   * Fetch single trip by ID
   */
  async fetchTripById(id: string): Promise<Trip | null> {
    if (!isSupabaseConfigured() || !id) return null;

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return mapDbTripToTrip(data);
    } catch {
      return null;
    }
  },

  /**
   * Atomic Trip Assignment: Driver + Vehicle + Trip
   * Uses RPC function `assign_trip` in database
   */
  async assignTrip(tripId: string, driverId: string, vehicleId: string): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection not available.' };
    }

    try {
      // First try RPC
      const { data, error } = await supabase.rpc('assign_trip', {
        p_trip_id: tripId,
        p_driver_id: driverId,
        p_vehicle_id: vehicleId
      });

      if (!error && data) {
        return { success: true, trip: mapDbTripToTrip(data) };
      }

      // Fallback direct update if RPC fails
      const { data: driverData } = await supabase.from('drivers').select('full_name').eq('id', driverId).single();
      const { data: vehicleData } = await supabase.from('vehicles').select('reg_number').eq('id', vehicleId).single();

      const { data: updated, error: updateErr } = await supabase
        .from('trips')
        .update({
          driver_id: driverId,
          driver_name: driverData?.full_name || 'Assigned Driver',
          vehicle_id: vehicleId,
          vehicle_reg: vehicleData?.reg_number || 'Asset',
          status: 'Assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select('*')
        .single();

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      // Update vehicle assigned_driver_id
      await supabase.from('vehicles').update({ assigned_driver_id: driverId }).eq('id', vehicleId);

      return { success: true, trip: mapDbTripToTrip(updated) };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Driver accepts assigned trip
   */
  async acceptTrip(tripId: string): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection not available.' };
    }

    try {
      const { data, error } = await supabase.rpc('accept_trip', { p_trip_id: tripId });
      if (!error && data) {
        return { success: true, trip: mapDbTripToTrip(data) };
      }

      // Direct fallback
      const { data: updated, error: updateErr } = await supabase
        .from('trips')
        .update({
          status: 'Accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select('*')
        .single();

      if (updateErr) return { success: false, error: updateErr.message };
      return { success: true, trip: mapDbTripToTrip(updated) };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Driver starts accepted trip
   */
  async startTrip(
    tripId: string,
    startLocation?: { lat: number; lng: number; city: string }
  ): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection not available.' };
    }

    try {
      const loc = startLocation || { lat: 19.2968, lng: 73.063, city: 'Mumbai (Bhiwandi Hub)' };

      const { data, error } = await supabase.rpc('start_trip', {
        p_trip_id: tripId,
        p_start_location: loc
      });

      if (!error && data) {
        return { success: true, trip: mapDbTripToTrip(data) };
      }

      // Direct fallback
      const { data: updated, error: updateErr } = await supabase
        .from('trips')
        .update({
          status: 'In Transit',
          actual_departure: new Date().toISOString(),
          current_location: loc,
          progress_percent: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select('*')
        .single();

      if (updateErr) return { success: false, error: updateErr.message };
      return { success: true, trip: mapDbTripToTrip(updated) };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Driver completes trip with Proof of Delivery (POD)
   */
  async completeTripWithPOD(
    tripId: string,
    podNotes?: string,
    podImageUrl?: string
  ): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection not available.' };
    }

    try {
      const { data, error } = await supabase.rpc('complete_trip_with_pod', {
        p_trip_id: tripId,
        p_pod_notes: podNotes || 'Consignment delivered & verified by consignee.',
        p_pod_image_url: podImageUrl || null
      });

      if (!error && data) {
        return { success: true, trip: mapDbTripToTrip(data) };
      }

      // Direct fallback
      const { data: updated, error: updateErr } = await supabase
        .from('trips')
        .update({
          status: 'Delivered',
          actual_arrival: new Date().toISOString(),
          progress_percent: 100,
          distance_remaining_km: 0,
          pod_received: true,
          pod_notes: podNotes || 'Consignment delivered & verified by consignee.',
          pod_image_url: podImageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select('*')
        .single();

      if (updateErr) return { success: false, error: updateErr.message };
      return { success: true, trip: mapDbTripToTrip(updated) };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Create new trip dispatch
   */
  async createTrip(tripData: Partial<Trip>): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection not available.' };
    }

    try {
      // Get current user company_id
      const { data: userData } = await supabase.auth.getUser();
      let companyId = 'a0000000-0000-0000-0000-000000000001';
      if (userData?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', userData.user.id)
          .single();
        if (profile?.company_id) companyId = profile.company_id;
      }

      const tripCode = tripData.tripCode || `TRP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data, error } = await supabase
        .from('trips')
        .insert({
          company_id: companyId,
          trip_code: tripCode,
          vehicle_id: tripData.vehicleId || null,
          vehicle_reg: tripData.vehicleReg || null,
          driver_id: tripData.driverId || null,
          driver_name: tripData.driverName || null,
          origin: tripData.origin || { city: 'Mumbai', address: 'Bhiwandi Hub' },
          destination: tripData.destination || { city: 'Pune', address: 'Chakan Hub' },
          cargo_description: tripData.cargoDescription || 'Commercial Freight',
          cargo_weight_tons: tripData.cargoWeightTons || 20,
          status: tripData.status || (tripData.driverId ? 'Assigned' : 'Scheduled'),
          scheduled_departure: tripData.scheduledDeparture || new Date().toISOString(),
          scheduled_arrival: tripData.scheduledArrival || new Date(Date.now() + 6 * 3600000).toISOString(),
          distance_km: tripData.distanceKm || 148,
          distance_remaining_km: tripData.distanceRemainingKm || tripData.distanceKm || 148,
          eway_bill_number: tripData.ewayBillNumber,
          freight_revenue_inr: tripData.freightRevenueINR || 45000
        })
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, trip: mapDbTripToTrip(data) };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  }
};
