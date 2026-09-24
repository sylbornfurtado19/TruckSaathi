'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertOctagon,
  MapPin,
  Truck,
  FileCheck,
  Navigation,
  Camera,
  Gauge,
  Fuel,
  Thermometer,
  RotateCcw,
  Play,
  Pause,
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
      <motion.div variants={itemVariants} className="mx-auto max-w-2xl">
        <PageHeader
          title={driverDisplayName}
          subtitle="Driver field portal"
          actions={<div className="flex items-center gap-2">
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
          </div>}
        />
      </motion.div>

      {/* 2. Mobile-Centric Field Command Container */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-4">
        {/* Live Simulation Cockpit Speedometer & OBD-II Strip */}
        <Card className="relative overflow-hidden p-5">

          {/* Top Bar: Vehicle Info & Speed Multiplier */}
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-black text-white text-sm">{simState.vehicleReg}</span>
              <span className="rounded-full border border-border bg-surface-muted px-2 py-1 font-mono text-xs text-text-secondary">
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
                  className="flex min-h-12 cursor-pointer items-center gap-1.5 rounded-control bg-brand-orange px-3 py-1 text-sm font-semibold text-white transition-colors duration-150 hover:bg-orange-700"
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
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
                  REAL-TIME GPS SPEED
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight mt-1 flex items-baseline justify-center gap-1.5">
                  <span>{simState.speedKmh}</span>
                  <span className="text-xs font-bold text-cyan-400 font-sans uppercase">km/h</span>
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 font-mono text-xs font-semibold text-status-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Speed Limit: 80 km/h (Nominal)
                </div>
              </div>

              <div className="h-12 w-px bg-white/[0.08]" />

              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
                  ODOMETER
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight mt-1">
                  {simState.odometerKm}
                </div>
                <div className="font-mono text-xs text-text-muted">Total Km</div>
              </div>
            </div>

            {/* Live Corridor Progress Capsule */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between h-full">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">
                TRIP PROGRESS
              </div>
              <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight my-1">
                {simState.progressPercent}%
              </div>
              <div className="font-mono text-xs text-text-secondary">
                {simState.distanceRemainingKm} km left
              </div>
            </div>
          </div>

          {/* Realtime OBD-II Diagnostics Ribbon */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.08] text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="flex items-center justify-center gap-1 text-xs text-text-secondary">
                <Fuel className="w-3 h-3 text-emerald-400" /> Fuel
              </span>
              <span className="text-white font-bold text-xs mt-0.5 block">{simState.fuelPercent}%</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="flex items-center justify-center gap-1 text-xs text-text-secondary">
                <Thermometer className="w-3 h-3 text-cyan-400" /> Coolant
              </span>
              <span className="text-white font-bold text-xs mt-0.5 block">{simState.engineTempC}°C</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="flex items-center justify-center gap-1 text-xs text-text-secondary">
                <Gauge className="w-3 h-3 text-indigo-400" /> RPM
              </span>
              <span className="text-white font-bold text-xs mt-0.5 block">{simState.engineRpm}</span>
            </div>
          </div>
        </Card>

        {/* Emergency SOS Highway Panic Action */}
        <div>
          <AnimatePresence>
            {simState.sosActive ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-2 rounded-card border-2 border-red-300 bg-red-50 p-4 text-center text-sm font-bold text-status-red dark:border-red-800 dark:bg-red-950/20"
              >
                <div className="text-base font-black flex items-center justify-center gap-2 text-rose-300">
                  <AlertOctagon className="w-5 h-5 text-rose-400 animate-spin" />
                  EMERGENCY HIGHWAY SOS ACTIVE!
                </div>
                <p className="text-sm text-text-secondary">
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
                className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-card border border-red-300 bg-red-50 px-4 py-4 text-sm font-bold text-red-700 transition-colors duration-150 hover:bg-red-100"
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Trigger Highway Emergency SOS Alert</span>
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Current Active Trip Route Card */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-orange">
                ACTIVE MANIFEST
              </span>
              <div className="text-base font-black font-mono text-white">{activeTrip.tripCode}</div>
            </div>
            <div className="text-right">
              <Badge variant="cyan" className="font-mono text-xs font-bold">
                {activeTrip.vehicleReg}
              </Badge>
              <div className="mt-0.5 font-mono text-xs text-text-secondary">{activeTrip.distanceKm} km leg</div>
            </div>
          </div>

          {/* Highway Route Visual */}
          <div className="space-y-3 rounded-card border border-border bg-surface-muted p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-control border border-border bg-surface p-1.5 text-brand-orange">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary">{activeTrip.origin.city}</div>
                  <div className="text-sm text-text-secondary">{activeTrip.origin.address}</div>
              </div>
            </div>

              <div className="ml-4 flex items-center gap-2 border-l-2 border-dashed border-border py-1.5 pl-4 font-mono text-sm text-text-secondary">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current Corridor: <strong className="text-white">{simState.currentCheckpoint}</strong></span>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-control border border-border bg-surface p-1.5 text-status-green">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary">{activeTrip.destination.city}</div>
                  <div className="text-sm text-text-secondary">{activeTrip.destination.address}</div>
              </div>
            </div>
          </div>

          {/* Cargo Payload Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-card border border-border bg-surface-muted p-3">
              <span className="block font-mono text-xs font-bold uppercase text-text-muted">Cargo Payload</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">{activeTrip.cargoDescription}</span>
              <span className="font-mono text-xs font-bold text-brand-orange">{activeTrip.cargoWeightTons} Metric Tons</span>
            </div>
            <div className="rounded-card border border-border bg-surface-muted p-3">
              <span className="block font-mono text-xs font-bold uppercase text-text-muted">GST E-Way Bill</span>
              <span className="font-mono text-slate-200 mt-0.5 block text-xs font-bold">
                {activeTrip.ewayBillNumber || '9012-4412-9901'}
              </span>
              <span className="font-mono text-xs font-semibold text-status-green">Valid & Compliant</span>
            </div>
          </div>

          {/* Digital POD Scanner Form */}
          <div id="pod-upload" className="space-y-3.5 rounded-card border border-border bg-surface-muted p-5">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Proof of Delivery (POD) Electronic Upload</span>
            </div>

            {uploaded || simState.podUploaded ? (
              <div className="space-y-1.5 rounded-card border border-green-200 bg-green-50 p-4 text-center text-green-800">
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
                  <div className="mt-0.5 text-xs text-text-muted">Supports JPG, PNG, PDF receipt copies</div>
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Confirm Delivery & Sync POD to Fleet Manager
                </Button>
              </form>
            )}
          </div>
        </Card>
      </motion.div>
      <nav className="sticky bottom-2 z-20 mx-auto grid w-full max-w-2xl grid-cols-4 gap-1 rounded-card border border-border bg-surface p-2" aria-label="Driver actions">
        <button type="button" onClick={() => startSimulation(simState.speedMultiplier || 1)} className="flex min-h-12 flex-col items-center justify-center rounded-control px-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted">Start trip</button>
        <a href="#pod-upload" className="flex min-h-12 flex-col items-center justify-center rounded-control px-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted">Upload POD</a>
        <button type="button" onClick={handleTriggerSOS} className="flex min-h-12 flex-col items-center justify-center rounded-control px-2 text-xs font-semibold text-red-700 hover:bg-red-50">Report issue</button>
        <button type="button" onClick={handleTriggerSOS} className="flex min-h-12 flex-col items-center justify-center rounded-control px-2 text-xs font-semibold text-red-700 hover:bg-red-50">SOS</button>
      </nav>
    </AnimatedPage>
  );
}
