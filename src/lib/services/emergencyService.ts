import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { EmergencyEvent } from '@/types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export interface DbEmergencyRow {
  id?: string;
  company_id?: string;
  driver_id?: string;
  driver_name?: string;
  vehicle_id?: string;
  vehicle_reg?: string;
  trip_id?: string;
  trip_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string;
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  triggered_at?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  notes?: string;
  created_at?: string;
}

export function mapDbEmergencyToModel(row: DbEmergencyRow): EmergencyEvent {
  return {
    id: row.id || '',
    companyId: row.company_id || '',
    driverId: row.driver_id,
    driverName: row.driver_name || 'Commercial Pilot',
    vehicleId: row.vehicle_id,
    vehicleReg: row.vehicle_reg || 'Fleet Asset',
    tripId: row.trip_id,
    tripCode: row.trip_code,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    locationName: row.location_name || 'Highway Corridor Checkpoint',
    status: row.status || 'ACTIVE',
    triggeredAt: row.triggered_at || new Date().toISOString(),
    acknowledgedBy: row.acknowledged_by,
    acknowledgedAt: row.acknowledged_at,
    resolvedAt: row.resolved_at,
    notes: row.notes,
    createdAt: row.created_at || new Date().toISOString()
  };
}

export const emergencyService = {
  /**
   * Driver triggers real Highway SOS broadcast to Supabase
   */
  async triggerSOS(params: {
    tripId?: string;
    vehicleId?: string;
    lat?: number;
    lng?: number;
    locationName?: string;
  }): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database connection not available.' };
    }

    try {
      // 1. Try RPC function
      const { data, error } = await supabase.rpc('trigger_emergency_sos', {
        p_trip_id: params.tripId || null,
        p_vehicle_id: params.vehicleId || null,
        p_lat: params.lat || 18.7542,
        p_lng: params.lng || 73.4072,
        p_location_name: params.locationName || 'Lonavala Expressway Corridor'
      });

      if (!error && data) {
        return { success: true, eventId: data };
      }

      // 2. Direct insert fallback
      const { data: newEvent, error: insertErr } = await supabase
        .from('emergency_events')
        .insert({
          company_id: 'a0000000-0000-0000-0000-000000000001',
          trip_id: params.tripId || null,
          vehicle_id: params.vehicleId || null,
          latitude: params.lat || 18.7542,
          longitude: params.lng || 73.4072,
          location_name: params.locationName || 'Lonavala Expressway Corridor',
          status: 'ACTIVE'
        })
        .select('*')
        .single();

      if (insertErr) return { success: false, error: insertErr.message };
      return { success: true, eventId: newEvent.id };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Fleet Manager acknowledges SOS
   */
  async acknowledgeSOS(emergencyId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'DB not configured' };

    try {
      const { error } = await supabase.rpc('acknowledge_emergency_sos', {
        p_emergency_id: emergencyId,
        p_notes: notes || 'Assistance team notified and dispatched.'
      });

      if (!error) return { success: true };

      // Fallback
      const { error: updateErr } = await supabase
        .from('emergency_events')
        .update({
          status: 'ACKNOWLEDGED',
          acknowledged_at: new Date().toISOString(),
          notes: notes || 'Acknowledged by Fleet Manager'
        })
        .eq('id', emergencyId);

      if (updateErr) return { success: false, error: updateErr.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Resolve SOS
   */
  async resolveSOS(emergencyId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'DB not configured' };

    try {
      const { error } = await supabase
        .from('emergency_events')
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString()
        })
        .eq('id', emergencyId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    }
  },

  /**
   * Fetch active emergency events
   */
  async fetchActiveEmergencyEvents(): Promise<EmergencyEvent[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('emergency_events')
        .select('*')
        .in('status', ['ACTIVE', 'ACKNOWLEDGED'])
        .order('triggered_at', { ascending: false });

      if (error || !data) return [];
      return data.map(mapDbEmergencyToModel);
    } catch {
      return [];
    }
  }
};
