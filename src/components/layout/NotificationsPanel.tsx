'use client';

import React from 'react';
import { X, Bell, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

import { useApp } from '@/context/AppContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { currentUser, currentDriver } = useApp();
  if (!isOpen) return null;

  const isDriver = currentUser?.role === 'Driver';

  const notifications = isDriver
    ? [
        {
          id: 1,
          title: 'Dispatch Manifest Assigned',
          desc: 'Your route manifest and digital e-way bill have been updated by dispatch.',
          time: '15 mins ago',
          group: 'Today',
          severity: 'info' as const
        },
        {
          id: 2,
          title: 'Safety Telemetry Score',
          desc: `Your safety compliance rating is currently ${currentDriver?.safetyScore || 94}%. Zero overspeed violations reported.`,
          time: '2 hours ago',
          group: 'Today',
          severity: 'success' as const
        },
        {
          id: 3,
          title: 'Driver License Verified',
          desc: `License ${currentDriver?.licenseNumber || 'Active'} is verified and compliant.`,
          time: 'Yesterday',
          group: 'Earlier',
          severity: 'success' as const
        }
      ]
    : [
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
          desc: 'Driver license verification completed successfully.',
          time: 'Yesterday',
          group: 'Earlier',
          severity: 'success' as const
        }
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md space-y-6 rounded-card border border-border bg-surface p-6 shadow-popover">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-focus" />
            <h2 className="text-base font-bold text-text-primary">Notifications and alerts</h2>
          </div>
          <button onClick={onClose} className="rounded-control p-1 text-text-secondary hover:bg-surface-muted" aria-label="Close notifications">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-sm">
          {['Today', 'Earlier'].map(group => (
            <div key={group} className="space-y-2">
              <div className="text-xs font-semibold text-text-muted">{group}</div>
              {notifications
                .filter(n => n.group === group)
                .map(n => (
                  <div key={n.id} className="space-y-2 rounded-control border border-border bg-surface-muted p-3.5">
                    <div className="flex items-center justify-between">
                      <Badge variant={n.severity}>{n.title}</Badge>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" /> {n.time}
                      </span>
                    </div>
                    <p className="leading-relaxed text-text-secondary">{n.desc}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-2">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Mark All as Read
          </Button>
        </div>
      </div>
    </div>
  );
}
