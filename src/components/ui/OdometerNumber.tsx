'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface OdometerNumberProps {
  value: number;
  duration?: number; // ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const OdometerNumber: React.FC<OdometerNumberProps> = ({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const shouldReduce = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduce) {
      previousValueRef.current = value;
      return;
    }

    const startValue = previousValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: standard ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, duration, shouldReduce]);

  const activeNumber = shouldReduce ? value : displayValue;
  const formatted = decimals > 0 ? activeNumber.toFixed(decimals) : Math.round(activeNumber).toLocaleString();

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
