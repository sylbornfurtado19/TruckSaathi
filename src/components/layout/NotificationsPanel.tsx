'use client';

import React from 'react';
import { X, Bell, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'RC Document Expired',
      desc: 'Vehicle HR-55-AB-1290 Registration Certificate has expired.',
      time: '10 mins ago',
      group: 'Today',
      severity: 'danger' as const
    },
    {
      id: 2,
      title: 'Insurance Renewal Warning',
      desc: 'Vehicle KA-01-EA-9011 Insurance expires in 5 days.',
      time: '1 hour ago',
      group: 'Today',
      severity: 'warning' as const
    },
    {
      id: 3,
      title: 'Driver License Verified',
      desc: 'Driver Ramesh Kumar license verification completed successfully.',
      time: 'Yesterday',
      group: 'Earlier',
      severity: 'success' as const
    }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm glass-panel border-l border-[#202736] shadow-2xl p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#202736] pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-50">Notifications & Alerts</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {['Today', 'Earlier'].map(group => (
          <div key={group} className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{group}</div>
            {notifications
              .filter(n => n.group === group)
              .map(n => (
                <div key={n.id} className="p-3 rounded-xl bg-[#1c2333]/60 border border-[#202736] space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={n.severity}>{n.title}</Badge>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {n.time}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{n.desc}</p>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[#202736]">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Mark All as Read
        </Button>
      </div>
    </div>
  );
}
