import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { VehicleLiveState } from '@/types';

export interface DbLiveStateRow {
  vehicle_id?: string;
  company_id?: string;
  trip_id?: string;
  driver_id?: string;
  vehicle_reg?: string;
  driver_name?: string;
  latitude?: number;
  longitude?: number;
  speed_kmh?: number;
  fuel_percent?: number;
  engine_temp_c?: number;
  engine_rpm?: number;
  odometer_km?: number;
  progress_percent?: number;
  distance_remaining_km?: number;
  current_checkpoint?: string;
  next_milestone?: string;
  is_moving?: boolean;
  is_sos?: boolean;
  updated_at?: string;
}

export function mapDbLiveStateToModel(row: DbLiveStateRow): VehicleLiveState {
  return {
    vehicleId: row.vehicle_id || '',
    companyId: row.company_id || '',
    tripId: row.trip_id,
    driverId: row.driver_id,
    vehicleReg: row.vehicle_reg || 'Commercial Asset',
    driverName: row.driver_name || 'Pilot',
    latitude: Number(row.latitude || 19.076),
    longitude: Number(row.longitude || 72.8777),
    speedKmh: Number(row.speed_kmh || 0),
    fuelPercent: Number(row.fuel_percent || 75),
    engineTempC: Number(row.engine_temp_c || 86),
    engineRpm: Number(row.engine_rpm || 1850),
    odometerKm: Number(row.odometer_km || 124892),
    progressPercent: Number(row.progress_percent || 0),
    distanceRemainingKm: Number(row.distance_remaining_km || 148),
    currentCheckpoint: row.current_checkpoint || 'Mumbai Hub',
    nextMilestone: row.next_milestone || 'Kalamboli Expressway (28 km)',
    isMoving: Boolean(row.is_moving),
    isSos: Boolean(row.is_sos),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

export const telemetryService = {
  /**
   * Publish latest vehicle telemetry tick to Supabase
   * Throttled by simulation loop (every 2-4s)
   */
  async publishTelemetry(payload: {
    vehicleId: string;
    tripId?: string;
    latitude: number;
    longitude: number;
    speedKmh: number;
    fuelPercent?: number;
    engineTempC?: number;
    engineRpm?: number;
    odometerKm?: number;
    progressPercent?: number;
    distanceRemainingKm?: number;
    currentCheckpoint?: string;
    nextMilestone?: string;
    isMoving?: boolean;
    isSos?: boolean;
  }): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      // 1. Call RPC function if available for high-speed atomic update
      const { error: rpcErr } = await supabase.rpc('update_vehicle_telemetry', {
        p_vehicle_id: payload.vehicleId,
        p_trip_id: payload.tripId || null,
        p_lat: payload.latitude,
        p_lng: payload.longitude,
        p_speed: payload.speedKmh,
        p_fuel: payload.fuelPercent ?? 68,
        p_engine_temp: payload.engineTempC ?? 86,
        p_engine_rpm: payload.engineRpm ?? 1850,
        p_odometer: payload.odometerKm ?? 124892,
        p_progress: payload.progressPercent ?? 0,
        p_distance_remaining: payload.distanceRemainingKm ?? 148,
        p_checkpoint: payload.currentCheckpoint || 'Corridor Checkpoint',
        p_next_milestone: payload.nextMilestone || 'Next Toll Plaza'
      });

      if (!rpcErr) return;

      // 2. Direct upsert fallback
      await supabase
        .from('vehicle_live_state')
        .upsert(
          {
            vehicle_id: payload.vehicleId,
            trip_id: payload.tripId || null,
            latitude: payload.latitude,
            longitude: payload.longitude,
            speed_kmh: payload.speedKmh,
            fuel_percent: payload.fuelPercent ?? 68,
            engine_temp_c: payload.engineTempC ?? 86,
            engine_rpm: payload.engineRpm ?? 1850,
            odometer_km: payload.odometerKm ?? 124892,
            progress_percent: payload.progressPercent ?? 0,
            distance_remaining_km: payload.distanceRemainingKm ?? 148,
            current_checkpoint: payload.currentCheckpoint,
            next_milestone: payload.nextMilestone,
            is_moving: payload.speedKmh > 0,
            is_sos: Boolean(payload.isSos),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'vehicle_id' }
        );
    } catch (err) {
      console.warn('telemetryService.publishTelemetry error:', err);
    }
  },

  /**
   * Fetch all active vehicle live states for the company
   */
  async fetchFleetLiveStates(): Promise<VehicleLiveState[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('vehicle_live_state')
        .select('*');

      if (error || !data) return [];
      return data.map(mapDbLiveStateToModel);
    } catch {
      return [];
    }
  },

  /**
   * Fetch live state for a single vehicle
   */
  async fetchVehicleLiveState(vehicleId: string): Promise<VehicleLiveState | null> {
    if (!isSupabaseConfigured() || !vehicleId) return null;

    try {
      const { data, error } = await supabase
        .from('vehicle_live_state')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .single();

      if (error || !data) return null;
      return mapDbLiveStateToModel(data);
    } catch {
      return null;
    }
  }
};
