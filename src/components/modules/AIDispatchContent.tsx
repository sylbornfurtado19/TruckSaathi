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
  ArrowRight
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
    setTimeout(() => setIsDispatched(false), 4000);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="AI Smart Dispatch & Automated Route Optimization"
          description="Machine-learning dispatch recommendations matching vehicle payload, driver safety scores, and highway route efficiency."
        />
      </motion.div>

      {/* 2. AI Recommendation Generator Engine */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dispatch Inputs */}
        <Card glow="blue" className="p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-base border-b border-[#202736] pb-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>AI Dispatch Parameters</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Origin Logistics Hub</label>
              <select
                value={selectedOrigin}
                onChange={e => setSelectedOrigin(e.target.value)}
                className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Mumbai Hub">Mumbai Bhiwandi Hub</option>
                <option value="Ahmedabad Yard">Ahmedabad Sanand Yard</option>
                <option value="Chennai Port">Chennai Port Terminal</option>
                <option value="Delhi ICD">Delhi NCR ICD Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Destination Delivery City</label>
              <select
                value={selectedDestination}
                onChange={e => setSelectedDestination(e.target.value)}
                className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Bengaluru Hub">Bengaluru Nelamangala Depot</option>
                <option value="Hyderabad Hub">Hyderabad Patancheru Hub</option>
                <option value="Pune Chakan">Pune Chakan Industrial Hub</option>
                <option value="Jaipur Area">Jaipur VKIA Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Payload Weight (Tons)</label>
              <input
                type="number"
                value={cargoWeight}
                onChange={e => setCargoWeight(Number(e.target.value))}
                className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* AI Machine Recommendation Card */}
        <Card glow="blue" className="p-6 space-y-6 lg:col-span-2 bg-gradient-to-br from-blue-950/20 via-slate-900/60 to-indigo-950/20 border border-blue-500/30">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-blue-400 font-mono font-bold uppercase tracking-wider">AI RECOMMENDATION ENGINE</span>
                <h3 className="text-lg font-bold text-slate-100">Optimal Vehicle & Driver Pair Identified</h3>
              </div>
            </div>
            <Badge variant="success">98.4% Match Score</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recommended Vehicle */}
            <div className="p-4 rounded-xl bg-[#1c2333]/80 border border-[#2e374a] space-y-2">
              <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-400" /> Recommended Asset</span>
                <Badge variant="info">Capacity: {bestVehicle?.capacityTons}T</Badge>
              </div>
              <div className="text-base font-extrabold font-mono text-slate-100">{bestVehicle?.regNumber}</div>
              <div className="text-xs text-slate-400">{bestVehicle?.make} {bestVehicle?.model} • Health: 92%</div>
            </div>

            {/* Recommended Driver */}
            <div className="p-4 rounded-xl bg-[#1c2333]/80 border border-[#2e374a] space-y-2">
              <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-emerald-400" /> Recommended Driver</span>
                <Badge variant="success">Safety: {bestDriver?.safetyScore || 98}/100</Badge>
              </div>
              <div className="text-base font-extrabold text-slate-100">{bestDriver?.fullName}</div>
              <div className="text-xs text-slate-400">{bestDriver?.licenseCategory} • {bestDriver?.experienceYears} Yrs Experience</div>
            </div>
          </div>

          {/* Route Optimization Highlights */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2 text-xs">
            <div className="font-bold text-blue-300 flex items-center gap-2">
              <Route className="w-4 h-4" /> AI Route Optimization Analysis
            </div>
            <p className="text-slate-300">
              National Highway NH-48 corridor selected. Weather sensors indicate zero rainfall disruptions. Estimated transit time: <span className="font-mono text-emerald-400 font-bold">22.5 Hours</span>. Expected FASTag toll spend: <span className="font-mono text-amber-400 font-bold">₹3,450</span>.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {isDispatched ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> AI Trip Successfully Dispatched & Synced!
              </div>
            ) : (
              <Button variant="primary" onClick={handleExecuteAIDispatch} icon={<Zap className="w-4 h-4" />}>
                Approve & Execute AI Dispatch
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatedPage>
  );
}
