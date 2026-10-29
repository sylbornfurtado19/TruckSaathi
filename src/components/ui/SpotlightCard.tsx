'use client';

import React, { useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = 'rgba(255, 107, 0, 0.08)',
  className = '',
  onClick,
  header,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-white/8 bg-surface shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-white/16' : ''
      } ${className}`}
      {...props}
    >
      {/* Dynamic cursor spotlight glow */}
      {!shouldReduce && position && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}

      {header && (
        <div className="relative z-10 border-b border-white/8 px-4 py-3 sm:px-5">
          {header}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};
