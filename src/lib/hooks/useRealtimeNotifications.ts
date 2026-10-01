'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { notificationService, mapDbNotification } from '@/lib/services/notificationService';
import { Notification } from '@/types';

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadInitial = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const list = await notificationService.fetchNotifications();
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (err) {
      console.warn('loadInitial notifications err:', err);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!isSupabaseConfigured()) return;

    notificationService
      .fetchNotifications()
      .then(list => {
        if (!isCancelled) {
          setNotifications(list);
          setUnreadCount(list.filter(n => !n.read).length);
        }
      })
      .catch(() => {});

    const channel = supabase
      .channel('user-notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            const item = mapDbNotification(payload.new);
            setNotifications(prev => [item, ...prev]);
            setUnreadCount(c => c + 1);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbNotification(payload.new);
            setNotifications(prev => prev.map(n => (n.id === updated.id ? updated : n)));
            setUnreadCount(prev => (updated.read ? Math.max(0, prev - 1) : prev));
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    refresh: loadInitial
  };
}
