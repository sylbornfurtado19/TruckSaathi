'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Smartphone,
  Building2,
  Navigation,
  AlertTriangle,
  QrCode,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useMotionSafe } from '@/lib/motion';

export function RoleShowcase() {
  const [activeRole, setActiveRole] = useState<'manager' | 'driver' | 'admin'>('driver');
  const { safe } = useMotionSafe();

  const roles = [
    {
      id: 'driver',
      title: 'Commercial Driver Pilot',
      subtitle: 'Mobile Cockpit for the Highway',
      description: 'A purpose-built, high-contrast mobile interface with oversized touch targets, 1-tap SOS emergency alert, offline mode, and camera scanner for physical POD documents.',
      icon: Smartphone,
      accent: 'text-brand-orange border-brand-orange/30 bg-brand-orange/10'
    },
    {
      id: 'manager',
      title: 'Fleet & Dispatch Manager',
      subtitle: '24/7 Operations Mission Control',
      description: 'Comprehensive highway map view, real-time telemetry streaming, rapid driver dispatching, fuel drop alarms, and dynamic route coordination.',
      icon: Navigation,
      accent: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10'
    },
    {
      id: 'admin',
      title: 'Company Executive & Owner',
      subtitle: 'Financial & Operational Oversight',
      description: 'Aggregated fleet performance metrics, Trip P&L statements, diesel expense reconciliation, regulatory compliance tracking, and role-based access controls.',
      icon: Building2,
      accent: 'text-purple-400 border-purple-400/30 bg-purple-400/10'
    }
  ];

  return (
    <section id="roles" className="py-24 bg-surface/20 relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface px-3.5 py-1 text-xs font-mono font-medium text-text-secondary">
            <Users className="w-3.5 h-3.5 text-brand-orange" />
            <span>TAILORED EXPERIENCES</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary">
            Designed for Every Stakeholder
          </h2>
          
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            From the driver steering a 32-foot multi-axle truck in the dead of night to the dispatch controller and fleet executive.
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="flex justify-center gap-3 mb-12">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id as 'manager' | 'driver' | 'admin')}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'border-brand-orange bg-brand-orange/10 text-white shadow-glow-orange/20'
                    : 'border-white/[0.08] bg-surface/60 text-text-secondary hover:text-white hover:bg-surface'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-orange' : 'text-text-muted'}`} />
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Showcase */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeRole === 'driver' && (
              <motion.div
                key="driver"
                initial={safe({ opacity: 0, y: 15 })}
                animate={{ opacity: 1, y: 0 }}
                exit={safe({ opacity: 0, y: -15 })}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Description */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
                    <span>MOBILE DRIVER PORTAL</span>
                  </div>
                  
                  <h3 className="text-3xl font-black text-text-primary tracking-tight">
                    The Highway Pilot Cockpit
                  </h3>
                  
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Designed specifically for high-glare daytime sun and low-light night highways. Drivers see only what matters: their next waypoint, speed warnings, one-tap emergency help, and instant POD scanning.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">Hold-to-Activate Highway SOS</div>
                        <div className="text-xs text-text-secondary">Prevents accidental taps while ensuring immediate emergency dispatch notification.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-brand-orange/10 text-brand-orange border border-brand-orange/20 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">Offline Mode Synchronization</div>
                        <div className="text-xs text-text-secondary">Actions queue locally through highway dead zones and sync immediately when signal returns.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-text-primary">Camera POD & Consignment Scanner</div>
                        <div className="text-xs text-text-secondary">Captures sharp paper receipts with digital edge detection and consignee ink signature.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Realistic Mobile Phone Mockup */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-[300px] sm:w-[320px] rounded-[42px] border-[6px] border-slate-700/80 bg-canvas p-3 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    
                    {/* Notch / Dynamic Island */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40" />
                    </div>

                    {/* Mobile Phone Screen Content */}
                    <div className="rounded-[32px] bg-canvas border border-white/[0.08] p-4 pt-6 space-y-4 text-text-primary">
                      
                      {/* Driver Status Bar */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1">
                        <span>MH-48 EXPRESS</span>
                        <span className="text-emerald-400 font-bold">● ONLINE</span>
                      </div>

                      {/* Corridor Card */}
                      <div className="rounded-xl border border-white/[0.08] bg-surface p-3.5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-muted font-mono">CURRENT TRIP</span>
                          <span className="text-brand-orange font-bold font-mono">TRP-9021</span>
                        </div>
                        <div className="text-sm font-bold text-white">Mumbai JNPT → Jaipur Hub</div>
                        <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-brand-orange w-[65%]" />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-text-muted">
                          <span>Next: Bharuch Toll</span>
                          <span>ETA: 2h 40m</span>
                        </div>
                      </div>

                      {/* Prominent SOS Emergency Hold Button */}
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-center space-y-1.5">
                        <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-black">
                          <AlertTriangle className="w-4 h-4 animate-bounce" />
                          <span>HIGHWAY EMERGENCY SOS</span>
                        </div>
                        <div className="h-11 w-full rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg cursor-pointer">
                          Hold 3s to Broadcast Alert
                        </div>
                        <div className="text-[10px] text-rose-400/80 font-mono">
                          Notifies fleet manager + highway patrol
                        </div>
                      </div>

                      {/* Digital POD Scanner Trigger */}
                      <div className="rounded-xl border border-white/[0.08] bg-surface p-3 flex items-center justify-between cursor-pointer hover:bg-surface-muted">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Capture POD Document</div>
                            <div className="text-[10px] text-text-muted">Camera scanner & signature</div>
                          </div>
                        </div>
                        <FileCheck2 className="w-4 h-4 text-text-muted" />
                      </div>

                      {/* Driver Stats Footer */}
                      <div className="pt-1 grid grid-cols-2 gap-2 text-center text-[10px] font-mono text-text-muted">
                        <div className="bg-surface/60 p-1.5 rounded border border-white/[0.04]">
                          <div>SHIFT HOURS</div>
                          <div className="text-xs font-bold text-text-primary mt-0.5">04h 12m</div>
                        </div>
                        <div className="bg-surface/60 p-1.5 rounded border border-white/[0.04]">
                          <div>SAFETY INDEX</div>
                          <div className="text-xs font-bold text-emerald-400 mt-0.5">96 / 100</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeRole === 'manager' && (
              <motion.div
                key="manager"
                initial={safe({ opacity: 0, y: 15 })}
                animate={{ opacity: 1, y: 0 }}
                exit={safe({ opacity: 0, y: -15 })}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-white/[0.1] bg-surface/90 p-8 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div>
                    <h3 className="text-2xl font-black text-text-primary">Dispatch & Fleet Mission Control</h3>
                    <p className="text-sm text-text-secondary">Real-time control over multi-corridor shipments and driver assignments.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                    <span>24 Units Active On Highway</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-canvas/60 p-4 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono text-text-muted">ACTIVE SHIPMENTS</div>
                    <div className="text-2xl font-black text-text-primary font-mono">18 En Route</div>
                    <div className="text-xs text-text-secondary">NH-48, NH-44, and NH-19 corridors monitored.</div>
                  </div>
                  <div className="rounded-xl bg-canvas/60 p-4 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono text-text-muted">IDLE CAPACITY</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">6 Vehicles</div>
                    <div className="text-xs text-text-secondary">Standby at Bhiwandi and Gurgaon logistics hubs.</div>
                  </div>
                  <div className="rounded-xl bg-canvas/60 p-4 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono text-text-muted">TELEMETRY HEALTH</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">99.8% Lock</div>
                    <div className="text-xs text-text-secondary">Zero dropouts reported in current shift.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeRole === 'admin' && (
              <motion.div
                key="admin"
                initial={safe({ opacity: 0, y: 15 })}
                animate={{ opacity: 1, y: 0 }}
                exit={safe({ opacity: 0, y: -15 })}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-white/[0.1] bg-surface/90 p-8 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div>
                    <h3 className="text-2xl font-black text-text-primary">Enterprise Financial & Asset Analytics</h3>
                    <p className="text-sm text-text-secondary">Consolidated operating margins, diesel reconciliation, and compliance health.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-mono font-bold">
                    <span>Executive Oversight</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-canvas/60 p-4 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono text-text-muted">NET OPERATING MARGIN</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">+16.4%</div>
                    <div className="text-xs text-text-secondary">Optimized backhauls and verified fuel efficiency.</div>
                  </div>
                  <div className="rounded-xl bg-canvas/60 p-4 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono text-text-muted">FASTAG TOLL RECONCILIATION</div>
                    <div className="text-2xl font-black text-text-primary font-mono">100% Match</div>
                    <div className="text-xs text-text-secondary">Automated toll deduction ledger against dispatch orders.</div>
                  </div>
                  <div className="rounded-xl bg-canvas/60 p-4 border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono text-text-muted">SAFETY & COMPLIANCE RATING</div>
                    <div className="text-2xl font-black text-brand-orange font-mono">Grade A</div>
                    <div className="text-xs text-text-secondary">All vehicles carry valid insurance and national permits.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
