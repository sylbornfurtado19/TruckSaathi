'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ShieldAlert,
  Navigation,
  Compass,
  Zap,
  Activity,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { OdometerNumber } from '@/components/ui/OdometerNumber';
import { useMotionSafe } from '@/lib/motion';

export function LandingHero() {
  const shouldReduceMotion = useReducedMotion();
  const { safe } = useMotionSafe();
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D tilt for floating dashboard cockpit card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const headlineWords = [
    { text: 'Keep', highlight: false },
    { text: 'every', highlight: false },
    { text: 'truck', highlight: false },
    { text: 'moving.', highlight: false },
    { text: 'One', highlight: true },
    { text: 'intelligent', highlight: true },
    { text: 'control', highlight: true },
    { text: 'center.', highlight: true },
  ];

  return (
    <section
      id="overview"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-screen pt-28 pb-20 overflow-hidden bg-canvas flex flex-col justify-center"
    >
      {/* Aurora and highway grid texture background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft aurora drifting glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-brand-orange/15 via-blue-500/10 to-transparent blur-[120px] rounded-full animate-aurora-drift" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Night highway horizon lights */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top pill badge */}
            <motion.div
              initial={safe({ opacity: 0, y: 15 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-surface/80 backdrop-blur-md px-3.5 py-1.5 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
              </span>
              <span className="font-mono text-xs font-semibold text-text-primary tracking-wide">
                NH-48 GOLDEN QUADRILATERAL TELEMETRY READY
              </span>
            </motion.div>

            {/* Headline with word-by-word reveal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-text-primary">
              <span className="block mb-1">
                {headlineWords.slice(0, 4).map((w, idx) => (
                  <motion.span
                    key={idx}
                    initial={safe({ opacity: 0, y: 20 })}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="inline-block mr-3"
                  >
                    {w.text}
                  </motion.span>
                ))}
              </span>
              <span className="block text-brand-orange">
                {headlineWords.slice(4).map((w, idx) => (
                  <motion.span
                    key={idx + 4}
                    initial={safe({ opacity: 0, y: 20 })}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: (idx + 4) * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="inline-block mr-3"
                  >
                    {w.text}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Subheading */}
            <motion.p
              initial={safe({ opacity: 0, y: 15 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed"
            >
              Unified dispatching, live fleet telemetry, driver safety monitoring, and compliance alerts purpose-built for commercial freight operations across India.
            </motion.p>

            {/* Actions CTA */}
            <motion.div
              initial={safe({ opacity: 0, y: 15 })}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link href="/login">
                <MagneticButton
                  variant="primary"
                  size="lg"
                  className="gap-2.5 shadow-glow-orange/50 text-sm font-bold px-6 py-3.5"
                >
                  <span>Launch Live Mission Control</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </Link>

              <a
                href="#stats"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-surface/60 hover:bg-surface px-5 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-md transition-all hover:border-white/20"
              >
                <span>View Freight Data</span>
                <Compass className="w-4 h-4 text-text-muted" />
              </a>
            </motion.div>

            {/* Metric pill strip */}
            <motion.div
              initial={safe({ opacity: 0 })}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 max-w-lg"
            >
              <div>
                <div className="font-mono text-2xl font-black text-text-primary">
                  <OdometerNumber value={99.8} decimals={1} />%
                </div>
                <div className="text-xs text-text-muted mt-0.5">Live GPS Availability</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-text-primary">
                  &lt; <OdometerNumber value={3} />s
                </div>
                <div className="text-xs text-text-muted mt-0.5">Telemetry Refresh</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-emerald-400">
                  <OdometerNumber value={100} />%
                </div>
                <div className="text-xs text-text-muted mt-0.5">E-Way Bill Compliance</div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: 3D Mouse-Tilt Cockpit Dashboard Card + Highway Graphic */}
          <div className="lg:col-span-5 relative perspective-[1000px] flex justify-center">
            
            {/* SVG Self-Drawing Highway Track */}
            <div className="absolute -top-12 -bottom-12 -left-16 -right-16 pointer-events-none hidden sm:block">
              <svg className="w-full h-full" viewBox="0 0 500 500" fill="none">
                {/* Background road line */}
                <path
                  d="M 50,450 C 150,380 200,280 250,220 C 320,140 380,80 470,30"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="32"
                  strokeLinecap="round"
                />
                
                {/* Animated road centerline */}
                <motion.path
                  d="M 50,450 C 150,380 200,280 250,220 C 320,140 380,80 470,30"
                  stroke="#ff6b00"
                  strokeWidth="3"
                  strokeDasharray="12 12"
                  strokeLinecap="round"
                  initial={safe({ pathLength: 0 })}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                />

                {/* Sweeping headlight cone */}
                <polygon
                  points="250,220 380,120 420,180"
                  fill="url(#headlightGradient)"
                  opacity="0.25"
                />

                <defs>
                  <linearGradient id="headlightGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffb020" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffb020" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Floating 3D Cockpit Glass Card */}
            <motion.div
              style={{
                rotateX: shouldReduceMotion ? 0 : rotateX,
                rotateY: shouldReduceMotion ? 0 : rotateY,
                transformStyle: 'preserve-3d',
              }}
              initial={safe({ opacity: 0, scale: 0.92, y: 20 })}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.12] bg-surface/90 backdrop-blur-xl p-6 shadow-2xl overflow-hidden"
            >
              {/* Inner ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/15 rounded-full blur-2xl pointer-events-none" />
              
              {/* Card Header: Live Vehicle Telemetry */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange">
                    <Navigation className="w-5 h-5 -rotate-45" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-text-primary tracking-wider">
                        MH-12-RN-4820
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">Tata Prima 4028.S (Heavy Multi-Axle)</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-text-muted">CORRIDOR</div>
                  <div className="font-mono text-xs font-bold text-text-primary">NH-48</div>
                </div>
              </div>

              {/* Live Gauges Row */}
              <div className="grid grid-cols-3 gap-3 py-4 border-b border-white/[0.08]">
                <div className="rounded-lg bg-surface-muted/60 p-2.5 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>SPEED</span>
                    <Activity className="w-3 h-3 text-cyan-400" />
                  </div>
                  <div className="font-mono text-xl font-black text-text-primary mt-1">
                    68 <span className="text-[10px] text-text-muted font-normal">KM/H</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full w-[68%]" />
                  </div>
                </div>

                <div className="rounded-lg bg-surface-muted/60 p-2.5 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>FUEL LEVEL</span>
                    <Zap className="w-3 h-3 text-brand-orange" />
                  </div>
                  <div className="font-mono text-xl font-black text-text-primary mt-1">
                    78<span className="text-[10px] text-text-muted font-normal">%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
                    <div className="bg-brand-orange h-full rounded-full w-[78%]" />
                  </div>
                </div>

                <div className="rounded-lg bg-surface-muted/60 p-2.5 border border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>ENGINE TEMP</span>
                    <ShieldAlert className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="font-mono text-xl font-black text-text-primary mt-1">
                    88<span className="text-[10px] text-text-muted font-normal">°C</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-[45%]" />
                  </div>
                </div>
              </div>

              {/* Waypoint Status */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Current Waypoint</span>
                  <span className="font-mono font-medium text-text-primary">Vadodara Tollway Plaza</span>
                </div>
                
                {/* Animated Waypoint Corridor Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-text-muted">
                    <span>Mumbai JNPT</span>
                    <span>Jaipur Hub</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-surface-muted border border-white/[0.06] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-brand-orange to-blue-500 rounded-full w-[64%]" />
                  </div>
                </div>

                {/* Driver & Compliance Badge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-[10px] font-bold text-brand-orange">
                      RP
                    </div>
                    <span className="text-xs font-medium text-text-secondary">Ramesh Pilot</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>E-Way Bill Active</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
