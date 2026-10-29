'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Send,
  ShieldAlert,
  Fuel,
  Receipt,
  FileCheck2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useMotionSafe } from '@/lib/motion';

export function FeatureGrid() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { safe } = useMotionSafe();

  const features = [
    {
      title: 'Real-Time Highway Fleet View',
      badge: 'MISSION CONTROL',
      description: 'Track every truck across India with continuous location pings, live speeds, heading angles, and route deviations along national highway corridors.',
      icon: Navigation,
      color: 'cyan',
      demo: {
        metric: '72 km/h',
        label: 'Current Speed on NH-48',
        detail: 'Heading 340° NNE • GPS Locked'
      }
    },
    {
      title: 'Intelligent Load & Vehicle Dispatch',
      badge: 'OPERATIONS',
      description: 'Match freight loads with the ideal multi-axle or container vehicle. Validate cargo weight limits and verify driver availability before gate departure.',
      icon: Send,
      color: 'orange',
      demo: {
        metric: '96% Match',
        label: 'Tata Prima Multi-Axle',
        detail: 'Capacity: 28 MT • Driver Assigned'
      }
    },
    {
      title: 'Driver Safety & Emergency Alarms',
      badge: 'HIGHWAY SAFETY',
      description: 'Enforce speed limits, monitor continuous driving hours, and equip drivers with an instant 1-tap SOS that immediately notifies dispatchers.',
      icon: ShieldAlert,
      color: 'crimson',
      demo: {
        metric: 'Zero Incidents',
        label: 'Continuous Shift: 3.5 hrs',
        detail: 'Mandatory Rest Window in 45m'
      }
    },
    {
      title: 'Fuel Telemetry & Theft Radar',
      badge: 'ASSET PROTECTION',
      description: 'Monitor diesel tank levels in real time. Receive immediate alerts whenever fuel drops at an anomalous rate while a vehicle is stationary.',
      icon: Fuel,
      color: 'amber',
      demo: {
        metric: '280 Liters',
        label: 'Tank Volume: 84% Level',
        detail: 'Consumption: 3.8 km/L Normal'
      }
    },
    {
      title: 'Automated Trip P&L Reconciliation',
      badge: 'FINANCIAL ACCURACY',
      description: 'Automate trip cost tracking including diesel receipts, Fastag electronic toll deductions, driver advances, and net trip profitability.',
      icon: Receipt,
      color: 'emerald',
      demo: {
        metric: '+₹18,400',
        label: 'Net Margin (Trip Closed)',
        detail: 'Tolls: ₹3,200 • Fuel: ₹24,800'
      }
    },
    {
      title: 'Document & E-Way Bill Compliance',
      badge: 'REGULATORY AUDIT',
      description: 'Keep your fleet audit-ready with automatic expiry alerts for Registration Certificates (RC), National Permits, Insurance, and active E-Way bills.',
      icon: FileCheck2,
      color: 'purple',
      demo: {
        metric: '100% Compliant',
        label: 'All Active Documents Verified',
        detail: 'Next Renewal: Insurance in 28d'
      }
    }
  ];

  return (
    <section id="features" className="py-24 bg-canvas relative overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-brand-orange/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface px-3.5 py-1 text-xs font-mono font-medium text-text-secondary">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>ENTERPRISE CAPABILITIES</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary">
            Built for the Rigors of Indian Fleet Logistics
          </h2>
          
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            Eliminate spreadsheets, endless phone calls, and manual paperwork with a centralized operations platform that connects managers and drivers.
          </p>
        </div>

        {/* 6-Card Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isHovered = hoveredIdx === idx;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <SpotlightCard className="h-full flex flex-col justify-between p-7 bg-surface/80 border-white/[0.08] hover:border-brand-orange/40 transition-colors">
                  <div className="space-y-4">
                    
                    {/* Header: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted border border-white/[0.08] text-brand-orange group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-white/[0.04]">
                        {feature.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Micro-Demo Hover Area */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <div className="rounded-lg bg-surface-muted/60 p-3 border border-white/[0.04] transition-all">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand-orange">
                          {feature.demo.metric}
                        </span>
                        <ArrowUpRight className={`w-3.5 h-3.5 text-text-muted transition-transform ${isHovered ? 'translate-x-0.5 -translate-y-0.5 text-brand-orange' : ''}`} />
                      </div>
                      <div className="text-[11px] font-semibold text-text-primary mt-1">
                        {feature.demo.label}
                      </div>
                      <div className="text-[10px] font-mono text-text-muted mt-0.5">
                        {feature.demo.detail}
                      </div>
                    </div>
                  </div>

                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
