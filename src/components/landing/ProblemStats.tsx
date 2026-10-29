'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, ShieldAlert, BarChart3 } from 'lucide-react';
import { OdometerNumber } from '@/components/ui/OdometerNumber';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useMotionSafe } from '@/lib/motion';

export function ProblemStats() {
  const { safe } = useMotionSafe();

  const stats = [
    {
      metric: 75,
      suffix: '%',
      tag: 'OPERATIONAL FRAGMENTATION',
      title: 'Small & Independent Operators',
      description: 'About 75% of India\'s estimated ~3.5 million commercial truck owners operate fleets of fewer than 5 vehicles, lacking access to unified enterprise control systems.',
      icon: AlertTriangle,
      color: 'amber',
      accentClass: 'text-amber-400 border-amber-400/20 bg-amber-400/10'
    },
    {
      metric: 8.9,
      prefix: '7.8 - ',
      suffix: '%',
      decimals: 1,
      tag: 'ECONOMIC IMPACT',
      title: 'Logistics Share of GDP',
      description: 'India\'s freight and supply chain costs remain at 7.8% to 8.9% of national GDP, driven by idle waiting hours, empty backhauls, and unoptimized transit corridors.',
      icon: TrendingDown,
      color: 'orange',
      accentClass: 'text-brand-orange border-brand-orange/20 bg-brand-orange/10'
    },
    {
      metric: 1.68,
      prefix: '',
      suffix: ' Lakh',
      decimals: 2,
      tag: 'HIGHWAY SAFETY IMPERATIVE',
      title: 'Annual Road Fatalities (2022)',
      description: 'Over 1.68 lakh lives lost on Indian highways in 2022. Real-time speed governor alerts, driver fatigue telematics, and instant 1-tap SOS are essential infrastructure.',
      icon: ShieldAlert,
      color: 'crimson',
      accentClass: 'text-rose-400 border-rose-400/20 bg-rose-400/10'
    }
  ];

  return (
    <section id="stats" className="py-24 bg-canvas relative overflow-hidden border-y border-white/[0.06]">
      {/* Background ambient gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-brand-navy/30 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-surface-muted px-3.5 py-1 text-xs font-mono font-medium text-text-secondary">
            <BarChart3 className="w-3.5 h-3.5 text-brand-orange" />
            <span>INDIAN FREIGHT INDUSTRY CONTEXT</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text-primary">
            Why Modern Highway Logistics Needs a Dedicated Mission Control
          </h2>
          
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            From the Golden Quadrilateral to rural feeder routes, heavy transport operators contend with fragmentation, margin pressure, and critical safety hazards.
          </p>
        </div>

        {/* Stats 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <SpotlightCard className="h-full flex flex-col justify-between p-7 lg:p-8 bg-surface/80 border-white/[0.08]">
                  <div className="space-y-4">
                    
                    {/* Header Pill & Icon */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider border ${stat.accentClass}`}>
                        {stat.tag}
                      </span>
                      <div className={`p-2 rounded-lg border ${stat.accentClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Numeric Count-up Display */}
                    <div className="pt-2 font-mono text-4xl sm:text-5xl font-black tracking-tight text-text-primary">
                      {stat.prefix}
                      <OdometerNumber value={stat.metric} decimals={stat.decimals || 0} />
                      <span className="text-brand-orange">{stat.suffix}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-text-primary">
                      {stat.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {stat.description}
                    </p>
                  </div>

                  {/* Highway divider line inside card */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span>Verified Freight Insight</span>
                    <span className="text-text-secondary">Official Data Reference</span>
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
