'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Fuel, Thermometer, Zap } from 'lucide-react';
import { useMotionSafe, springs } from '@/lib/motion';

interface GaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  icon?: React.ReactNode;
  size?: number;
}

export function AnalogGauge({
  label,
  value,
  min = 0,
  max = 100,
  unit,
  warningThreshold,
  criticalThreshold,
  icon,
  size = 140
}: GaugeProps) {
  const { shouldReduce } = useMotionSafe();

  const clampedVal = Math.max(min, Math.min(max, value));
  // Needle sweep angle from -120deg to +120deg (240 deg total arc)
  const ratio = (clampedVal - min) / (max - min);
  const targetAngle = -120 + ratio * 240;

  const isCritical = criticalThreshold !== undefined && value >= criticalThreshold;
  const isWarning = warningThreshold !== undefined && value >= warningThreshold && !isCritical;

  const activeColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#ff6b00';

  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-muted/60 border border-white/8 backdrop-blur-md">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 140 140" className="overflow-visible">
          {/* Outer bezel ring */}
          <circle cx="70" cy="70" r="62" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
          <circle cx="70" cy="70" r="58" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="#08101a" />

          {/* Scale Ticks */}
          {Array.from({ length: 13 }).map((_, i) => {
            const angle = -120 + (i / 12) * 240;
            const rad = (angle - 90) * (Math.PI / 180);
            const x1 = 70 + Math.cos(rad) * 50;
            const y1 = 70 + Math.sin(rad) * 50;
            const x2 = 70 + Math.cos(rad) * 56;
            const y2 = 70 + Math.sin(rad) * 56;
            const isRedline = i >= 10;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isRedline ? '#ef4444' : 'rgba(255,255,255,0.3)'}
                strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}

          {/* Needle with spring rotation */}
          <motion.g
            initial={shouldReduce ? { rotate: targetAngle } : { rotate: -120 }}
            animate={{ rotate: targetAngle }}
            transition={shouldReduce ? { duration: 0.01 } : springs.smooth}
            style={{ originX: '70px', originY: '70px' }}
          >
            {/* Needle shaft */}
            <line x1="70" y1="70" x2="70" y2="22" stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="68,70 72,70 70,18" fill={activeColor} />
          </motion.g>

          {/* Center Hub Cap */}
          <circle cx="70" cy="70" r="8" fill="#152438" stroke={activeColor} strokeWidth="2" />
          <circle cx="70" cy="70" r="3" fill="#ffffff" />
        </svg>

        {/* Bottom Digital readout */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="font-mono text-sm font-bold tracking-tight text-white">
            {clampedVal}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">
            {unit}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary font-medium">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}

interface GaugeClusterProps {
  speed?: number; // 0-120 km/h
  rpm?: number;   // 0-3000 RPM
  fuelPercent?: number; // 0-100%
  temperature?: number; // 40-120 C
}

export function GaugeCluster({
  speed = 58,
  rpm = 1750,
  fuelPercent = 74,
  temperature = 84
}: GaugeClusterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      <AnalogGauge
        label="Speedometer"
        value={speed}
        min={0}
        max={120}
        unit="km/h"
        warningThreshold={80}
        criticalThreshold={100}
        icon={<Gauge className="w-3.5 h-3.5 text-brand-orange" />}
      />
      <AnalogGauge
        label="Engine Tachometer"
        value={rpm}
        min={0}
        max={3000}
        unit="RPM"
        warningThreshold={2200}
        criticalThreshold={2600}
        icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
      />
      <AnalogGauge
        label="Fuel Tank Level"
        value={fuelPercent}
        min={0}
        max={100}
        unit="%"
        criticalThreshold={15}
        icon={<Fuel className="w-3.5 h-3.5 text-emerald-400" />}
      />
      <AnalogGauge
        label="Coolant Temp"
        value={temperature}
        min={40}
        max={120}
        unit="°C"
        warningThreshold={95}
        criticalThreshold={105}
        icon={<Thermometer className="w-3.5 h-3.5 text-rose-400" />}
      />
    </div>
  );
}

