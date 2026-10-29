'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';

export const ShimmerSkeleton: React.FC<{
  className?: string;
  width?: string;
  height?: string;
}> = ({ className = '', width, height }) => {
  const shouldReduce = useReducedMotion();

  return (
    <div
      style={{ width, height }}
      className={`relative overflow-hidden rounded-md bg-surface-muted ${className}`}
      aria-hidden="true"
    >
      {!shouldReduce && (
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent"
          style={{
            animation: 'shimmerSweep 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}
      <style jsx>{`
        @keyframes shimmerSweep {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
