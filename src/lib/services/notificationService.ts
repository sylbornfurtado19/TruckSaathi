import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Notification } from '@/types';

export function mapDbNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id || ''),
    companyId: String(row.company_id || ''),
    recipientUserId: row.recipient_user_id as string | undefined,
    recipientDriverId: row.recipient_driver_id as string | undefined,
    type: String(row.type || 'info'),
    title: String(row.title || ''),
    message: String(row.message || ''),
    metadata: row.metadata as Record<string, unknown> | undefined,
    read: Boolean(row.read),
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (error || !data) return [];
      return data.map(mapDbNotification);
    } catch {
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch (err) {
      console.warn('markAsRead error:', err);
    }
  }
};
