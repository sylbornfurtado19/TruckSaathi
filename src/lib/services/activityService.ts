import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ActivityLog } from '@/types';

export const activityService = {
  async fetchActivityLogs(): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data) return [];
      return data.map((row: Record<string, unknown>) => {
        const meta = (row.metadata as Record<string, unknown>) || {};
        return {
          id: String(row.id || ''),
          timestamp: new Date(String(row.created_at || new Date().toISOString())).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: String(meta.driver_name || meta.user_name || 'System'),
          role: String(row.module || 'Fleet Operations'),
          action: String(row.action || ''),
          module: String(row.module || '')
        };
      });
    } catch {
      return [];
    }
  },

  async logActivity(action: string, module: string, metadata?: Record<string, unknown>): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('activity_logs').insert({
        company_id: 'a0000000-0000-0000-0000-000000000001',
        user_id: userData?.user?.id || null,
        action,
        module,
        metadata: metadata || {}
      });
    } catch (err) {
      console.warn('logActivity error:', err);
    }
  }
};
