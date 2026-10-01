'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { emergencyService, mapDbEmergencyToModel } from '@/lib/services/emergencyService';
import { EmergencyEvent } from '@/types';

export function useRealtimeSOS() {
  const [activeEvents, setActiveEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());

  const loadInitial = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const list = await emergencyService.fetchActiveEmergencyEvents();
      setActiveEvents(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!isSupabaseConfigured()) {
      return;
    }

    emergencyService
      .fetchActiveEmergencyEvents()
      .then((list) => {
        if (!isCancelled) {
          setActiveEvents(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    const channel = supabase
      .channel('emergency-sos-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_events'
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            const newEv = mapDbEmergencyToModel(payload.new);
            setActiveEvents(prev => [newEv, ...prev.filter(e => e.id !== newEv.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbEmergencyToModel(payload.new);
            setActiveEvents(prev => {
              if (updated.status === 'RESOLVED') {
                return prev.filter(e => e.id !== updated.id);
              }
              return prev.map(e => (e.id === updated.id ? updated : e));
            });
          } else if (payload.eventType === 'DELETE') {
            setActiveEvents(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    activeEvents,
    hasActiveSOS: activeEvents.some(e => e.status === 'ACTIVE'),
    latestActiveSOS: activeEvents.find(e => e.status === 'ACTIVE') || null,
    loading,
    refresh: loadInitial,
    acknowledgeSOS: emergencyService.acknowledgeSOS,
    resolveSOS: emergencyService.resolveSOS,
    triggerSOS: emergencyService.triggerSOS
  };
}
