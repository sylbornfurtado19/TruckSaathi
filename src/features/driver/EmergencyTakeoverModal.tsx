'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, PhoneCall, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useMotionSafe } from '@/lib/motion';

interface EmergencyTakeoverModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  driverName: string;
  vehicleReg: string;
  locationCity?: string;
  isAcknowledged?: boolean;
}

export function EmergencyTakeoverModal({
  isOpen,
  onDismiss,
  driverName,
  vehicleReg,
  locationCity = 'Mumbai-Pune Expressway (Km 42)',
  isAcknowledged = false
}: EmergencyTakeoverModalProps) {
  const { shouldReduce } = useMotionSafe();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Full-screen Crimson Pulse Vignette Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-md transition-colors duration-500 ${
          isAcknowledged ? 'bg-emerald-950/80' : 'bg-rose-950/85'
        }`}
      />

      {/* Concentric expanding ripples around center */}
      {!shouldReduce && !isAcknowledged && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <motion.div
            className="absolute w-64 h-64 rounded-full border-2 border-rose-500/50"
            animate={{ scale: [1, 3], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full border-2 border-rose-500/40"
            animate={{ scale: [1, 3], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
          />
        </div>
      )}

      {/* Main Takeover Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        className={`relative z-10 w-full max-w-lg rounded-3xl border-2 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl transition-all ${
          isAcknowledged
            ? 'border-emerald-500/50 bg-surface shadow-[0_0_50px_rgba(16,185,129,0.3)]'
            : 'border-rose-500/70 bg-surface shadow-[0_0_60px_rgba(239,68,68,0.4)]'
        }`}
      >
        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Animated Icon Badge */}
        <div className="flex justify-center mb-5">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-2xl border shadow-inner ${
              isAcknowledged
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                : 'border-rose-500/50 bg-rose-500/20 text-rose-400'
            }`}
          >
            {isAcknowledged ? (
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            ) : (
              <AlertOctagon className="w-10 h-10 animate-pulse text-rose-400" />
            )}
          </div>
        </div>

        {/* Broadcast Status Headings */}
        <div className="space-y-2">
          <span
            className={`font-mono text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
              isAcknowledged
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
            }`}
          >
            {isAcknowledged ? 'Assistance Mobilized' : 'Emergency SOS Broadcast Active'}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isAcknowledged
              ? 'Fleet Command Acknowledged Alert'
              : 'Help Is Being Alerted'}
          </h2>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {isAcknowledged
              ? 'Fleet Manager has acknowledged your SOS. Emergency roadside units & NHAI medical patrol have been dispatched to your vehicle.'
              : 'Your GPS coordinates and OBD-II vehicle telematics are broadcasting live to Fleet Control and highway assistance patrol.'}
          </p>
        </div>

        {/* Telematics Coordinates Card */}
        <div className="mt-5 rounded-2xl border border-white/8 bg-canvas/70 p-4 font-mono text-xs text-left space-y-2">
          <div className="flex justify-between border-b border-white/8 pb-2">
            <span className="text-text-muted">Assigned Pilot:</span>
            <span className="font-bold text-slate-100">{driverName}</span>
          </div>
          <div className="flex justify-between border-b border-white/8 pb-2">
            <span className="text-text-muted">Commercial Vehicle:</span>
            <span className="font-bold text-slate-100">{vehicleReg}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Corridor Location:</span>
            <span className="font-bold text-brand-orange">{locationCity}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="tel:112"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg active:scale-98 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            Call Highway Police (112)
          </a>
          <button
            onClick={onDismiss}
            className="flex-1 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
          >
            Cancel False Alarm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
