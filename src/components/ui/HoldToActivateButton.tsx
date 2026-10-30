'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface HoldToActivateButtonProps {
  onActivate: () => void;
  holdTimeMs?: number;
  label?: string;
  className?: string;
}

export function HoldToActivateButton({
  onActivate,
  holdTimeMs = 1800,
  label = 'HOLD TO ACTIVATE SOS',
  className = ''
}: HoldToActivateButtonProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHold = () => {
    setHolding(true);
    startTimeRef.current = performance.now();

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / holdTimeMs) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        setHolding(false);
        setProgress(0);
        startTimeRef.current = null;
        onActivate();
      } else {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const cancelHold = () => {
    setHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const secondsLeft = Math.max(0, ((holdTimeMs - (progress / 100) * holdTimeMs) / 1000)).toFixed(1);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-150 select-none shadow-xl ${
        holding
          ? 'scale-96 border-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.7)] bg-rose-950/70'
          : 'scale-100 border-rose-500/40 bg-rose-950/25 shadow-rose-950/40 hover:border-rose-500/70'
      } ${className}`}
    >
      {/* Progress fill bar with laser front */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-600/70 via-rose-500/90 to-rose-400 transition-[width] ease-linear shadow-[0_0_24px_rgba(239,68,68,0.9)]"
        style={{ width: `${progress}%` }}
      />

      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className="relative z-10 flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 px-6 py-4 text-center text-sm font-black tracking-wider text-rose-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-rose-400"
      >
        <AlertTriangle className={`h-5 w-5 text-rose-400 ${holding ? 'animate-bounce' : 'animate-pulse'}`} />
        <span className="font-mono">
          {holding ? `HOLD FOR SOS (${secondsLeft}s) · ${Math.round(progress)}%` : label}
        </span>
      </button>
    </div>
  );
}
