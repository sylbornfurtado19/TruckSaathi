'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Navigation,
  Activity,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Fuel,
  QrCode,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useMotionSafe } from '@/lib/motion';

export function HowItWorksStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const { safe } = useMotionSafe();

  const steps = [
    {
      id: 'dispatch',
      number: '01',
      title: 'Dispatch',
      headline: 'Intelligent Load & Route Matching',
      description: 'Match available trucks with verified drivers based on vehicle capacity, hazmat permits, and driver duty hours. Auto-validate E-Way bill expiry before axle roll-out.',
      icon: Send,
      preview: {
        badge: 'DISPATCH CONTROL',
        tripId: 'TRP-2026-8941',
        origin: 'JNPT Port, Navi Mumbai',
        destination: 'Sanjay Gandhi Transport Nagar, Delhi',
        vehicle: 'MH-04-GP-3124 (32ft Multi-Axle)',
        weight: '24.5 MT / 28 MT Capacity',
        driver: 'Harpreet Singh (Score: 94)',
        ewayBill: 'Active (48 hrs remaining)'
      }
    },
    {
      id: 'drive',
      number: '02',
      title: 'Drive',
      headline: 'Mobile Cockpit & Highway Corridor Navigation',
      description: 'Drivers receive clear route waypoints along India\'s freight corridors. Real-time geofence tracking alerts on unauthorized route diversions and mandatory rest stops.',
      icon: Navigation,
      preview: {
        badge: 'DRIVER COCKPIT',
        tripId: 'NH-48 CORRIDOR RUN',
        origin: 'Vapi Industrial Zone',
        destination: 'Surat Toll Hub',
        vehicle: 'Speed: 64 km/h (Gov: 80 km/h)',
        weight: 'Next Rest Stop: 42 km (Dhabha NH-48)',
        driver: 'Active Shift: 4h 12m (Compliant)',
        ewayBill: 'SOS Ready • Offline Sync Enabled'
      }
    },
    {
      id: 'monitor',
      number: '03',
      title: 'Monitor',
      headline: 'Live Telemetry & Fuel Theft Siphoning Radar',
      description: 'Continuous 3-second GPS updates, engine temperature, brake wear alerts, and automated detection of rapid fuel level drops with instant dispatcher notification.',
      icon: Activity,
      preview: {
        badge: 'MISSION CONTROL RADAR',
        tripId: 'LIVE TELEMETRY STREAM',
        origin: 'GPS Lock: 18 Sats Connected',
        destination: 'Heading: 14° NNE • Bearing 340°',
        vehicle: 'Fuel Tank: 240L (No anomalies)',
        weight: 'Engine Temp: 86°C • Battery: 24.2V',
        driver: 'Geofence: Inside NH-48 Corridor',
        ewayBill: 'Telemetry Heartbeat: 100% OK'
      }
    },
    {
      id: 'deliver',
      number: '04',
      title: 'Deliver',
      headline: 'Digital POD, LR Scanner & Instant P&L Closure',
      description: 'Drivers scan physical consignment notes with automatic edge-detection and collect customer digital signatures. Trip expenses, Fastag tolls, and diesel costs reconcile instantly.',
      icon: CheckCircle2,
      preview: {
        badge: 'DELIVERY CONFIRMATION',
        tripId: 'TRIP RECONCILED',
        origin: 'Consignee: Delhi Logistics Hub',
        destination: 'LR No: LR-8849-B',
        vehicle: 'Digital POD: Captured & Signed',
        weight: 'Fastag Tolls: ₹4,850 Reconciled',
        driver: 'Driver Settlement: Approved',
        ewayBill: 'Status: Successfully Closed'
      }
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-surface/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-surface px-3.5 py-1 text-xs font-mono font-medium text-brand-orange">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-ping" />
            <span>END-TO-END FREIGHT WORKFLOW</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary">
            How TruckSaathi Powers Every Mile
          </h2>
          
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            From initial cargo allocation to highway transit and final consignee handoff, each phase is streamlined into a seamless operational flow.
          </p>
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-4xl mx-auto">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-brand-orange bg-brand-orange/10 shadow-glow-orange/20 text-white'
                    : 'border-white/[0.08] bg-surface/60 hover:bg-surface text-text-secondary hover:text-white'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    isActive ? 'bg-brand-orange text-white' : 'bg-surface-muted text-text-muted'
                  }`}
                >
                  {s.number}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">{s.title}</span>
                  <span className="text-[10px] text-text-muted">Phase {idx + 1}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-step-indicator"
                    className="absolute -bottom-px left-4 right-4 h-0.5 bg-brand-orange shadow-glow-orange"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Morphing Illustration & Content Showcase */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={safe({ opacity: 0, y: 15 })}
              animate={{ opacity: 1, y: 0 }}
              exit={safe({ opacity: 0, y: -15 })}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <SpotlightCard className="p-8 sm:p-10 bg-surface/90 border-white/[0.1] shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Explanation */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                      <span>STEP {steps[activeStep].number}</span>
                      <span>•</span>
                      <span>{steps[activeStep].title.toUpperCase()}</span>
                    </div>

                    <h3 className="text-2xl font-black text-text-primary tracking-tight">
                      {steps[activeStep].headline}
                    </h3>

                    <p className="text-sm text-text-secondary leading-relaxed">
                      {steps[activeStep].description}
                    </p>

                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-xs font-mono text-brand-orange font-semibold">
                        <span>Workflow phase {activeStep + 1} of 4</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Right Dynamic Simulation Terminal */}
                  <div className="md:col-span-6">
                    <div className="rounded-xl border border-white/[0.08] bg-canvas/80 p-5 space-y-4 font-mono text-xs shadow-inner">
                      
                      {/* Terminal Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[11px] font-bold text-text-muted">
                          {steps[activeStep].preview.badge}
                        </span>
                      </div>

                      {/* Data Rows */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center bg-surface/40 p-2 rounded border border-white/[0.04]">
                          <span className="text-text-muted">REFERENCE:</span>
                          <span className="font-bold text-brand-orange">
                            {steps[activeStep].preview.tripId}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-surface/40 p-2 rounded border border-white/[0.04]">
                          <span className="text-text-muted">START:</span>
                          <span className="text-text-primary text-right truncate max-w-[180px]">
                            {steps[activeStep].preview.origin}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-surface/40 p-2 rounded border border-white/[0.04]">
                          <span className="text-text-muted">DESTINATION:</span>
                          <span className="text-text-primary text-right truncate max-w-[180px]">
                            {steps[activeStep].preview.destination}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-surface/40 p-2 rounded border border-white/[0.04]">
                          <span className="text-text-muted">VEHICLE / ASSET:</span>
                          <span className="text-text-primary text-right truncate max-w-[180px]">
                            {steps[activeStep].preview.vehicle}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-surface/40 p-2 rounded border border-white/[0.04]">
                          <span className="text-text-muted">STATUS / SPECS:</span>
                          <span className="text-emerald-400 font-bold text-right truncate max-w-[180px]">
                            {steps[activeStep].preview.weight}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-surface/40 p-2 rounded border border-white/[0.04]">
                          <span className="text-text-muted">OPERATIONAL LOG:</span>
                          <span className="text-text-secondary text-right truncate max-w-[180px]">
                            {steps[activeStep].preview.ewayBill}
                          </span>
                        </div>
                      </div>

                      {/* Live Status Indicator */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>System Verified</span>
                        </div>
                        <span className="text-text-muted">Latency &lt; 20ms</span>
                      </div>

                    </div>
                  </div>

                </div>
              </SpotlightCard>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
