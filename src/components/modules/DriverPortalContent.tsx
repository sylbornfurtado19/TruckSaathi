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
  PhoneCall,
  Clock,
  ArrowRight,
  Camera,
  Navigation,
  FileText
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

  const driverDisplayName = currentDriver?.fullName || currentUser?.name || 'Commercial Driver';

  const handleUploadPOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    updateTrip(activeTrip.id, {
      podReceived: true,
      podNotes: podNotes || 'Photo POD captured via driver mobile scanner app.',
      status: 'Delivered'
    });

    setUploaded(true);
    setTimeout(() => setUploaded(false), 5000);
  };

  const handleTriggerSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 6000);
  };

  return (
    <AnimatedPage>
      {/* 1. Driver Portal Header */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e2e4a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-blue-400 font-mono font-bold tracking-wider uppercase">TRUCKSAATHI DRIVER OPERATING SYSTEM</div>
              <h1 className="text-base font-extrabold text-slate-100">{driverDisplayName}</h1>
            </div>
          </div>
          {activeTrip ? (
            <Badge variant="success" pulse className="px-2.5 py-1 text-xs">
              On Route
            </Badge>
          ) : (
            <Badge variant="info" className="px-2.5 py-1 text-xs">
              Yard Standby
            </Badge>
          )}
        </div>
      </motion.div>

      {/* 2. Mobile-Centric Field Command Container */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-4">
        {/* Driver Profile & Telematics Card */}
        <div className="p-4 rounded-xl bg-[#0b1120] border border-[#1e2e4a] shadow-lg space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a]">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Driver ID</span>
              <span className="font-mono font-bold text-slate-200 text-xs">
                {currentDriver?.id ? currentDriver.id.slice(0, 10) : 'DRV-MH-01'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a]">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Sarathi DL</span>
              <span className="font-mono font-bold text-slate-200 text-xs truncate block">
                {currentDriver?.licenseNumber || 'MH12 2018009'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a]">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Assigned Truck</span>
              <span className="font-mono font-bold text-blue-400 text-xs">
                {activeTrip?.vehicleReg || currentDriver?.assignedVehicle || 'MH-12-Q-4521'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a]">
              <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">Safety Score</span>
              <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {currentDriver?.safetyScore ? `${currentDriver.safetyScore}%` : '96%'}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency SOS Highway Panic Action */}
        <div>
          {sosSent ? (
            <div className="p-4 rounded-xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 font-bold text-center text-xs animate-pulse shadow-lg space-y-1">
              <div className="text-base font-extrabold flex items-center justify-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                EMERGENCY HIGHWAY SOS BROADCASTED!
              </div>
              <p className="text-[11px] text-rose-200">
                Dispatch Command Center & Highway NHAI Patrol notified with your live GPS location.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTriggerSOS}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-950/60 to-red-900/60 hover:from-rose-900/80 hover:to-red-800/80 border border-rose-500/40 rounded-xl text-rose-300 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Trigger Highway Emergency SOS Alert</span>
            </button>
          )}
        </div>

        {/* Active Trip Manifest Card */}
        {activeTrip ? (
          <div className="space-y-4">
            {/* Trip Selector (if multi-trip) */}
            {driverTrips.length > 1 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1120] border border-[#1e2e4a] text-xs">
                <span className="text-slate-300 font-medium font-mono text-[11px]">Select Active Assignment:</span>
                <select
                  value={activeTrip?.id || ''}
                  onChange={e => setSelectedTripId(e.target.value)}
                  className="bg-[#0a0f1d] border border-[#1e2e4a] text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
                >
                  {driverTrips.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.tripCode} ({t.origin.city} → {t.destination.city})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Route Card */}
            <div className="p-5 rounded-2xl bg-[#0b1120] border border-[#1e2e4a] space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-3">
                <div>
                  <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">ACTIVE MANIFEST</span>
                  <div className="text-base font-extrabold font-mono text-slate-100">{activeTrip.tripCode}</div>
                </div>
                <div className="text-right">
                  <Badge variant="info" className="font-mono text-xs">{activeTrip.vehicleReg}</Badge>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{activeTrip.distanceKm} km leg</div>
                </div>
              </div>

              {/* Highway Route Visual */}
              <div className="space-y-3 p-3.5 rounded-xl bg-[#080d1a] border border-[#1e2e4a]">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{activeTrip.origin.city}</div>
                    <div className="text-xs text-slate-400">{activeTrip.origin.address}</div>
                  </div>
                </div>

                <div className="ml-4 pl-4 border-l-2 border-dashed border-[#1e2e4a] py-1 text-[11px] text-cyan-400 font-mono flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span>National Highway Transit Corridor</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{activeTrip.destination.city}</div>
                    <div className="text-xs text-slate-400">{activeTrip.destination.address}</div>
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a]">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Cargo Payload</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{activeTrip.cargoDescription}</span>
                  <span className="text-[11px] text-blue-400 font-mono">{activeTrip.cargoWeightTons} Metric Tons</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a]">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">GST E-Way Bill</span>
                  <span className="font-mono text-slate-200 mt-0.5 block text-[11px] font-bold">
                    {activeTrip.ewayBillNumber || '9012-4412-9901'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Valid & Compliant</span>
                </div>
              </div>

              {/* Digital POD Scanner Form */}
              <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e2e4a] space-y-3.5">
                <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>Proof of Delivery (POD) Electronic Upload</span>
                </div>

                {uploaded ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1 text-center">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                    <div className="font-bold text-sm">POD Uploaded & Delivery Synced!</div>
                    <div className="text-xs text-slate-300">Central dispatch hub notified of successful handover.</div>
                  </div>
                ) : (
                  <form onSubmit={handleUploadPOD} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Consignee Receipt / Delivery Notes</label>
                      <textarea
                        rows={2}
                        value={podNotes}
                        onChange={e => setPodNotes(e.target.value)}
                        placeholder="Enter seal numbers, receiver signature name, or gate remark..."
                        className="w-full bg-[#080d1a] border border-[#1e2e4a] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>

                    <div className="border-2 border-dashed border-[#1e2e4a] hover:border-blue-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#080d1a]/50">
                      <FileCheck className="w-7 h-7 text-blue-400 mx-auto mb-1.5" />
                      <div className="text-slate-200 font-semibold text-xs">Tap Camera to Capture Signed LR / Gate Pass</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Supports JPG, PNG, PDF receipt copies</div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full py-3 text-xs font-bold">
                      Confirm Delivery & Sync POD to Dispatch
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standby State */
          <div className="p-8 rounded-2xl bg-[#0b1120] border border-[#1e2e4a] text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Standby Pool • No Active Freight Leg</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                You are currently clocked in on standby. Your logistics controller will broadcast your next shipment manifest to your device shortly.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-[#1e2e4a] text-left max-w-sm mx-auto text-xs space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Depot Standby Location</span>
              <div className="text-slate-200 font-medium">Bhiwandi Logistics Hub, Bay 4</div>
              <div className="text-[11px] text-slate-400 font-mono">Assigned Vehicle: MH-12-Q-4521 (In Service)</div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatedPage>
  );
}
