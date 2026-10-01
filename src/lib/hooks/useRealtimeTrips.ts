'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { tripService, mapDbTripToTrip } from '@/lib/services/tripService';
import { Trip } from '@/types';

export function useRealtimeTrips(driverId?: string | null) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const loadInitialTrips = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const data = driverId
        ? await tripService.fetchDriverTrips(driverId)
        : await tripService.fetchTrips();
      setTrips(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    let isCancelled = false;

    if (!isSupabaseConfigured()) {
      return;
    }

    // Load initial async
    tripService
      .fetchTrips()
      .then((data) => {
        if (!isCancelled) {
          if (driverId) {
            setTrips(data.filter((t) => t.driverId === driverId));
          } else {
            setTrips(data);
          }
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load trips');
          setLoading(false);
        }
      });

    // Supabase Realtime Channel
    const channelName = driverId ? `driver-trips-${driverId}` : 'fleet-trips-all';
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          ...(driverId ? { filter: `driver_id=eq.${driverId}` } : {})
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            const newTrip = mapDbTripToTrip(payload.new);
            setTrips(prev => {
              if (prev.some(t => t.id === newTrip.id)) return prev;
              return [newTrip, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbTripToTrip(payload.new);
            setTrips(prev => {
              const exists = prev.some(t => t.id === updated.id);
              if (!exists) {
                // In driver mode, if a trip was just assigned to this driver, add it!
                if (!driverId || updated.driverId === driverId) {
                  return [updated, ...prev];
                }
                return prev;
              }
              return prev.map(t => (t.id === updated.id ? updated : t));
            });
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setTrips(prev => prev.filter(t => t.id !== oldId));
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // Connected
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`Realtime trips subscription error on channel ${channelName}`);
        }
      });

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  return {
    trips,
    loading,
    error,
    refresh: loadInitialTrips,
    activeTrip: trips.find(t => t.status === 'In Transit' || t.status === 'Accepted' || t.status === 'Assigned') || null
  };
}

export function useDriverTrips(driverId: string | null | undefined) {
  return useRealtimeTrips(driverId);
}
