'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function HighwayConvoy() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden border border-white/[0.08] bg-surface/70 backdrop-blur-md shadow-2xl">
      {/* Night Sky with Stars & Moon Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#050b14] to-[#0b1726]" />
      
      {/* Subtle Aurora Drift */}
      <div className="absolute top-0 left-1/4 w-96 h-28 bg-brand-orange/10 blur-3xl pointer-events-none" />

      {/* SVG Canvas for Rolling Convoy */}
      <svg
        className="relative z-10 w-full h-full"
        viewBox="0 0 600 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {/* Headlight beam gradient */}
          <linearGradient id="headlightGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffb020" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#ffb020" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffb020" stopOpacity="0" />
          </linearGradient>

          {/* Road gradient */}
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1b2a" />
            <stop offset="100%" stopColor="#050b14" />
          </linearGradient>

          {/* Mountain silhouettes */}
          <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0b1726" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Mountain horizon in background */}
        <polygon
          points="0,140 70,110 160,135 240,100 340,130 440,95 520,125 600,105 600,180 0,180"
          fill="url(#mountainGrad)"
        />

        {/* Distant Telegraph Poles / Transmission Towers */}
        <line x1="80" y1="120" x2="80" y2="155" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="72" y1="130" x2="88" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        <line x1="260" y1="110" x2="260" y2="155" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="252" y1="120" x2="268" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        <line x1="450" y1="105" x2="450" y2="155" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <line x1="442" y1="115" x2="458" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

        {/* Highway Asphalt Surface */}
        <polygon
          points="0,155 600,155 600,240 0,240"
          fill="url(#roadGrad)"
        />

        {/* Road Border Guardrails */}
        <line x1="0" y1="155" x2="600" y2="155" stroke="#334155" strokeWidth="2" />
        <line x1="0" y1="238" x2="600" y2="238" stroke="#334155" strokeWidth="2" />

        {/* Animated Dashed Lane Divider */}
        <motion.line
          x1="-100"
          y1="195"
          x2="700"
          y2="195"
          stroke="#ff6b00"
          strokeWidth="2.5"
          strokeDasharray="24 18"
          strokeLinecap="round"
          animate={shouldReduceMotion ? {} : { strokeDashoffset: [0, -42] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 1.2 }}
        />

        {/* TRUCK 1: Lead Heavy Multi-Axle Container Truck */}
        <motion.g
          animate={shouldReduceMotion ? {} : { x: [-150, 650] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 10, delay: 0 }}
        >
          {/* Sweeping Headlight Beam */}
          <polygon points="120,185 240,165 240,205" fill="url(#headlightGlow)" />

          {/* Truck Body Shadow */}
          <ellipse cx="60" cy="195" rx="55" ry="6" fill="rgba(0,0,0,0.6)" />

          {/* Trailer / Cargo Container */}
          <rect x="10" y="145" width="75" height="42" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          {/* Container ridges */}
          <line x1="25" y1="147" x2="25" y2="185" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="40" y1="147" x2="40" y2="185" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="55" y1="147" x2="55" y2="185" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="70" y1="147" x2="70" y2="185" stroke="#0f172a" strokeWidth="1.5" />

          {/* Cabin */}
          <path d="M 86,155 L 105,155 L 115,168 L 115,187 L 86,187 Z" fill="#ff6b00" />
          {/* Windshield */}
          <polygon points="98,158 106,158 112,168 98,168" fill="#38bdf8" opacity="0.8" />
          {/* Headlight bulb */}
          <circle cx="115" cy="184" r="2.5" fill="#fef08a" />
          {/* Rear taillight */}
          <rect x="8" y="178" width="2" height="6" fill="#f43f5e" />

          {/* Wheels */}
          <circle cx="25" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="42" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="72" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="102" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
        </motion.g>

        {/* TRUCK 2: Mid Convoy Logistics Truck */}
        <motion.g
          animate={shouldReduceMotion ? {} : { x: [-150, 650] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 10, delay: 3.5 }}
        >
          {/* Headlight Beam */}
          <polygon points="105,185 220,165 220,205" fill="url(#headlightGlow)" />

          {/* Shadow */}
          <ellipse cx="52" cy="195" rx="48" ry="5.5" fill="rgba(0,0,0,0.6)" />

          {/* Cargo Body (Tarpaulin Covered) */}
          <rect x="12" y="148" width="62" height="39" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          {/* Tarpaulin ropes */}
          <line x1="14" y1="165" x2="72" y2="165" stroke="#f0f9ff" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* Cabin */}
          <path d="M 75,156 L 94,156 L 102,168 L 102,187 L 75,187 Z" fill="#e2e8f0" />
          <polygon points="87,159 95,159 100,168 87,168" fill="#38bdf8" opacity="0.8" />
          <circle cx="102" cy="184" r="2.5" fill="#fef08a" />
          <rect x="10" y="178" width="2" height="6" fill="#f43f5e" />

          {/* Wheels */}
          <circle cx="28" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="62" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="90" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
        </motion.g>

        {/* TRUCK 3: Tanker Asset in Fast Lane */}
        <motion.g
          animate={shouldReduceMotion ? {} : { x: [-150, 650] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 10, delay: 7 }}
        >
          {/* Headlight Beam */}
          <polygon points="112,185 230,165 230,205" fill="url(#headlightGlow)" />

          {/* Shadow */}
          <ellipse cx="55" cy="195" rx="50" ry="5.5" fill="rgba(0,0,0,0.6)" />

          {/* Cylindrical Tanker Body */}
          <rect x="12" y="150" width="70" height="35" rx="14" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
          <line x1="22" y1="150" x2="22" y2="185" stroke="#334155" strokeWidth="2" />
          <line x1="72" y1="150" x2="72" y2="185" stroke="#334155" strokeWidth="2" />

          {/* Cabin */}
          <path d="M 83,156 L 100,156 L 108,168 L 108,187 L 83,187 Z" fill="#10b981" />
          <polygon points="93,159 101,159 106,168 93,168" fill="#38bdf8" opacity="0.8" />
          <circle cx="108" cy="184" r="2.5" fill="#fef08a" />
          <rect x="10" y="178" width="2" height="6" fill="#f43f5e" />

          {/* Wheels */}
          <circle cx="28" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="48" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="96" cy="190" r="5.5" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
        </motion.g>
      </svg>

      {/* Corridor HUD Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-canvas/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/[0.08] text-[10px] font-mono text-text-secondary">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>CONVOY TELEMETRY ACTIVE • NH-48</span>
      </div>
    </div>
  );
}
