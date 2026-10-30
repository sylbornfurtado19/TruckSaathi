'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Route,
  Truck,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Weight,
  Cpu,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Vehicle, Driver } from '@/types';
import { useMotionSafe, springs } from '@/lib/motion';

function generateRandomTripCode(prefix = 'TRP-AI-') {
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

function getFormattedNow() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function getArrivalTwoDaysAhead() {
  return new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ');
}

function getExpiryTwoDaysAhead() {
  return new Date(Date.now() + 172800000).toISOString().slice(0, 10) + ' 23:59';
}

function generateRandomEwayCode() {
  return `9012-${Math.floor(1000 + Math.random() * 9000)}-4412`;
}

interface CandidateMatch {
  id: string;
  vehicle: Vehicle;
  driver: Driver;
  matchScore: number;
  payloadFitPercent: number;
  safetyScore: number;
  healthScore: number;
  predictedTransitHours: number;
  estimatedFuelINR: number;
  reasons: string[];
}

export function AIDispatchFeature() {
  const { vehicles, drivers, trips, addTrip } = useApp();
  const { shouldReduce } = useMotionSafe();

  // Inputs
  const [originHub, setOriginHub] = useState('Mumbai Central Hub');
  const [destHub, setDestHub] = useState('Bengaluru Freight Terminal');
  const [cargoType, setCargoType] = useState('High-Value Electronics & Precision Parts');
  const [cargoWeight, setCargoWeight] = useState(24);
  const [minSafetyScore, setMinSafetyScore] = useState(85);

  // AI Thinking / Computing animation state
  const [isThinking, setIsThinking] = useState(false);
  // Connecting line animation state on dispatch execution
  const [isExecutingDispatch, setIsExecutingDispatch] = useState(false);
  const [dispatchedTripCode, setDispatchedTripCode] = useState<string | null>(null);

  // Eligible commercial assets and verified pilots
  const activeVehicleIds = useMemo(
    () => new Set(trips.filter(t => t.status === 'In Transit' || t.status === 'Delayed').map(t => t.vehicleId)),
    [trips]
  );

  const eligibleVehicles = useMemo(
    () => vehicles.filter(v => v.maintenanceStatus !== 'Breakdown'),
    [vehicles]
  );

  const eligibleDrivers = useMemo(
    () => drivers.filter(d => d.status === 'Active'),
    [drivers]
  );

  // Compute candidates whenever inputs change
  const candidateMatches: CandidateMatch[] = useMemo(() => {
    if (eligibleVehicles.length === 0 || eligibleDrivers.length === 0) return [];

    const pairs: CandidateMatch[] = [];

    eligibleVehicles.forEach(veh => {
      eligibleDrivers.forEach(drv => {
        // Calculate payload fit: ideal is 80-95% utilization, penalized if overloaded
        const utilization = (cargoWeight / veh.capacityTons) * 100;
        let payloadScore = 100 - Math.abs(utilization - 88);
        if (utilization > 100) payloadScore -= (utilization - 100) * 4; // severe penalty
        payloadScore = Math.max(10, Math.min(100, Math.round(payloadScore)));

        const safetyScore = drv.safetyScore || 90;
        const healthScore = veh.componentHealth?.engine || 92;
        const availabilityBonus = activeVehicleIds.has(veh.id) ? 0 : 8;

        // Weighted composite match score
        const matchScore = Math.min(
          99,
          Math.round(
            payloadScore * 0.45 +
            safetyScore * 0.30 +
            healthScore * 0.15 +
            availabilityBonus
          )
        );

        if (safetyScore >= minSafetyScore) {
          const reasons: string[] = [];
          if (utilization <= 100) reasons.push(`${utilization.toFixed(0)}% payload fit`);
          if (safetyScore >= 90) reasons.push(`Pilot safety: ${safetyScore}/100`);
          if (healthScore >= 90) reasons.push(`Engine health: ${healthScore}%`);

          pairs.push({
            id: `${veh.id}-${drv.id}`,
            vehicle: veh,
            driver: drv,
            matchScore,
            payloadFitPercent: Math.min(100, Math.round(utilization)),
            safetyScore,
            healthScore,
            predictedTransitHours: Math.round(980 / 52), // ~18-19h
            estimatedFuelINR: Math.round(980 * 24.5),
            reasons,
          });
        }
      });
    });

    // Sort descending by match score
    return pairs.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
  }, [eligibleVehicles, eligibleDrivers, cargoWeight, minSafetyScore, activeVehicleIds]);

  // Simulate short AI recalculation pulse on parameter changes
  const triggerRecalculate = () => {
    setIsThinking(true);
    const timer = setTimeout(() => {
      setIsThinking(false);
    }, 550);
    return () => clearTimeout(timer);
  };

  const handleExecuteDispatch = (candidate: CandidateMatch) => {
    setIsExecutingDispatch(true);
    const code = generateRandomTripCode();

    setTimeout(() => {
      addTrip({
        tripCode: code,
        vehicleId: candidate.vehicle.id,
        vehicleReg: candidate.vehicle.regNumber,
        driverId: candidate.driver.id,
        driverName: candidate.driver.fullName,
        origin: {
          city: originHub.split(' ')[0],
          address: `${originHub} Outbound Logistics Gate 2`,
          lat: 19.076,
          lng: 72.8777
        },
        destination: {
          city: destHub.split(' ')[0],
          address: `${destHub} Inbound Receiving Bay`,
          lat: 12.9716,
          lng: 77.5946
        },
        cargoDescription: cargoType,
        cargoWeightTons: cargoWeight,
        status: 'In Transit',
        scheduledDeparture: getFormattedNow(),
        scheduledArrival: getArrivalTwoDaysAhead(),
        distanceKm: 980,
        ewayBillNumber: generateRandomEwayCode(),
        ewayBillExpiry: getExpiryTwoDaysAhead(),
        tollSpendINR: 3450,
        podReceived: false
      });

      setIsExecutingDispatch(false);
      setDispatchedTripCode(code);
      setTimeout(() => setDispatchedTripCode(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-surface-muted via-surface to-brand-navy p-6 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 text-black shadow-[0_0_20px_rgba(255,107,0,0.4)] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-text-primary">
                  AI Smart Dispatch Engine
                </h1>
                <span className="rounded-full bg-brand-orange/15 border border-brand-orange/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-brand-orange">
                  V3.2 NEURAL
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Multi-objective real-time pairing engine matching freight tonnage, route hazards, Sarathi pilot safety scores, and OBD-II component health.
              </p>
            </div>
          </div>

          <button
            onClick={triggerRecalculate}
            disabled={isThinking}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-surface-muted hover:bg-white/10 text-slate-200 transition-all active:scale-98 shadow-sm shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isThinking ? 'animate-spin text-brand-orange' : ''}`} />
            Re-Score Corridor Match
          </button>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Grid: Inputs vs Ranked Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Constraints & Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-surface p-5 shadow-xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-orange" />
                <h3 className="text-sm font-bold text-text-primary">Freight & Corridor Constraints</h3>
              </div>
              <span className="font-mono text-xs text-text-muted">4 Active Filters</span>
            </div>

            {/* Origin & Destination Hubs */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Origin Outbound Hub
                </label>
                <select
                  value={originHub}
                  onChange={e => {
                    setOriginHub(e.target.value);
                    triggerRecalculate();
                  }}
                  className="w-full rounded-lg border border-white/10 bg-surface-muted px-3 py-2 text-sm text-text-primary focus:border-brand-orange focus:outline-none font-medium"
                >
                  <option>Mumbai Central Hub</option>
                  <option>Ahmedabad GIDC Logistics Park</option>
                  <option>Chennai Port Freight Terminal</option>
                  <option>Delhi Inland Container Depot (ICD)</option>
                  <option>Pune Chakan Automotive Corridor</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Destination Inbound Terminal
                </label>
                <select
                  value={destHub}
                  onChange={e => {
                    setDestHub(e.target.value);
                    triggerRecalculate();
                  }}
                  className="w-full rounded-lg border border-white/10 bg-surface-muted px-3 py-2 text-sm text-text-primary focus:border-brand-orange focus:outline-none font-medium"
                >
                  <option>Bengaluru Freight Terminal</option>
                  <option>Hyderabad Outer Ring Road Hub</option>
                  <option>Kolkata Dankuni Logistics Center</option>
                  <option>Jaipur Freight Logistics Node</option>
                </select>
              </div>

              {/* Cargo Type */}
              <div className="space-y-1.5">
                <label className="font-semibold text-text-secondary">Consignment Classification</label>
                <select
                  value={cargoType}
                  onChange={e => {
                    setCargoType(e.target.value);
                    triggerRecalculate();
                  }}
                  className="w-full rounded-lg border border-white/10 bg-surface-muted px-3 py-2 text-sm text-text-primary focus:border-brand-orange focus:outline-none"
                >
                  <option>High-Value Electronics & Precision Parts</option>
                  <option>Automotive Transmission Subassemblies</option>
                  <option>Pharmaceutical Cold-Chain Reagents</option>
                  <option>FMCG Fast-Moving Consumer Goods</option>
                  <option>Industrial Heavy Machinery Plates</option>
                </select>
              </div>

              {/* Payload Weight Range Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <Weight className="w-3.5 h-3.5 text-amber-400" /> Required Cargo Payload
                  </span>
                  <span className="font-mono text-sm font-bold text-brand-orange bg-brand-orange/15 px-2 py-0.5 rounded border border-brand-orange/30">
                    {cargoWeight} Tons
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={cargoWeight}
                  onChange={e => {
                    setCargoWeight(Number(e.target.value));
                    triggerRecalculate();
                  }}
                  className="w-full accent-brand-orange cursor-pointer"
                />
                <div className="flex justify-between font-mono text-[10px] text-text-muted">
                  <span>5T Light</span>
                  <span>25T Standard Multi-Axle</span>
                  <span>45T Heavy Hauler</span>
                </div>
              </div>

              {/* Safety Score Constraint */}
              <div className="space-y-2 pt-2 border-t border-white/8">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Minimum Pilot Safety Score
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {minSafetyScore}+
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[75, 80, 85, 90].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => {
                        setMinSafetyScore(score);
                        triggerRecalculate();
                      }}
                      className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-all ${
                        minSafetyScore === score
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/10 bg-surface-muted text-text-muted hover:text-white'
                      }`}
                    >
                      {score}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Neural Engine Diagnostic Card */}
          <div className="rounded-2xl border border-white/8 bg-surface-muted/40 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-text-muted font-mono text-[11px]">
              <span>ACTIVE FLEET TELEMETRY</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Node Feed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="rounded-lg bg-white/5 p-2 border border-white/6">
                <span className="text-[10px] text-text-muted block">Eligible Trucks</span>
                <span className="text-sm font-bold text-slate-200">{eligibleVehicles.length} Units</span>
              </div>
              <div className="rounded-lg bg-white/5 p-2 border border-white/6">
                <span className="text-[10px] text-text-muted block">Verified Pilots</span>
                <span className="text-sm font-bold text-slate-200">{eligibleDrivers.length} Drivers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Candidates (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Ranked Fleet Matches ({candidateMatches.length})
            </h3>
            <span className="text-xs text-text-muted">
              Auto-ranked by payload fit & safety
            </span>
          </div>

          {/* "AI Brain Thinking" Shimmer Overlay */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-brand-orange/40 bg-brand-orange/10 p-3 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-5 h-5 rounded-full border-2 border-brand-orange border-t-transparent animate-spin shrink-0" />
                <div className="text-xs font-mono text-brand-orange">
                  Computing 3-axis load compatibility, fastag route tolls, and driver duty limits...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connecting Line Execution Animation */}
          <AnimatePresence>
            {isExecutingDispatch && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-2xl border-2 border-brand-orange bg-canvas p-6 shadow-[0_0_30px_rgba(255,107,0,0.3)] space-y-4 text-center relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/20 border border-brand-orange flex items-center justify-center text-brand-orange">
                      <Truck className="w-6 h-6 animate-bounce" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-2">Asset Assigned</span>
                  </div>

                  {/* Animated Connecting SVG Path */}
                  <div className="flex-1 max-w-[200px] relative">
                    <svg className="w-full h-8" viewBox="0 0 200 32">
                      <line x1="10" y1="16" x2="190" y2="16" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" className="opacity-20" />
                      <motion.line
                        x1="10"
                        y1="16"
                        x2="190"
                        y2="16"
                        stroke="#ff6b00"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      />
                    </svg>
                    <motion.div
                      className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-orange shadow-[0_0_8px_#ff6b00]"
                      animate={{ left: ['5%', '90%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                      <Route className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-2">Corridor Locked</span>
                  </div>
                </div>

                <div className="font-mono text-xs text-brand-orange font-bold uppercase tracking-wider animate-pulse">
                  Encrypting E-Way Bill Manifest & Authorizing GPS Telemetry Unit...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Banner */}
          <AnimatePresence>
            {dispatchedTripCode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 flex items-center justify-between text-xs text-emerald-400"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <strong className="font-bold text-white">AI Dispatch Successful!</strong>
                    <div className="font-mono text-emerald-300">
                      Trip code <span className="underline">{dispatchedTripCode}</span> active on highway corridor.
                    </div>
                  </div>
                </div>
                <span className="font-mono font-bold px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30">
                  LIVE TELEMETRY
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Candidate Match List with Layout Transitions */}
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {candidateMatches.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-surface p-12 text-center text-text-muted">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-primary">No Matching Fleet Pairing Found</p>
                  <p className="text-xs mt-1">Try lowering the minimum safety score or adjusting cargo payload.</p>
                </div>
              ) : (
                candidateMatches.map((cand, idx) => {
                  const isTopMatch = idx === 0;

                  // Circular SVG score ring
                  const radius = 24;
                  const strokeWidth = 4;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference * (1 - cand.matchScore / 100);
                  const svgSize = (radius + strokeWidth) * 2;

                  return (
                    <motion.div
                      key={cand.id}
                      layout
                      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={springs.smooth}
                      className={`relative rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                        isTopMatch
                          ? 'border-brand-orange/40 bg-surface shadow-[0_0_24px_rgba(255,107,0,0.1)] ring-1 ring-brand-orange/20'
                          : 'border-white/8 bg-surface hover:border-white/16'
                      }`}
                    >
                      {/* Top Rank Badge */}
                      {isTopMatch && (
                        <div className="absolute -top-3 left-6">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 px-3 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider shadow-md">
                            <Sparkles className="w-3 h-3" /> Best Algorithmic Match
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Score Ring & Asset Snapshot */}
                        <div className="flex items-center gap-4">
                          {/* Animated Circular SVG Match Score Ring */}
                          <div className="relative flex items-center justify-center shrink-0">
                            <svg width={svgSize} height={svgSize} className="-rotate-90">
                              <circle
                                cx={svgSize / 2}
                                cy={svgSize / 2}
                                r={radius}
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="opacity-15 text-white"
                                fill="transparent"
                              />
                              <motion.circle
                                cx={svgSize / 2}
                                cy={svgSize / 2}
                                r={radius}
                                stroke={isTopMatch ? '#ff6b00' : '#10b981'}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                strokeLinecap="round"
                                fill="transparent"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="font-mono text-sm font-bold text-slate-100">
                                {cand.matchScore}%
                              </span>
                              <span className="text-[8px] text-text-muted uppercase">Match</span>
                            </div>
                          </div>

                          {/* Pair Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-400" />
                              <span className="font-mono font-bold text-slate-100 text-sm">
                                {cand.vehicle.regNumber}
                              </span>
                              <span className="text-xs text-text-secondary">
                                ({cand.vehicle.make} · {cand.vehicle.capacityTons}T Cap)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="font-medium">{cand.driver.fullName}</span>
                              <span className="text-text-muted">· Safety {cand.driver.safetyScore}/100</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Quick Action Button */}
                        <button
                          onClick={() => handleExecuteDispatch(cand)}
                          disabled={isExecutingDispatch}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-98 shadow-md shrink-0 ${
                            isTopMatch
                              ? 'bg-brand-orange text-black hover:bg-amber-400 shadow-brand-orange/20'
                              : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          Assign & Dispatch
                        </button>
                      </div>

                      {/* Criteria Score Breakdown Chips */}
                      <div className="mt-4 pt-3 border-t border-white/6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="rounded-lg bg-surface-muted/60 p-2">
                          <span className="text-text-muted block text-[10px]">Payload Fit</span>
                          <span className="font-bold text-emerald-400">{cand.payloadFitPercent}% utilized</span>
                        </div>
                        <div className="rounded-lg bg-surface-muted/60 p-2">
                          <span className="text-text-muted block text-[10px]">Safety Index</span>
                          <span className="font-bold text-indigo-400">{cand.safetyScore}/100</span>
                        </div>
                        <div className="rounded-lg bg-surface-muted/60 p-2">
                          <span className="text-text-muted block text-[10px]">OBD-II Engine</span>
                          <span className="font-bold text-amber-400">{cand.healthScore}% health</span>
                        </div>
                        <div className="rounded-lg bg-surface-muted/60 p-2">
                          <span className="text-text-muted block text-[10px]">Est. Fuel Cost</span>
                          <span className="font-bold text-slate-200">₹{cand.estimatedFuelINR.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
