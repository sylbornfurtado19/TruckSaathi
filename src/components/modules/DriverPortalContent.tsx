'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Radio,
  Clock,
  ChevronRight,
  ShieldAlert,
  FileText,
  Check,
  Activity,
  AlertTriangle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';
import {
  Badge,
  Button,
  HoldToActivateButton,
  Panel,
  StatusPill,
  AnimatedPage,
  itemVariants
} from '@/components/ui';
import { CORRIDOR_WAYPOINTS } from '@/lib/services/simulationService';

// Dynamic import for Leaflet map component with dark CARTO tiles
const LeafletMapInner = dynamic(
  () => import('@/features/dashboard/components/LeafletMapInner').then(m => m.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-xl bg-surface-muted/60 text-xs font-medium text-text-secondary">
        <Activity className="h-4 w-4 animate-spin mr-2 text-cyan-400" />
        Connecting to GPS Satellite Feed...
      </div>
    )
  }
);

export function DriverPortalContent() {
  const {
    trips,
    currentUser,
    currentDriver,
    vehicles,
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
  const [currentTime, setCurrentTime] = useState('');

  // Clock ticker for digital cockpit feel
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Active trip matching current driver or default to primary trip
  const activeTrip = trips.find(t => t.id === simState.tripId) || trips[0];
  const assignedVehicle =
    vehicles.find(v => v.regNumber === simState.vehicleReg) || vehicles[0];
  const driverDisplayName = currentDriver?.fullName || currentUser?.name || 'Ramesh Kumar';

  // Determine current greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleUploadPOD = (e: React.FormEvent) => {
    e.preventDefault();
    uploadSimulationPOD(podNotes || 'Signed LR physical receipt captured via on-duty driver camera.');
    setUploaded(true);
    setTimeout(() => setUploaded(false), 6000);
  };

  const handleTriggerSOS = () => {
    triggerSOS(driverDisplayName);
  };

  // Checkpoints derived from corridor waypoints
  const waypoints = CORRIDOR_WAYPOINTS;
  const currentWaypointIndex = Math.min(
    Math.floor((simState.progressPercent / 100) * waypoints.length),
    waypoints.length - 1
  );

  return (
    <AnimatedPage>
      {/* =========================================================================
          1. COMPACT DRIVER PORTAL COCKPIT HEADER
          ========================================================================= */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-[#090d16] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-border font-mono text-sm font-black text-brand-orange shadow-inner">
              {driverDisplayName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {greeting}, {driverDisplayName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE (GPS ACTIVE)
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Duty Vehicle: <strong className="text-white font-mono">{simState.vehicleReg}</strong> •{' '}
              {assignedVehicle?.make} {assignedVehicle?.model} (30T Heavy Transport)
            </p>
          </div>
        </div>

        {/* Digital Shift Clock & Status */}
        <div className="flex items-center gap-4 border-t border-border/60 pt-2 sm:border-t-0 sm:pt-0">
          <div className="text-right hidden sm:block">
            <div className="font-mono text-sm font-black tracking-wider text-cyan-400">
              {currentTime || '11:30:00'} IST
            </div>
            <div className="text-[11px] font-medium text-text-muted">NH-48 Corridor Satellite Link</div>
          </div>

          <div className="flex items-center gap-2">
            {simState.isRunning ? (
              <button
                type="button"
                onClick={() => pauseSimulation()}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startSimulation(simState.speedMultiplier || 1)}
                className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-3.5 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-sm cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Resume Run</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => resetSimulation()}
              className="rounded-lg border border-border bg-surface p-1.5 text-text-muted hover:text-white hover:bg-surface-muted transition-colors cursor-pointer"
              title="Reset corridor test run"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. ACTIVE TRIP COMMAND PANEL (HERO)
          ========================================================================= */}
      <section className="rounded-xl border border-border bg-[#0b101d] overflow-hidden shadow-md">
        {/* Top Operational Stripe */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-muted/50 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="rounded bg-brand-orange/20 px-2 py-0.5 font-mono text-xs font-bold text-brand-orange">
              ACTIVE MANIFEST
            </span>
            <span className="font-mono text-sm font-black text-white">{activeTrip.tripCode}</span>
            <span className="text-text-muted">•</span>
            <span className="text-xs text-text-secondary">{activeTrip.cargoDescription}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-emerald-400">
              E-Way Bill: {activeTrip.ewayBillNumber || '9012-4412-9901'}
            </span>
            <Badge variant={simState.tripStatus === 'Delivered' ? 'success' : 'cyan'}>
              {simState.tripStatus}
            </Badge>
          </div>
        </div>

        {/* Corridor Hero Visualizer */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Origin -> Current Position -> Destination Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Origin */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-brand-orange shadow-xs">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  ORIGIN (DISPATCHED)
                </span>
                <p className="text-base font-bold text-white">{activeTrip.origin.city}</p>
                <p className="text-xs text-text-secondary truncate max-w-xs">
                  {activeTrip.origin.address}
                </p>
              </div>
            </div>

            {/* Current Realtime Position */}
            <div className="flex items-center justify-center p-3 rounded-xl border border-cyan-500/25 bg-cyan-950/20 text-center">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                  CURRENT POSITION
                </span>
                <p className="text-base font-black text-white font-mono mt-0.5">
                  {simState.currentCheckpoint}
                </p>
                <p className="text-[11px] text-cyan-200/70 font-mono">
                  {simState.location.city} • Lat: {simState.location.lat.toFixed(3)}, Lng:{' '}
                  {simState.location.lng.toFixed(3)}
                </p>
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-start gap-3 md:justify-end text-left md:text-right">
              <div className="md:order-2 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-emerald-400 shadow-xs">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="md:order-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  DESTINATION (CONSIGNEE)
                </span>
                <p className="text-base font-bold text-white">{activeTrip.destination.city}</p>
                <p className="text-xs text-text-secondary truncate max-w-xs">
                  {activeTrip.destination.address}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar & ETA Summary */}
          <div className="space-y-2 rounded-xl bg-surface-muted/40 p-4 border border-border/80">
            <div className="flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-bold text-text-primary">
                Transit Corridor Progress: <span className="font-mono text-cyan-400">{simState.progressPercent}%</span>
              </span>
              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="text-text-secondary">
                  Remaining: <strong className="text-white">{simState.distanceRemainingKm} km</strong>
                </span>
                <span className="text-text-muted">|</span>
                <span className="text-text-secondary">
                  Estimated Arrival:{' '}
                  <strong className="text-emerald-400">
                    {activeTrip.scheduledArrival ? activeTrip.scheduledArrival.slice(11, 16) : '15:30'} IST
                  </strong>
                </span>
              </div>
            </div>

            {/* Custom Track */}
            <div className="relative h-2.5 w-full rounded-full bg-surface overflow-hidden border border-border/60">
              <div
                className="h-full bg-gradient-to-r from-brand-orange via-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${simState.progressPercent}%` }}
              />
            </div>

            {/* Checkpoint Micro-Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[11px]">
              {waypoints.slice(0, 5).map((wp, idx) => {
                const passed = idx <= currentWaypointIndex;
                const isCurrent = idx === currentWaypointIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 truncate ${
                      isCurrent
                        ? 'text-cyan-300 font-bold'
                        : passed
                        ? 'text-text-secondary'
                        : 'text-text-muted'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isCurrent
                          ? 'bg-cyan-400 ring-2 ring-cyan-400/30 animate-pulse'
                          : passed
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span className="truncate">{wp.city.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SPLIT DECK: LIVE DRIVING TELEMETRY + REAL-TIME CORRIDOR MAP
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Professional Driving Telemetry Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Panel
            title="Driving Cockpit Telemetry"
            subtitle="OBD-II CANbus telemetry linked directly from truck"
            badge={
              <Badge variant="cyan" pulse className="font-mono text-[10px]">
                {simState.speedKmh > 0 ? 'MOVING' : 'IDLE'}
              </Badge>
            }
          >
            <div className="space-y-4">
              {/* PRIMARY METRIC: SPEEDOMETER */}
              <div className="rounded-xl border border-border bg-[#090e18] p-5 text-center relative overflow-hidden">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  CURRENT SPEED
                </div>

                <div className="my-2 flex items-baseline justify-center gap-2">
                  <span className="font-mono text-6xl font-black tracking-tight text-white">
                    {simState.speedKmh}
                  </span>
                  <span className="font-mono text-sm font-bold text-cyan-400 uppercase">km/h</span>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      simState.speedKmh > 80
                        ? 'bg-rose-500 animate-ping'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-text-secondary font-mono">
                    Speed Limit: <strong className="text-white">80 km/h</strong> (Expressway Radar)
                  </span>
                </div>

                {simState.speedKmh > 80 && (
                  <div className="mt-2 rounded-lg bg-rose-500/10 border border-rose-500/30 py-1 text-xs font-bold text-rose-300">
                    ⚠ OVERSPEED WARNING AUDIBLE TO DRIVER
                  </div>
                )}
              </div>

              {/* SECONDARY METRICS (COMPACT VISUAL HIERARCHY) */}
              <div className="grid grid-cols-2 gap-3">
                {/* RPM */}
                <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                    ENGINE RPM
                  </span>
                  <p className="mt-1 font-mono text-xl font-bold text-white">
                    {simState.engineRpm.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-text-muted font-medium">Optimal Band</span>
                </div>

                {/* Engine Temp */}
                <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                    COOLANT TEMP
                  </span>
                  <p className="mt-1 font-mono text-xl font-bold text-white">
                    {simState.engineTempC}°C
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">Nominal Operating Temp</span>
                </div>

                {/* Fuel Level */}
                <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Fuel className="h-3.5 w-3.5 text-emerald-400" />
                    FUEL TANK
                  </span>
                  <p className="mt-1 font-mono text-xl font-bold text-white">
                    {simState.fuelPercent}%
                  </p>
                  <span className="text-[10px] text-text-muted font-medium">~380 L Remaining</span>
                </div>

                {/* Odometer */}
                <div className="rounded-xl border border-border bg-surface-muted/50 p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    ODOMETER
                  </span>
                  <p className="mt-1 font-mono text-xl font-bold text-white">
                    {simState.odometerKm.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-text-muted font-medium">Total Vehicle Km</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* =========================================================================
              EMERGENCY SOS ASSISTANCE AREA
              ========================================================================= */}
          <div id="sos" className="rounded-xl border border-border bg-[#0e0709] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    HIGHWAY EMERGENCY ASSISTANCE
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Direct NHAI Patrol & Fleet Command alert system
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-rose-400 border border-rose-500/30 rounded px-1.5 py-0.5">
                SOS READY
              </span>
            </div>

            <div className="mt-4">
              <AnimatePresence>
                {simState.sosActive ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="rounded-xl border-2 border-rose-500/40 bg-rose-950/40 p-4 text-center space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-rose-300 font-black text-sm">
                      <AlertOctagon className="h-5 w-5 text-rose-400 animate-spin" />
                      <span>SOS ACTIVE • COMMAND CENTER ALERTED</span>
                    </div>
                    <p className="text-xs text-rose-200/80 leading-relaxed">
                      Your live location (<strong>{simState.location.city}</strong>) has been broadcast
                      to Fleet Manager dispatch and nearest highway medical/police rescue.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSOS}
                      className="border-rose-500/50 bg-black/40 text-xs font-bold text-rose-200 hover:bg-black/60"
                    >
                      Cancel False Emergency Alert
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-text-secondary">
                      Press and hold the button for 2 seconds to initiate an emergency dispatch call.
                    </p>
                    <HoldToActivateButton onActivate={handleTriggerSOS} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Interactive Live Corridor Map & Details (7 Cols) */}
        <div id="route" className="lg:col-span-7 space-y-5">
          <Panel
            title="Live Route Corridor"
            subtitle="GPS satellite track along NH-48 Express Freight Highway"
            actions={
              <span className="font-mono text-xs text-cyan-400 font-semibold">
                Waypoint {currentWaypointIndex + 1} of {waypoints.length}
              </span>
            }
          >
            <div className="space-y-4">
              {/* Actual Embedded Map */}
              <div className="h-72 w-full rounded-xl overflow-hidden border border-border shadow-inner">
                <LeafletMapInner
                  vehicles={[assignedVehicle]}
                  selectedVehicleId={assignedVehicle.id}
                />
              </div>

              {/* Waypoint Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border bg-surface-muted/50 p-3">
                  <span className="font-bold text-text-muted uppercase text-[10px]">
                    Current Sector
                  </span>
                  <p className="font-bold text-white text-sm mt-0.5">{simState.location.city}</p>
                  <p className="text-text-secondary text-xs">{simState.currentCheckpoint}</p>
                </div>

                <div className="rounded-xl border border-border bg-surface-muted/50 p-3">
                  <span className="font-bold text-text-muted uppercase text-[10px]">
                    Next Toll / Clearance
                  </span>
                  <p className="font-bold text-white text-sm mt-0.5">
                    {waypoints[currentWaypointIndex]?.nextMilestone || 'Chakan Toll Gate'}
                  </p>
                  <p className="text-emerald-400 text-xs font-mono">FASTag Auto-Debit Enabled</p>
                </div>
              </div>
            </div>
          </Panel>

          {/* =========================================================================
              VEHICLE HEALTH & DIAGNOSTICS (COMPACT STATUS ROWS)
              ========================================================================= */}
          <div id="vehicle-health">
            <Panel
              title="Vehicle Diagnostics & Health"
              subtitle="Real-time OBD-II sensor health scores"
              badge={<StatusPill status="success">OVERALL HEALTH: GOOD</StatusPill>}
            >
              <div className="divide-y divide-border/60">
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Engine Block & Transmission</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">Healthy (94%)</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Dual Air Brake Pressure</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">Optimal (8.2 Bar)</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">All 14 Tyres Pressure (TPMS)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">Nominal (110 PSI)</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Electrical & Alternator (24V)</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">24.2 V Nominal</span>
                </div>

                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-semibold text-text-secondary">Last Depot Inspection</span>
                  </div>
                  <span className="font-mono text-xs text-text-muted">12 Sep 2026 • Mumbai Central Workshop</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BOTTOM SECTION: POD UPLOAD + DRIVER DOCUMENTS + RECENT TIMELINE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* POD Camera Upload Section */}
        <div id="pod-upload" className="lg:col-span-1">
          <Panel
            title="Proof of Delivery (POD)"
            subtitle="Capture and transmit signed LR receipt"
            badge={
              simState.podUploaded || uploaded ? (
                <StatusPill status="success">POD SYNCED</StatusPill>
              ) : (
                <StatusPill status="warning">AWAITING LR</StatusPill>
              )
            }
          >
            {uploaded || simState.podUploaded ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300 text-sm">Signed POD Receipt Uploaded!</h4>
                <p className="text-xs text-text-secondary">
                  Delivery timestamped and synced to fleet manager in real time.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploaded(false)}
                    className="text-xs"
                  >
                    Upload Additional Page
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadPOD} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Consignee Remarks / Gate Pass #
                  </label>
                  <input
                    type="text"
                    value={podNotes}
                    onChange={e => setPodNotes(e.target.value)}
                    placeholder="e.g. Received 28.5 MT by Warehouse Supervisor"
                    className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-white placeholder:text-text-muted focus:border-focus focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border-2 border-dashed border-border/80 bg-surface-muted/30 p-5 text-center hover:border-brand-orange/60 transition-colors cursor-pointer">
                  <Camera className="h-8 w-8 text-brand-orange mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">Tap to Scan LR Copy or Gate Stamp</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Supports high-resolution camera capture or PDF
                  </p>
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Transmit Signed POD to Fleet
                </Button>
              </form>
            )}
          </Panel>
        </div>

        {/* Driver & Vehicle Compliance Documents */}
        <div className="lg:col-span-1">
          <Panel
            title="Trip & Compliance Documents"
            subtitle="Verified enterprise credentials"
            badge={<StatusPill status="success">ALL COMPLIANT</StatusPill>}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
                <div>
                  <p className="text-xs font-bold text-white">Driver Commercial License</p>
                  <p className="font-mono text-[11px] text-text-muted">
                    {currentDriver?.licenseNumber || 'MH12 20150091234'} • HMV
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Valid 2028
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
                <div>
                  <p className="text-xs font-bold text-white">Vehicle Registration Certificate (RC)</p>
                  <p className="font-mono text-[11px] text-text-muted">{simState.vehicleReg} • Commercial</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
                <div>
                  <p className="text-xs font-bold text-white">National Freight Permit</p>
                  <p className="font-mono text-[11px] text-text-muted">All India All-State Permit</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-2.5">
                <div>
                  <p className="text-xs font-bold text-white">Commercial Fleet Insurance</p>
                  <p className="font-mono text-[11px] text-text-muted">ICICI Lombard Goods Transit</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Covered
                </span>
              </div>
            </div>
          </Panel>
        </div>

        {/* Live Driver Event Timeline */}
        <div className="lg:col-span-1">
          <Panel
            title="Cockpit Event Timeline"
            subtitle="Automated highway audit milestones"
            actions={
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <Radio className="h-3 w-3 animate-pulse" /> Live Log
              </span>
            }
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3 border-l-2 border-cyan-500/60 pl-3">
                <div>
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">
                    {simState.lastEvent?.timestamp || currentTime}
                  </span>
                  <p className="text-xs font-bold text-white">
                    {simState.lastEvent?.text || `Approaching ${simState.currentCheckpoint}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-border pl-3">
                <div>
                  <span className="font-mono text-[10px] text-text-muted">10:15 IST</span>
                  <p className="text-xs font-semibold text-text-secondary">
                    FASTag toll clearance at Kalamboli Plaza
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-border pl-3">
                <div>
                  <span className="font-mono text-[10px] text-text-muted">09:42 IST</span>
                  <p className="text-xs font-semibold text-text-secondary">
                    Dispatched from Mumbai Bhiwandi Hub Gate 4
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-l-2 border-border pl-3">
                <div>
                  <span className="font-mono text-[10px] text-text-muted">09:15 IST</span>
                  <p className="text-xs font-semibold text-text-secondary">
                    Pre-trip tyre & dual-air brake check completed
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AnimatedPage>
  );
}
