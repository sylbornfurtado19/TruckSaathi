'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Upload,
  CheckCircle2,
  AlertOctagon,
  MapPin,
  Truck,
  User,
  ShieldCheck,
  FileCheck,
  PhoneCall
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, AnimatedPage, itemVariants } from '@/components/ui';

export function DriverPortalContent() {
  const { trips, updateTrip, currentUser, currentDriver } = useApp();

  // Strictly isolate trips to the authenticated driver's ID
  const driverTrips = React.useMemo(() => {
    if (!currentDriver?.id) return [];
    return trips.filter(t => t.driverId === currentDriver.id);
  }, [trips, currentDriver]);

  const [selectedTripId, setSelectedTripId] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Active trip selected exclusively from this driver's assigned trips (no cross-driver leakage)
  const activeTrip = React.useMemo(() => {
    if (driverTrips.length === 0) return null;
    return driverTrips.find(t => t.id === selectedTripId) || driverTrips[0];
  }, [driverTrips, selectedTripId]);

  const driverDisplayName = currentDriver?.fullName || currentUser?.name || 'Driver';

  const handleUploadPOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    updateTrip(activeTrip.id, {
      podReceived: true,
      podNotes: podNotes || 'Photo POD captured via driver mobile scanner app.',
      status: 'Delivered'
    });

    setUploaded(true);
    setTimeout(() => setUploaded(false), 4000);
  };

  const handleTriggerSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Mobile Driver Field Portal & POD Upload"
          description="Driver-facing web interface for live trip manifests, camera POD receipt uploads, and emergency SOS alerts."
        />
      </motion.div>

      {/* 2. Driver Mobile Simulator View */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-6">
        <Card glow="blue" className="p-6 space-y-6 bg-gradient-to-b from-[#121824] to-[#0b0f19] border border-blue-500/30 rounded-2xl shadow-2xl">
          {/* Mobile Header Bar */}
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-blue-400 font-mono font-bold uppercase">DRIVER MOBILE APP</div>
                <h3 className="text-base font-bold text-slate-100">{driverDisplayName}</h3>
              </div>
            </div>
            {activeTrip ? (
              <Badge variant="success">Active Trip</Badge>
            ) : (
              <Badge variant="info">Standby</Badge>
            )}
          </div>

          {/* Driver Profile Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#1c2333]/60 border border-[#202736] text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Driver ID</span>
              <span className="font-mono font-bold text-slate-200">{currentDriver?.id || currentUser?.driverId || 'Unlinked'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">License</span>
              <span className="font-mono font-bold text-slate-200">{currentDriver?.licenseNumber || 'Active DL'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Vehicle</span>
              <span className="font-mono font-bold text-blue-400">
                {activeTrip?.vehicleReg || currentDriver?.assignedVehicle || currentDriver?.assignedVehicleReg || 'Standby'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Safety Score</span>
              <span className="font-mono font-bold text-emerald-400">
                {currentDriver?.safetyScore ? `${currentDriver.safetyScore}%` : '94%'}
              </span>
            </div>
          </div>

          {/* Trip Selector if Driver has multiple assigned trips */}
          {driverTrips.length > 1 && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1c2333] border border-[#202736] text-xs">
              <span className="text-slate-300 font-medium">Assigned Trips ({driverTrips.length})</span>
              <select
                value={activeTrip?.id || ''}
                onChange={e => setSelectedTripId(e.target.value)}
                aria-label="Select Assigned Trip"
                className="bg-[#121824] border border-[#2e374a] text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
              >
                {driverTrips.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.tripCode} ({t.origin.city} → {t.destination.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Trip Manifest Details or Standby Message */}
          {activeTrip ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#1c2333]/80 border border-[#202736] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-400 text-sm">{activeTrip.tripCode}</span>
                  <Badge variant="info">{activeTrip.vehicleReg}</Badge>
                </div>

                <div className="flex items-center justify-between text-slate-200 font-medium pt-2 border-t border-[#202736]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeTrip.origin.city}</span>
                  </div>
                  <span className="text-slate-500">→</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeTrip.destination.city}</span>
                  </div>
                </div>
              </div>

              {/* Digital POD Scanner Form */}
              <div className="p-4 rounded-xl bg-[#1c2333]/80 border border-[#202736] space-y-4">
                <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Physical POD Scanner & Receipt Upload</span>
                </div>

                {uploaded ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
                    <div className="font-bold text-sm">POD Uploaded & Trip Marked Delivered!</div>
                    <div className="text-[11px] text-slate-300">Synced to Mahindra Logistics dispatch hub.</div>
                  </div>
                ) : (
                  <form onSubmit={handleUploadPOD} className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">POD Verification Notes</label>
                      <textarea
                        rows={2}
                        value={podNotes}
                        onChange={e => setPodNotes(e.target.value)}
                        placeholder="Enter consignee signature details or seal numbers..."
                        className="w-full bg-[#121824] border border-[#2e374a] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="border-2 border-dashed border-[#2e374a] hover:border-blue-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors">
                      <FileCheck className="w-8 h-8 text-blue-400 mx-auto mb-1" />
                      <div className="text-slate-200 font-medium">Tap to Take POD Photo / Document</div>
                      <div className="text-[10px] text-slate-500">Supports JPG, PNG, PDF receipts up to 10MB</div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                      Submit Digital POD to Dispatch
                    </Button>
                  </form>
                )}
              </div>

              {/* SOS Emergency Panic Button */}
              <div className="pt-2">
                {sosSent ? (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 font-bold text-center text-xs animate-pulse">
                    🚨 EMERGENCY SOS BROADCASTED! Dispatchers & GPS Emergency Response Contacted!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerSOS}
                    className="w-full py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertOctagon className="w-4 h-4" /> Trigger Emergency Highway SOS Alert
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-6 rounded-xl bg-[#1c2333]/80 border border-[#202736] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-100 text-sm">No Active Trips Dispatched</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You are currently on standby. Your fleet dispatcher will assign your next shipment manifest shortly.
                </p>
              </div>

              {/* Emergency SOS Panic Button available on standby */}
              <div className="pt-2">
                {sosSent ? (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-300 font-bold text-center text-xs animate-pulse">
                    🚨 EMERGENCY SOS BROADCASTED! Dispatchers & GPS Emergency Response Contacted!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerSOS}
                    className="w-full py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertOctagon className="w-4 h-4" /> Trigger Emergency Highway SOS Alert
                  </button>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatedPage>
  );
}
