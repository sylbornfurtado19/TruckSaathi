'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  CheckCircle2,
  AlertOctagon,
  MapPin,
  Truck,
  ShieldCheck,
  FileCheck,
  Navigation,
  Camera,
  Gauge,
  Fuel,
  Thermometer,
  RotateCcw,
  Play,
  Pause,
  Radio,
  FileText
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, AnimatedPage, itemVariants } from '@/components/ui';

export function DriverPortalContent() {
  const {
    trips,
    currentUser,
    currentDriver,
    simState,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    triggerSOS,
    clearSOS,
    uploadSimulationPOD
  } = useApp();

  const [podNotes, setPodNotes] = useState('');
  const [uploaded, setUploaded] = useState(false);

  // Active trip (use trp-1 or matching driver trip)
  const activeTrip = trips.find(t => t.id === 'trp-1') || trips[0];
  const driverDisplayName = currentDriver?.fullName || currentUser?.name || 'Ramesh Kumar';

  const handleUploadPOD = (e: React.FormEvent) => {
    e.preventDefault();
    uploadSimulationPOD(podNotes || 'Signed LR copy captured via camera.');
    setUploaded(true);
    setTimeout(() => setUploaded(false), 5000);
  };

  const handleTriggerSOS = () => {
    triggerSOS(driverDisplayName);
  };

  return (
    <AnimatedPage>
      {/* 1. Driver Portal Header */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-[#0c0f17] rounded-[10px] flex items-center justify-center text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">
                TRUCKSAATHI DRIVER OPERATING SYSTEM
              </div>
              <h1 className="text-lg font-black text-white">{driverDisplayName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {simState.tripStatus === 'Delivered' ? (
              <Badge variant="success" className="px-3 py-1 text-xs">
                Trip Delivered
              </Badge>
            ) : simState.isRunning ? (
              <Badge variant="cyan" pulse className="px-3 py-1 text-xs font-mono">
                Driving Live
              </Badge>
            ) : (
              <Badge variant="warning" className="px-3 py-1 text-xs font-mono">
                En Route (Standby)
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Mobile-Centric Field Command Container */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-4">
        {/* Live Simulation Cockpit Speedometer & OBD-II Strip */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121624] via-[#10141f] to-[#0c0f17] border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar: Vehicle Info & Speed Multiplier */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-black text-white text-sm">{simState.vehicleReg}</span>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                Signa 4825.T
              </span>
            </div>

            {/* Quick Simulation Trigger on Driver Screen */}
            <div className="flex items-center gap-2">
              {simState.isRunning ? (
                <button
                  type="button"
                  onClick={() => pauseSimulation()}
                  className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startSimulation(simState.speedMultiplier || 1)}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 hover:brightness-110 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Run
                </button>
              )}
              <button
                type="button"
                onClick={() => resetSimulation()}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Digital Speedometer Centerpiece */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-center">
            {/* Speed Display */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-around">
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                  REAL-TIME GPS SPEED
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mt-1 flex items-baseline justify-center gap-1.5">
                  <span>{simState.speedKmh}</span>
                  <span className="text-xs font-bold text-cyan-400 font-sans uppercase">km/h</span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-emerald-400 font-semibold flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Speed Limit: 80 km/h (Nominal)
                </div>
              </div>

              <div className="h-12 w-px bg-white/[0.08]" />

              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                  ODOMETER
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight mt-1">
                  {simState.odometerKm}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Total Km</div>
              </div>
            </div>

            {/* Live Corridor Progress Capsule */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between h-full">
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                TRIP PROGRESS
              </div>
              <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight my-1">
                {simState.progressPercent}%
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                {simState.distanceRemainingKm} km left
              </div>
            </div>
          </div>

          {/* Realtime OBD-II Diagnostics Ribbon */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.08] text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Fuel className="w-3 h-3 text-emerald-400" /> Fuel
              </span>
              <span className="text-white font-bold text-xs mt-0.5 block">{simState.fuelPercent}%</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Thermometer className="w-3 h-3 text-cyan-400" /> Coolant
              </span>
              <span className="text-white font-bold text-xs mt-0.5 block">{simState.engineTempC}°C</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-indigo-400" /> RPM
              </span>
              <span className="text-white font-bold text-xs mt-0.5 block">{simState.engineRpm}</span>
            </div>
          </div>
        </div>

        {/* Emergency SOS Highway Panic Action */}
        <div>
          <AnimatePresence>
            {simState.sosActive ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-rose-500/25 border-2 border-rose-500 text-rose-200 font-bold text-center text-xs animate-pulse shadow-2xl space-y-2"
              >
                <div className="text-base font-black flex items-center justify-center gap-2 text-rose-300">
                  <AlertOctagon className="w-5 h-5 text-rose-400 animate-spin" />
                  EMERGENCY HIGHWAY SOS ACTIVE!
                </div>
                <p className="text-[11px] text-rose-200">
                  Fleet Manager Command Center & Highway NHAI Patrol notified with your live GPS coordinates ({simState.location.city}).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSOS}
                  className="bg-black/40 text-xs text-rose-200 border-rose-500/40 hover:bg-black/60"
                >
                  Cancel SOS
                </Button>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleTriggerSOS}
                className="w-full py-4 px-4 bg-gradient-to-r from-rose-950/70 via-red-900/60 to-rose-950/70 hover:from-rose-900/90 hover:to-red-800/90 border border-rose-500/40 rounded-2xl text-rose-200 font-black text-xs flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-[0.98] cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Trigger Highway Emergency SOS Alert</span>
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Current Active Trip Route Card */}
        <div className="p-5 rounded-2xl bg-[#12151e]/90 backdrop-blur-xl border border-white/[0.08] space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
                ACTIVE MANIFEST
              </span>
              <div className="text-base font-black font-mono text-white">{activeTrip.tripCode}</div>
            </div>
            <div className="text-right">
              <Badge variant="cyan" className="font-mono text-xs font-bold">
                {activeTrip.vehicleReg}
              </Badge>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{activeTrip.distanceKm} km leg</div>
            </div>
          </div>

          {/* Highway Route Visual */}
          <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.07]">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">{activeTrip.origin.city}</div>
                <div className="text-xs text-slate-400">{activeTrip.origin.address}</div>
              </div>
            </div>

            <div className="ml-4 pl-4 border-l-2 border-dashed border-cyan-500/30 py-1.5 text-xs text-cyan-300 font-mono flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current Corridor: <strong className="text-white">{simState.currentCheckpoint}</strong></span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">{activeTrip.destination.city}</div>
                <div className="text-xs text-slate-400">{activeTrip.destination.address}</div>
              </div>
            </div>
          </div>

          {/* Cargo Payload Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07]">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Cargo Payload</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{activeTrip.cargoDescription}</span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">{activeTrip.cargoWeightTons} Metric Tons</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07]">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">GST E-Way Bill</span>
              <span className="font-mono text-slate-200 mt-0.5 block text-xs font-bold">
                {activeTrip.ewayBillNumber || '9012-4412-9901'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Valid & Compliant</span>
            </div>
          </div>

          {/* Digital POD Scanner Form */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-3.5">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Proof of Delivery (POD) Electronic Upload</span>
            </div>

            {uploaded || simState.podUploaded ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1.5 text-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-400" />
                <div className="font-black text-sm text-emerald-300">POD Uploaded & Delivery Synced!</div>
                <div className="text-xs text-slate-300">
                  Dispatch Command Center notified in real-time. Trip marked Delivered.
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadPOD} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Consignee Receipt / Delivery Notes</label>
                  <textarea
                    rows={2}
                    value={podNotes}
                    onChange={e => setPodNotes(e.target.value)}
                    placeholder="Enter receiver gate pass number, receiver name, or remarks..."
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="border-2 border-dashed border-white/[0.12] hover:border-blue-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white/[0.01]">
                  <FileCheck className="w-8 h-8 text-blue-400 mx-auto mb-1.5" />
                  <div className="text-white font-bold text-xs">Tap Camera to Capture Signed LR / Gate Pass</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Supports JPG, PNG, PDF receipt copies</div>
                </div>

                <Button type="submit" variant="primary" className="w-full py-3 text-xs font-bold shadow-lg shadow-blue-600/25">
                  Confirm Delivery & Sync POD to Fleet Manager
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}
