'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Truck,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Weight,
  Sparkles,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useMotionSafe, shakeAnimation, springs } from '@/lib/motion';

function generateRandomTripCode() {
  return `TRP-2026-0${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateMockEwayBill() {
  const p = () => Math.floor(1000 + Math.random() * 9000);
  return `${p()}-${p()}-${p()}`;
}

function getTwoDaysAheadIso() {
  return new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16).replace('T', ' ');
}

function getTwoDaysExpiryIso() {
  return new Date(Date.now() + 172800000).toISOString().slice(0, 10) + ' 23:59';
}

interface NewDispatchWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDispatchWizard({ isOpen, onClose }: NewDispatchWizardProps) {
  const { vehicles, drivers, trips, addTrip } = useApp();
  const { shouldReduce } = useMotionSafe();

  // Step 1: Corridor, Step 2: Vehicle & Cargo, Step 3: Driver, Step 4: Compliance & Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [originCity, setOriginCity] = useState('Mumbai');
  const [originAddress, setOriginAddress] = useState('Bhiwandi Logistics Park, Bay 14');
  const [destCity, setDestCity] = useState('Bengaluru');
  const [destAddress, setDestAddress] = useState('Nelamangala Cargo Terminal, Gate 3');
  const [distanceKm, setDistanceKm] = useState(985);
  const [scheduledDeparture, setScheduledDeparture] = useState('2026-08-06 08:00');

  const [cargoDesc, setCargoDesc] = useState('Precision Industrial Engineering Assemblies');
  const [cargoWeight, setCargoWeight] = useState(24);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [ewayBillInput, setEwayBillInput] = useState('');
  const [hasAcknowledgedOverload, setHasAcknowledgedOverload] = useState(false);

  // Eligible commercial vehicles and verified active drivers
  const availableVehicles = vehicles.filter(
    v => v.maintenanceStatus !== 'Breakdown'
  );
  const availableDrivers = drivers.filter(
    d => d.status === 'Active'
  );

  const vehicleId = selectedVehicleId || availableVehicles[0]?.id || '';
  const driverId = selectedDriverId || availableDrivers[0]?.id || '';
  const ewayBill = ewayBillInput || '9012-8821-4412';

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);
  const selectedDriver = drivers.find(d => d.id === driverId);

  // Overload calculation
  const isOverloaded = Boolean(
    selectedVehicle && cargoWeight > selectedVehicle.capacityTons
  );
  const overloadExcess = selectedVehicle ? Math.max(0, cargoWeight - selectedVehicle.capacityTons) : 0;

  if (!isOpen) return null;

  const handleWeightChange = (newWeight: number) => {
    setCargoWeight(newWeight);
    setHasAcknowledgedOverload(false);
  };

  const handleVehicleChange = (newVehId: string) => {
    setSelectedVehicleId(newVehId);
    setHasAcknowledgedOverload(false);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!originCity || !destCity) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!vehicleId || !cargoDesc || cargoWeight <= 0) return;
      if (isOverloaded && !hasAcknowledgedOverload) return;
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!driverId) return;
      setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedDriver || !originCity || !destCity) return;

    const tripCode = generateRandomTripCode();

    addTrip({
      tripCode,
      vehicleId: selectedVehicle.id,
      vehicleReg: selectedVehicle.regNumber,
      driverId: selectedDriver.id,
      driverName: selectedDriver.fullName,
      origin: {
        city: originCity,
        address: originAddress || `${originCity} Central Freight Depot`,
        lat: 19.076,
        lng: 72.8777
      },
      destination: {
        city: destCity,
        address: destAddress || `${destCity} Industrial Freight Terminal`,
        lat: 12.9716,
        lng: 77.5946
      },
      cargoDescription: cargoDesc,
      cargoWeightTons: Number(cargoWeight),
      status: 'Assigned',
      scheduledDeparture: scheduledDeparture || '2026-08-06 08:00',
      scheduledArrival: getTwoDaysAheadIso(),
      distanceKm: Number(distanceKm) || 650,
      ewayBillNumber: ewayBill,
      ewayBillExpiry: getTwoDaysExpiryIso(),
      tollSpendINR: Math.round(Number(distanceKm) * 2.8),
      podReceived: false
    });

    onClose();
    setCurrentStep(1);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: shouldReduce ? 0 : direction > 0 ? 30 : -30,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: springs.snappy
    },
    exit: (direction: number) => ({
      x: shouldReduce ? 0 : direction < 0 ? 30 : -30,
      opacity: 0,
      transition: { duration: 0.15 }
    })
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-canvas/80 backdrop-blur-md"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={springs.snappy}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl backdrop-blur-2xl z-10"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4 bg-surface-muted/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange/15 border border-brand-orange/30 text-brand-orange">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                New Commercial Freight Dispatch
              </h2>
              <p className="text-xs text-text-secondary">
                Step {currentStep} of 4: {
                  currentStep === 1 ? 'Corridor & Schedule' :
                  currentStep === 2 ? 'Cargo & Fleet Asset' :
                  currentStep === 3 ? 'Verified Pilot Driver' :
                  'Compliance & Dispatch Review'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Visual Progress Stepper */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/10 z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-brand-orange z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {[
              { num: 1, label: 'Corridor' },
              { num: 2, label: 'Asset & Load' },
              { num: 3, label: 'Pilot' },
              { num: 4, label: 'Review' }
            ].map(step => (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                    currentStep === step.num
                      ? 'border-2 border-brand-orange bg-brand-orange text-black shadow-[0_0_12px_rgba(255,107,0,0.5)]'
                      : currentStep > step.num
                      ? 'border-2 border-emerald-500 bg-emerald-500 text-black'
                      : 'border-2 border-white/20 bg-surface text-text-muted'
                  }`}
                >
                  {currentStep > step.num ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-[11px] mt-1 font-medium ${
                  currentStep === step.num ? 'text-brand-orange' : 'text-text-muted'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Sliding Form Body */}
        <div className="p-6">
          <AnimatePresence mode="wait" custom={1}>
            {/* STEP 1: Corridor & Routing */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" /> Origin City / Logistics Hub *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai Hub"
                      value={originCity}
                      onChange={e => setOriginCity(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Destination City / Depot *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru Terminal"
                      value={destCity}
                      onChange={e => setDestCity(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Origin Hub Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Bhiwandi Logistics Park, Gate 4"
                      value={originAddress}
                      onChange={e => setOriginAddress(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary">Destination Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Nelamangala Cargo Terminal, Gate 2"
                      value={destAddress}
                      onChange={e => setDestAddress(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" /> Scheduled Departure Time
                    </label>
                    <input
                      type="text"
                      value={scheduledDeparture}
                      onChange={e => setScheduledDeparture(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2 font-mono text-sm text-text-primary focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary">Estimated Corridor Distance (Km)</label>
                    <input
                      type="number"
                      value={distanceKm}
                      onChange={e => setDistanceKm(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2 font-mono text-sm text-text-primary focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Vehicle & Cargo Allocation with Overload Shake Alert */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-400" /> Commercial Fleet Asset *
                  </label>
                  <select
                    required
                    value={vehicleId}
                    onChange={e => handleVehicleChange(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2.5 text-sm text-text-primary focus:border-brand-orange focus:outline-none"
                  >
                    <option value="">-- Select Available Commercial Vehicle --</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.regNumber} — {v.make} {v.model} ({v.capacityTons}T Payload Capacity)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-text-secondary" /> Cargo Consignment Description *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FMCG Goods / Electronics"
                      value={cargoDesc}
                      onChange={e => setCargoDesc(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Weight className="w-3.5 h-3.5 text-amber-400" /> Payload Weight (Metric Tons) *
                      </span>
                      {selectedVehicle && (
                        <span className="font-mono text-xs text-text-muted">
                          Asset Max: {selectedVehicle.capacityTons}T
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={cargoWeight}
                      onChange={e => handleWeightChange(Number(e.target.value))}
                      className={`w-full rounded-lg border px-3.5 py-2 font-mono text-sm text-text-primary focus:outline-none transition-colors ${
                        isOverloaded
                          ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                          : 'border-white/10 bg-surface-muted focus:border-brand-orange'
                      }`}
                    />
                  </div>
                </div>

                {/* CRITICAL FEATURE: Overload Alert with tactile shake animation & luminous red/amber glow */}
                <AnimatePresence>
                  {isOverloaded && (
                    <motion.div
                      key="overload-warning"
                      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                      animate={shouldReduce ? { opacity: 1 } : { opacity: 1, scale: 1, x: [-4, 4, -3, 3, -1, 1, 0] }}
                      transition={shouldReduce ? { duration: 0.01 } : { duration: 0.35, ease: 'easeInOut' }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-4 text-xs text-rose-300 shadow-[0_0_24px_rgba(239,68,68,0.25)] relative overflow-hidden"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="font-bold text-rose-200 text-sm flex items-center justify-between">
                            <span>CRITICAL OVERLOAD VIOLATION DETECTED</span>
                            <span className="font-mono bg-rose-500/20 px-2 py-0.5 rounded text-rose-300">
                              +{overloadExcess}T Overload
                            </span>
                          </h4>
                          <p className="text-rose-300/90 leading-relaxed">
                            Cargo payload of <strong className="text-white">{cargoWeight} Tons</strong> exceeds vehicle rating for <strong className="text-white">{selectedVehicle?.regNumber}</strong> ({selectedVehicle?.capacityTons} Tons capacity).
                            Operating overloaded vehicles risks severe axle failure, tire blowout, and strict penalties under Section 113 of the Indian Motor Vehicles Act.
                          </p>
                          <label className="flex items-center gap-2 pt-2 text-rose-200 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={hasAcknowledgedOverload}
                              onChange={e => setHasAcknowledgedOverload(e.target.checked)}
                              className="rounded border-rose-500/40 text-brand-orange focus:ring-0"
                            />
                            <span className="font-medium text-[11px]">
                              Acknowledge dispatcher risk override for split hub transit
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 3: Driver Selection */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> Verified Commercial Driver Pilot *
                  </label>
                  <select
                    required
                    value={driverId}
                    onChange={e => setSelectedDriverId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2.5 text-sm text-text-primary focus:border-brand-orange focus:outline-none"
                  >
                    <option value="">-- Choose Verified Driver --</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} — Safety Score: {d.safetyScore || 90}/100 ({d.licenseCategory} License)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDriver && (
                  <div className="rounded-xl border border-white/8 bg-surface-muted/60 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/8 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange font-bold text-sm">
                          {selectedDriver.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary">{selectedDriver.fullName}</div>
                          <div className="text-xs font-mono text-text-muted">{selectedDriver.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Safety Index: {selectedDriver.safetyScore || 90}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-text-muted">License Category:</span>
                        <div className="font-semibold text-text-primary">{selectedDriver.licenseCategory}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Experience:</span>
                        <div className="font-semibold text-text-primary">{selectedDriver.experienceYears} Years Corridor Transit</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Sarathi DL:</span>
                        <div className="font-mono text-text-primary">{selectedDriver.licenseNumber}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Verification Status:</span>
                        <div className="text-emerald-400 font-medium">{selectedDriver.verificationStatus}</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Compliance & Manifest Review */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" /> GST E-Way Bill Number *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEwayBillInput(generateMockEwayBill())}
                      className="text-xs text-brand-orange hover:underline font-mono"
                    >
                      Regenerate Mock E-Way
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={ewayBill}
                    onChange={e => setEwayBillInput(e.target.value)}
                    placeholder="12-digit GST E-Way Bill"
                    className="w-full rounded-lg border border-white/10 bg-surface-muted px-3.5 py-2 font-mono text-sm text-text-primary focus:border-brand-orange focus:outline-none"
                  />
                </div>

                {/* Final Summary Card */}
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Manifest Authorization Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-text-muted">Corridor Route:</span>
                      <div className="font-bold text-text-primary">{originCity} → {destCity} ({distanceKm} km)</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Assigned Asset:</span>
                      <div className="font-mono font-bold text-slate-100">{selectedVehicle?.regNumber}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Assigned Pilot:</span>
                      <div className="font-semibold text-slate-100">{selectedDriver?.fullName}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Cargo Payload:</span>
                      <div className="font-mono font-bold text-emerald-400">{cargoWeight} Tons</div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex items-center justify-between text-xs text-text-muted font-mono">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Est. FASTag Tolls:
                    </span>
                    <span className="font-bold text-slate-200">₹{Math.round(distanceKm * 2.8).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Bottom Controls */}
        <div className="flex items-center justify-between border-t border-white/8 px-6 py-4 bg-surface-muted/50">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 2 && isOverloaded && !hasAcknowledgedOverload}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                  currentStep === 2 && isOverloaded && !hasAcknowledgedOverload
                    ? 'bg-white/10 text-text-muted cursor-not-allowed'
                    : 'bg-brand-orange text-black hover:bg-amber-400 active:scale-98'
                }`}
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDispatch}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-98 transition-all shadow-[0_0_16px_rgba(16,185,129,0.4)]"
              >
                <CheckCircle2 className="w-4 h-4" /> Authorize & Launch Dispatch
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
