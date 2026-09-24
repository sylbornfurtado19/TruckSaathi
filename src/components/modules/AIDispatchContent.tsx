'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Route,
  Truck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MapPin,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  Cpu,
  Clock,
  Gauge
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, AnimatedPage, itemVariants } from '@/components/ui';

export function AIDispatchContent() {
  const { vehicles, drivers, addTrip } = useApp();
  const [selectedOrigin, setSelectedOrigin] = useState('Mumbai Hub');
  const [selectedDestination, setSelectedDestination] = useState('Bengaluru Hub');
  const [cargoWeight, setCargoWeight] = useState(25);
  const [isDispatched, setIsDispatched] = useState(false);

  // Find best vehicle (capacity >= weight, maintenance in service)
  const bestVehicle = vehicles.find(v => v.capacityTons >= cargoWeight && v.maintenanceStatus === 'In Service') || vehicles[0];
  // Find best driver (highest safety score)
  const bestDriver = [...drivers].sort((a, b) => (b.safetyScore || 90) - (a.safetyScore || 90))[0];

  const handleExecuteAIDispatch = () => {
    addTrip({
      tripCode: `TRP-AI-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: bestVehicle.id,
      vehicleReg: bestVehicle.regNumber,
      driverId: bestDriver.id,
      driverName: bestDriver.fullName,
      origin: { city: selectedOrigin.split(' ')[0], address: `${selectedOrigin} Gate 2`, lat: 19.076, lng: 72.877 },
      destination: { city: selectedDestination.split(' ')[0], address: `${selectedDestination} Yard`, lat: 12.971, lng: 77.594 },
      cargoDescription: 'High-Value Commercial Electronics & Precision Parts',
      cargoWeightTons: cargoWeight,
      status: 'In Transit',
      scheduledDeparture: new Date().toISOString().slice(0, 16).replace('T', ' '),
      scheduledArrival: '2026-08-08 14:00',
      distanceKm: 980,
      ewayBillNumber: `9012-${Math.floor(1000 + Math.random() * 9000)}-4412`,
      ewayBillExpiry: '2026-08-11 23:59',
      tollSpendINR: 3450,
      podReceived: false
    });

    setIsDispatched(true);
    setTimeout(() => setIsDispatched(false), 4500);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Machine Learning Engine
            </span>
          }
          title="AI Smart Dispatch & Route Optimization"
          description="Autonomous cargo-to-asset allocation matching vehicle payload specifications, highway corridor congestion, and driver safety telematics."
        />
      </motion.div>

      {/* 2. AI Engine Workspace */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Parameters Input Card */}
        <Card className="p-6 space-y-5 lg:col-span-1 border-[#1e2e4a]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2e4a]">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Dispatch Parameters</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              DYNAMIC INPUT
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Origin Logistics Hub</label>
              <select
                value={selectedOrigin}
                onChange={e => setSelectedOrigin(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="Mumbai Hub">Mumbai Bhiwandi Hub</option>
                <option value="Ahmedabad Yard">Ahmedabad Sanand Yard</option>
                <option value="Chennai Port">Chennai Port Terminal</option>
                <option value="Delhi ICD">Delhi NCR ICD Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Destination Delivery Hub</label>
              <select
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2.5 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="Bengaluru Hub">Bengaluru Nelamangala Depot</option>
                <option value="Hyderabad Hub">Hyderabad Patancheru Hub</option>
                <option value="Pune Chakan">Pune Chakan Industrial Hub</option>
                <option value="Jaipur Area">Jaipur VKIA Freight Hub</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">Payload Weight (Metric Tons)</label>
                <span className="font-mono text-cyan-400 font-bold">{cargoWeight} T</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={cargoWeight}
                onChange={e => setCargoWeight(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-[#0a0f1d] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5 Tons</span>
                <span>25 Tons</span>
                <span>45 Tons</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e2e4a] space-y-2">
              <span className="text-[11px] text-slate-400 font-medium block">Active Telemetry Constraints</span>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Driver Safety Score &gt; 90%</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Overloading Tolerance Enforced</span>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Recommendation Panel */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-6 space-y-5 border-cyan-500/30 bg-[#080d1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-[#1e2e4a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold uppercase tracking-wider">AI RECOMMENDATION ENGINE</span>
                  <h3 className="text-base font-bold text-slate-100">Optimal Pair Allocation & Highway Route Calculated</h3>
                </div>
              </div>
              <Badge variant="success">98.4% Match Precision</Badge>
            </div>

            {/* Recommended Pair Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Card */}
              <div className="p-4 rounded-xl bg-[#0e172a] border border-[#1e2e4a] space-y-2">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Truck className="w-4 h-4 text-blue-400" /> Allocated Asset
                  </span>
                  <Badge variant="info">Capacity: {bestVehicle?.capacityTons}T</Badge>
                </div>
                <div className="text-lg font-mono font-extrabold text-slate-100">{bestVehicle?.regNumber}</div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>{bestVehicle?.make} {bestVehicle?.model}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Health: 92%</span>
                </div>
              </div>

              {/* Driver Card */}
              <div className="p-4 rounded-xl bg-[#0e172a] border border-[#1e2e4a] space-y-2">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <UserCheck className="w-4 h-4 text-cyan-400" /> Verified Driver
                  </span>
                  <Badge variant="success">Safety: {bestDriver?.safetyScore || 96}/100</Badge>
                </div>
                <div className="text-lg font-bold text-slate-100">{bestDriver?.fullName}</div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>{bestDriver?.licenseCategory} Commercial</span>
                  <span className="text-slate-300 font-mono text-[11px]">{bestDriver?.experienceYears} Yrs Exp</span>
                </div>
              </div>
            </div>

            {/* Corridor Analysis Box */}
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e2e4a] space-y-2 text-xs">
              <div className="font-bold text-cyan-300 flex items-center gap-2">
                <Route className="w-4 h-4 text-cyan-400" />
                <span>Corridor Optimization Matrix</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                National Highway NH-48 corridor analyzed. Live FASTag telemetry indicates nominal toll plaza clearance times. Estimated highway transit duration: <span className="font-mono text-emerald-400 font-bold">22.5 Hours</span>. Expected electronic toll fee: <span className="font-mono text-amber-400 font-bold">₹3,450</span>.
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                Corridor: {selectedOrigin.split(' ')[0]} → {selectedDestination.split(' ')[0]}
              </div>

              {isDispatched ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> AI Trip Successfully Dispatched & Assigned!
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleExecuteAIDispatch}
                  icon={<Zap className="w-4 h-4 text-cyan-300" />}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                >
                  Approve & Execute AI Dispatch
                </Button>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}
