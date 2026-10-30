'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, PhoneCall, ShieldAlert, CheckCircle2, MapPin, Gauge } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function EmergencyBroadcastBanner() {
  const { simState, activeEmergency, acknowledgeSOS, clearSOS } = useApp();

  const isEmergencyActive = Boolean(
    simState.sosActive || (activeEmergency && activeEmergency.status === 'ACTIVE')
  );

  const vehicleReg = activeEmergency?.vehicleReg || simState.vehicleReg || 'MH-12-Q-4521';
  const driverName = activeEmergency?.driverName || simState.driverName || 'Ramesh Kumar';
  const locationCity = simState.location?.city || activeEmergency?.locationName || 'NH-48 Corridor';
  const checkpoint = simState.currentCheckpoint || 'Khandala Ghat Descent Sector';
  const lat = simState.location?.lat || activeEmergency?.latitude || 18.7495;
  const lng = simState.location?.lng || activeEmergency?.longitude || 73.3712;
  const speed = simState.speedKmh ?? 0;

  const handleAcknowledge = async () => {
    if (activeEmergency?.id) {
      await acknowledgeSOS(activeEmergency.id);
    }
    clearSOS();
  };

  return (
    <AnimatePresence>
      {isEmergencyActive && (
        <>
          {/* Full-screen pulsing red emergency vignette alert */}
          <div className="pointer-events-none fixed inset-0 z-50 animate-pulse border-8 border-rose-600/60 shadow-[inset_0_0_100px_rgba(225,29,72,0.45)]" />

          {/* Top Sticky Broadcast Siren Banner */}
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="sticky top-0 z-50 w-full border-b-2 border-rose-500 bg-gradient-to-r from-red-950 via-rose-900 to-red-950 px-4 py-2.5 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-[1520px] flex-wrap items-center justify-between gap-3">
              {/* Left: Pulsing Siren Badge & Vital Driver Telemetry */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
                  <AlertOctagon className="h-4 w-4" />
                  <span>CRITICAL HIGHWAY SOS BROADCAST</span>
                </span>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-rose-200">
                    Asset: <strong className="text-white underline">{vehicleReg}</strong>
                  </span>
                  <span className="text-rose-400">•</span>
                  <span className="font-semibold text-rose-200">
                    Pilot: <strong className="text-white">{driverName}</strong>
                  </span>
                  <span className="text-rose-400">•</span>
                  <span className="inline-flex items-center gap-1 text-rose-200">
                    <MapPin className="h-3.5 w-3.5 text-rose-300" />
                    <span>{locationCity} ({checkpoint})</span>
                  </span>
                  <span className="text-rose-400">•</span>
                  <span className="font-mono text-[11px] text-rose-300">
                    [{lat.toFixed(4)}, {lng.toFixed(4)}]
                  </span>
                  <span className="text-rose-400">•</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-200">
                    <Gauge className="h-3 w-3" />
                    <span>{speed} km/h</span>
                  </span>
                </div>
              </div>

              {/* Right: Emergency Command Actions */}
              <div className="flex items-center gap-2">
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call 112 / Police</span>
                </a>

                <button
                  type="button"
                  onClick={handleAcknowledge}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-black shadow-lg hover:bg-emerald-400 active:scale-98 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Acknowledge & Dispatch Assistance</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
