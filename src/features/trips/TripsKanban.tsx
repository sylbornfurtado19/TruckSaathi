'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Truck,
  User,
  CreditCard,
  Eye,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Trip, TripStatus } from '@/types';
import { EwayBillBadge } from './EwayBillBadge';
import { useMotionSafe, springs, buttonPress } from '@/lib/motion';

interface TripsKanbanProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onUpdateStatus: (tripId: string, newStatus: TripStatus) => void;
}

interface ColumnConfig {
  id: TripStatus;
  title: string;
  statuses: TripStatus[];
  icon: React.ReactNode;
  headerColor: string;
  badgeBg: string;
  borderColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'Scheduled',
    title: 'Scheduled / Assigned',
    statuses: ['Scheduled', 'Assigned', 'Accepted'],
    icon: <Clock className="w-4 h-4 text-blue-400" />,
    headerColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  {
    id: 'In Transit',
    title: 'In Transit',
    statuses: ['In Transit'],
    icon: <Route className="w-4 h-4 text-brand-orange" />,
    headerColor: 'text-brand-orange',
    badgeBg: 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange',
    borderColor: 'border-brand-orange/20',
  },
  {
    id: 'Delayed',
    title: 'Delayed Freight',
    statuses: ['Delayed'],
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    headerColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    borderColor: 'border-amber-500/20',
  },
  {
    id: 'Delivered',
    title: 'Delivered & POD',
    statuses: ['Delivered'],
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    headerColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    borderColor: 'border-emerald-500/20',
  },
];

export function TripsKanban({ trips, onSelectTrip, onUpdateStatus }: TripsKanbanProps) {
  const { shouldReduce } = useMotionSafe();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const getNextStatus = (currentStatus: TripStatus): TripStatus | null => {
    switch (currentStatus) {
      case 'Scheduled':
      case 'Assigned':
      case 'Accepted':
        return 'In Transit';
      case 'In Transit':
        return 'Delivered';
      case 'Delayed':
        return 'In Transit';
      default:
        return null;
    }
  };

  const getPrevStatus = (currentStatus: TripStatus): TripStatus | null => {
    switch (currentStatus) {
      case 'In Transit':
        return 'Scheduled';
      case 'Delayed':
        return 'In Transit';
      case 'Delivered':
        return 'In Transit';
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map(col => {
        const columnTrips = trips.filter(t => col.statuses.includes(t.status));
        const totalTons = columnTrips.reduce((acc, t) => acc + (t.cargoWeightTons || 0), 0);

        return (
          <div
            key={col.id}
            className={`rounded-2xl border ${col.borderColor} bg-surface-muted/30 p-3.5 backdrop-blur-md flex flex-col min-h-[500px] transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/8">
              <div className="flex items-center gap-2">
                {col.icon}
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  {col.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded-full border font-bold ${col.badgeBg}`}>
                  {columnTrips.length}
                </span>
                <span className="text-text-muted text-[11px]">
                  {totalTons}T
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
              <AnimatePresence>
                {columnTrips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
                    <p className="text-xs">No active dispatches</p>
                  </div>
                ) : (
                  columnTrips.map(trip => {
                    const nextSt = getNextStatus(trip.status);
                    const prevSt = getPrevStatus(trip.status);

                    return (
                      <motion.div
                        key={trip.id}
                        layout
                        layoutId={`trip-card-${trip.id}`}
                        drag={shouldReduce ? false : 'y'}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.15}
                        onDragStart={() => setActiveDragId(trip.id)}
                        onDragEnd={() => setActiveDragId(null)}
                        whileHover={shouldReduce ? {} : { y: -2, scale: 1.01 }}
                        whileTap={shouldReduce ? {} : buttonPress}
                        transition={springs.smooth}
                        onClick={() => onSelectTrip(trip)}
                        className={`group relative rounded-xl border border-white/8 bg-surface p-3.5 shadow-sm hover:border-white/20 transition-all cursor-pointer ${
                          activeDragId === trip.id ? 'shadow-xl ring-2 ring-brand-orange z-20' : ''
                        }`}
                      >
                        {/* Top: Trip Code & E-Way countdown */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-brand-orange transition-colors">
                            {trip.tripCode}
                          </span>
                          <EwayBillBadge
                            ewayBillNumber={trip.ewayBillNumber}
                            ewayBillExpiry={trip.ewayBillExpiry}
                            size="sm"
                          />
                        </div>

                        {/* Corridor: Origin -> Destination */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary mb-2.5">
                          <span className="text-blue-400 truncate max-w-[90px]" title={trip.origin.city}>
                            {trip.origin.city}
                          </span>
                          <ArrowRight className="w-3 h-3 text-text-muted shrink-0" />
                          <span className="text-emerald-400 truncate max-w-[90px]" title={trip.destination.city}>
                            {trip.destination.city}
                          </span>
                        </div>

                        {/* Middle: Vehicle & Driver */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-muted/60 rounded-lg p-2 mb-2.5">
                          <div className="flex items-center gap-1.5 truncate text-text-secondary font-mono">
                            <Truck className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate">{trip.vehicleReg}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate text-text-secondary">
                            <User className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{trip.driverName.split(' ')[0]}</span>
                          </div>
                        </div>

                        {/* Bottom: Payload & Distance / Tolls */}
                        <div className="flex items-center justify-between text-[11px] text-text-muted border-t border-white/6 pt-2">
                          <span className="font-mono text-slate-300 font-medium">
                            {trip.cargoWeightTons}T Payload
                          </span>
                          <span className="font-mono">
                            {trip.distanceKm} km {trip.tollSpendINR ? `· ₹${trip.tollSpendINR}` : ''}
                          </span>
                        </div>

                        {/* Hover Quick Status Advance Toolbar */}
                        <div
                          className="mt-2.5 pt-2 border-t border-white/8 flex items-center justify-between text-xs"
                          onClick={e => e.stopPropagation()}
                        >
                          <div>
                            {prevSt && (
                              <button
                                onClick={() => onUpdateStatus(trip.id, prevSt)}
                                className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
                                title={`Revert to ${prevSt}`}
                              >
                                <ChevronLeft className="w-3 h-3" /> Back
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onSelectTrip(trip)}
                              className="p-1 rounded text-text-muted hover:text-brand-orange hover:bg-white/5"
                              title="Inspect Manifest"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {nextSt && (
                              <button
                                onClick={() => onUpdateStatus(trip.id, nextSt)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:text-amber-400 px-2 py-0.5 rounded bg-brand-orange/10 border border-brand-orange/20 hover:bg-brand-orange/20 transition-all"
                              >
                                {nextSt === 'In Transit' ? 'Dispatch' : nextSt === 'Delivered' ? 'Deliver' : nextSt}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

