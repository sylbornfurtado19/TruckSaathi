'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, CreditCard, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Trip } from '@/types';
import { useMotionSafe } from '@/lib/motion';

interface TripTimelineProps {
  trip: Trip;
}

export function TripTimeline({ trip }: TripTimelineProps) {
  const { shouldReduce } = useMotionSafe();

  const isDelivered = trip.status === 'Delivered';
  const isInTransit = trip.status === 'In Transit';
  const isDelayed = trip.status === 'Delayed';

  // Calculate or mock progress percentage
  const progress = trip.progressPercent ?? (isDelivered ? 100 : isInTransit ? 48 : 0);
  const distanceCovered = Math.round((progress / 100) * trip.distanceKm);
  const distanceRemaining = Math.max(0, trip.distanceKm - distanceCovered);

  // Simulated intermediate highway checkpoints along Indian freight corridors
  const checkpoints = [
    {
      id: 'cp-origin',
      title: `${trip.origin.city} Logistics Hub`,
      subtitle: trip.origin.address || 'Central Outbound Depot',
      time: trip.actualDeparture || trip.scheduledDeparture,
      type: 'origin' as const,
      completed: true,
    },
    {
      id: 'cp-toll-1',
      title: 'FASTag Toll Plaza (NH-48 Km 142)',
      subtitle: 'Electronic Toll Deducted: ₹420',
      time: 'Toll plaza cleared',
      type: 'toll' as const,
      completed: progress >= 25,
    },
    {
      id: 'cp-mid',
      title: trip.currentCheckpoint || 'State Border Freight Inspection / RTO Checkpoint',
      subtitle: 'Corridor Transit Weighbridge #3',
      time: 'OBD-II Telemetry Normal',
      type: 'waypoint' as const,
      completed: progress >= 50,
      active: isInTransit && progress >= 25 && progress < 75,
    },
    {
      id: 'cp-toll-2',
      title: 'Interstate Toll Plaza (Km 380)',
      subtitle: 'Electronic Toll Deducted: ₹650',
      time: progress >= 75 ? 'Cleared' : 'Upcoming Toll Plaza',
      type: 'toll' as const,
      completed: progress >= 75,
    },
    {
      id: 'cp-dest',
      title: `${trip.destination.city} Freight Terminal`,
      subtitle: trip.destination.address || 'Inbound Consignee Receiving Bay',
      time: trip.actualArrival || `ETA: ${trip.scheduledArrival}`,
      type: 'destination' as const,
      completed: isDelivered,
    },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-white/8 bg-surface-muted/60 p-4 backdrop-blur-md">
      {/* Route Header Metrics */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-orange" />
          <span className="font-semibold text-text-primary">National Highway Corridor</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="text-text-muted">{trip.distanceKm} km total</span>
          <span className="h-3 w-px bg-white/10" />
          <span className="text-brand-orange font-bold">{progress}% completed</span>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 relative">
          <motion.div
            className={`h-full rounded-full ${
              isDelivered
                ? 'bg-emerald-500'
                : isDelayed
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-brand-orange to-amber-400'
            }`}
            initial={shouldReduce ? { width: `${progress}%` } : { width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-text-muted">
          <span>{distanceCovered} km logged</span>
          <span>{distanceRemaining} km remaining</span>
        </div>
      </div>

      {/* Vertical Animated Corridor Timeline */}
      <div className="relative pl-6 pt-2 pb-1 space-y-6">
        {/* Animated Dashed Vertical Track */}
        <div className="absolute left-[11px] top-4 bottom-4 w-[2px]">
          {/* Base track */}
          <div className="w-full h-full bg-white/10" />
          {/* Active progress track */}
          <motion.div
            className="absolute top-0 left-0 w-full bg-brand-orange"
            initial={shouldReduce ? { height: `${progress}%` } : { height: '0%' }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Running dashed centerline */}
          {!shouldReduce && isInTransit && (
            <motion.div
              className="absolute inset-0 w-full"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, #ff6b00, #ff6b00 4px, transparent 4px, transparent 8px)',
              }}
              animate={{ backgroundPositionY: ['0px', '24px'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          )}
        </div>

        {/* Checkpoint Nodes */}
        {checkpoints.map((cp, idx) => {
          const isCheckpointActive = cp.active;
          const isCompleted = cp.completed;

          return (
            <div key={cp.id} className="relative flex items-start gap-3.5 group">
              {/* Node Icon Indicator */}
              <div
                className={`relative z-10 flex h-6 w-6 -ml-6 items-center justify-center rounded-full border transition-all ${
                  isCheckpointActive
                    ? 'border-brand-orange bg-brand-orange text-black shadow-[0_0_12px_rgba(255,107,0,0.6)]'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 bg-canvas text-text-muted'
                }`}
              >
                {cp.type === 'origin' ? (
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                ) : cp.type === 'destination' ? (
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                ) : cp.type === 'toll' ? (
                  <CreditCard className="w-3 h-3 text-indigo-300" />
                ) : isCheckpointActive ? (
                  <Truck className="w-3 h-3 animate-pulse text-black" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                )}

                {/* Halo pulse for active marker */}
                {isCheckpointActive && !shouldReduce && (
                  <span className="absolute -inset-1 rounded-full border border-brand-orange/50 animate-ping opacity-75" />
                )}
              </div>

              {/* Checkpoint Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-semibold truncate ${
                    isCheckpointActive ? 'text-brand-orange font-bold' : isCompleted ? 'text-text-primary' : 'text-text-secondary'
                  }`}>
                    {cp.title}
                  </h4>
                  <span className="font-mono text-[10px] text-text-muted shrink-0">
                    {cp.time}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">
                  {cp.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FASTag Toll Summary Pill */}
      {trip.tollSpendINR ? (
        <div className="flex items-center justify-between rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-300">
            <CreditCard className="w-3.5 h-3.5" />
            <span>NHAI FASTag Electronic Toll Collection</span>
          </div>
          <span className="font-mono font-bold text-slate-100">
            ₹{trip.tollSpendINR.toLocaleString('en-IN')}
          </span>
        </div>
      ) : null}
    </div>
  );
}

