'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Bell, Clock, Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { springs, durations, staggerContainer, staggerItem } from '@/lib/motion';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { currentUser, currentDriver, simState } = useApp();
  const shouldReduce = useReducedMotion();

  const isDriver = currentUser?.role === 'Driver';

  const notifications = isDriver
    ? [
        {
          id: 1,
          title: 'Dispatch Manifest Assigned',
          desc: `Manifest for corridor route active. Vehicle ${simState.vehicleReg}.`,
          time: '15 mins ago',
          group: 'Today',
          severity: 'info' as const
        },
        {
          id: 2,
          title: 'Safety Telemetry Score',
          desc: `Your safety compliance rating is currently ${currentDriver?.safetyScore || 94}%. Zero overspeed violations.`,
          time: '2 hours ago',
          group: 'Today',
          severity: 'success' as const
        },
        {
          id: 3,
          title: 'Commercial Pilot License Verified',
          desc: `License ${currentDriver?.licenseNumber || 'Active'} is verified and compliant with RTO norms.`,
          time: 'Yesterday',
          group: 'Earlier',
          severity: 'success' as const
        }
      ]
    : [
        {
          id: 1,
          title: 'RC Document Expired',
          desc: 'Vehicle HR-55-AB-1290 Registration Certificate has expired. Grounded for inspection.',
          time: '10 mins ago',
          group: 'Today',
          severity: 'danger' as const
        },
        {
          id: 2,
          title: 'Insurance Renewal Warning',
          desc: 'Vehicle KA-01-EA-9011 Insurance expires in 5 days. Schedule renewal.',
          time: '1 hour ago',
          group: 'Today',
          severity: 'warning' as const
        },
        {
          id: 3,
          title: 'Driver Pilot License Verified',
          desc: 'Driver license verification completed successfully for Ramesh Kumar.',
          time: 'Yesterday',
          group: 'Earlier',
          severity: 'success' as const
        }
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.fast }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs cursor-default"
            onClick={onClose}
            aria-label="Close notifications panel"
          />

          {/* Slide-Over Drawer */}
          <motion.aside
            initial={shouldReduce ? { opacity: 0 } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { x: '100%' }}
            transition={springs.smooth}
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/12 bg-surface p-5 shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-orange/30 bg-brand-orange/15 text-brand-orange">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Alerts & Notifications
                    </h2>
                    <p className="text-[11px] text-text-muted">
                      {isDriver ? 'Driver Cockpit Feed' : 'Fleet Command Dispatch Alerts'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Staggered Notifications Feed */}
              <div className="mt-4 max-h-[calc(100vh-160px)] space-y-4 overflow-y-auto pr-1">
                {['Today', 'Earlier'].map(group => {
                  const groupItems = notifications.filter(n => n.group === group);
                  if (groupItems.length === 0) return null;

                  return (
                    <motion.div
                      key={group}
                      variants={staggerContainer(0.06)}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2.5"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1">
                        {group}
                      </div>
                      {groupItems.map(n => (
                        <motion.div
                          key={n.id}
                          variants={staggerItem}
                          className="rounded-xl border border-white/8 bg-surface-muted/60 p-3.5 space-y-2 hover:border-white/16 transition-colors shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={n.severity}>{n.title}</Badge>
                            <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted shrink-0">
                              <Clock className="h-3 w-3" /> {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{n.desc}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-white/8 pt-3 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={onClose}
                icon={<Check className="h-3.5 w-3.5" />}
              >
                Mark All as Read
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
