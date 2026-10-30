'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Truck,
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  CheckSquare,
  Clock,
  Navigation,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Trip } from '@/types';
import { TripTimeline } from './TripTimeline';
import { EwayBillBadge } from './EwayBillBadge';
import { useMotionSafe, slideOverVariants } from '@/lib/motion';

interface TripInspectModalProps {
  trip: Trip | null;
  onClose: () => void;
  onMarkDelivered: (tripId: string, notes: string) => void;
}

export function TripInspectModal({ trip, onClose, onMarkDelivered }: TripInspectModalProps) {
  const { shouldReduce } = useMotionSafe();
  const [podNotes, setPodNotes] = useState(trip?.podNotes || '');

  if (!trip) return null;

  const handleConfirmDelivery = () => {
    onMarkDelivered(trip.id, podNotes || 'POD physically verified and signed by consignee.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-canvas/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          variants={slideOverVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-screen max-w-xl bg-surface border-l border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Drawer Top Header */}
          <div className="px-6 py-4 border-b border-white/8 bg-surface-muted/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-brand-orange px-2.5 py-1 rounded-md bg-brand-orange/15 border border-brand-orange/30">
                {trip.tripCode}
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Trip Manifest & Telematics</h3>
                <p className="text-xs text-text-secondary">
                  {trip.origin.city} → {trip.destination.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <EwayBillBadge
                ewayBillNumber={trip.ewayBillNumber}
                ewayBillExpiry={trip.ewayBillExpiry}
                size="sm"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Animated Vertical Highway Corridor */}
            <TripTimeline trip={trip} />

            {/* 2. Asset & Assigned Driver Pilot Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-surface-muted/50 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Commercial Asset</span>
                </div>
                <div className="font-mono text-sm font-bold text-slate-100">
                  {trip.vehicleReg}
                </div>
                <div className="text-[11px] text-text-muted">
                  Gross Payload: {trip.cargoWeightTons} Tons
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-surface-muted/50 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assigned Pilot</span>
                </div>
                <div className="text-sm font-bold text-slate-100 truncate">
                  {trip.driverName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Sarathi Verified Pilot
                </div>
              </div>
            </div>

            {/* 3. Cargo Manifest & Compliance */}
            <div className="rounded-xl border border-white/8 bg-surface-muted/50 p-4 space-y-3">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Consignment Details
              </div>
              <div className="flex items-start justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-200 font-semibold">{trip.cargoDescription}</span>
                  <div className="text-text-muted mt-0.5">Payload Weight: {trip.cargoWeightTons} Metric Tons</div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-emerald-400 font-bold">Standard Transit</span>
                  <div className="text-text-muted text-[11px]">{trip.distanceKm} km route</div>
                </div>
              </div>

              {trip.ewayBillNumber && (
                <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>GST E-Way Bill:</span>
                  </div>
                  <span className="text-slate-200 font-semibold">{trip.ewayBillNumber}</span>
                </div>
              )}
            </div>

            {/* 4. Proof of Delivery (POD) Verification */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Proof of Delivery (POD) Verification
              </div>

              {trip.podReceived ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>POD Verified & Cryptographically Timestamped</span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {trip.podNotes || 'Consignee seal verified and physical delivery signed.'}
                  </p>
                  {trip.actualArrival && (
                    <div className="text-[11px] font-mono text-emerald-300/80">
                      Completed at: {trip.actualArrival}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-white/8 bg-surface-muted/50 p-4">
                  <label className="text-xs font-medium text-text-secondary block">
                    Consignee Receiving Notes & Seal Number
                  </label>
                  <textarea
                    rows={2}
                    value={podNotes}
                    onChange={e => setPodNotes(e.target.value)}
                    placeholder="Enter consignee signature details, gate pass number, or delivery receipt notes..."
                    className="w-full rounded-lg border border-white/10 bg-canvas px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
                  />
                  <button
                    onClick={handleConfirmDelivery}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Delivery & Authorize POD
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Bottom Footer */}
          <div className="px-6 py-3 border-t border-white/8 bg-surface-muted/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
            >
              Close Manifest
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

