'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { telemetryService, mapDbLiveStateToModel } from '@/lib/services/telemetryService';
import { VehicleLiveState } from '@/types';

export function useRealtimeTelemetry(vehicleId?: string | null) {
  const [liveStates, setLiveStates] = useState<Record<string, VehicleLiveState>>({});
  const [selectedState, setSelectedState] = useState<VehicleLiveState | null>(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());

  const loadInitial = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const list = await telemetryService.fetchFleetLiveStates();
      const map: Record<string, VehicleLiveState> = {};
      list.forEach(item => {
        map[item.vehicleId] = item;
      });
      setLiveStates(map);

      if (vehicleId && map[vehicleId]) {
        setSelectedState(map[vehicleId]);
      }
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    let isCancelled = false;

    if (!isSupabaseConfigured()) {
      return;
    }

    telemetryService
      .fetchFleetLiveStates()
      .then(list => {
        if (!isCancelled) {
          const map: Record<string, VehicleLiveState> = {};
          list.forEach(item => {
            map[item.vehicleId] = item;
          });
          setLiveStates(map);

          if (vehicleId && map[vehicleId]) {
            setSelectedState(map[vehicleId]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    const channelName = vehicleId ? `telemetry-${vehicleId}` : 'telemetry-all-fleet';
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_live_state',
          ...(vehicleId ? { filter: `vehicle_id=eq.${vehicleId}` } : {})
        },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updated = mapDbLiveStateToModel(payload.new);
            setLiveStates(prev => ({
              ...prev,
              [updated.vehicleId]: updated
            }));

            if (!vehicleId || updated.vehicleId === vehicleId) {
              setSelectedState(updated);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  return {
    liveStates,
    selectedState,
    loading,
    refresh: loadInitial
  };
}

export function useVehicleTelemetry(vehicleId: string | null | undefined) {
  return useRealtimeTelemetry(vehicleId);
}
