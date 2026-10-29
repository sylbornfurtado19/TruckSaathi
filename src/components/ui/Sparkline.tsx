'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SparklineProps {
  data?: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
  fillOpacity?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [12, 16, 14, 20, 18, 24, 22, 28, 26, 32],
  color = '#06b6d4',
  height = 36,
  width = 120,
  className = '',
  fillOpacity = 0.12
}) => {
  const shouldReduce = useReducedMotion();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 3;
  const usableHeight = height - padding * 2;
  const step = (width - padding * 2) / (data.length - 1);

  const points = data.map((val, i) => {
    const x = padding + i * step;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return [x, y] as [number, number];
  });

  const pathD = points.reduce((acc, [x, y], i) => {
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1][0]} ${height} L ${points[0][0]} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
    >
      <path
        d={areaD}
        fill={color}
        fillOpacity={fillOpacity}
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Endpoint beacon dot */}
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r={2.5}
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
};
