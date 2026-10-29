'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion, HTMLMotionProps } from 'framer-motion';

interface MagneticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  strength?: number; // 0 to 1
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'cyan';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.25,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shouldReduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 350 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduce || disabled || loading) return;
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      const id = Date.now();
      setRipples(prev => [...prev.slice(-3), { x: rippleX, y: rippleY, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }

    onClick?.(e);
  };

  const variantStyles = {
    primary: 'bg-brand-orange text-white hover:bg-orange-600 border border-brand-orange/90 shadow-sm shadow-orange-950/40',
    secondary: 'bg-surface-muted text-text-primary hover:bg-slate-800 border border-border shadow-sm',
    outline: 'bg-transparent text-text-primary hover:bg-surface-muted border border-border',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted border border-transparent',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 border border-rose-600 shadow-sm shadow-rose-950/40',
    amber: 'bg-amber-600 text-white hover:bg-amber-500 border border-amber-600 shadow-sm shadow-amber-950/40',
    cyan: 'bg-sky-600 text-white hover:bg-sky-500 border border-sky-600 shadow-sm shadow-cyan-950/40'
  };

  const sizeStyles = {
    xs: 'min-h-7 px-2.5 text-xs gap-1 rounded-md font-medium',
    sm: 'min-h-8 px-3 text-xs gap-1.5 rounded-md font-semibold',
    md: 'min-h-9 px-4 text-sm gap-2 rounded-lg font-semibold',
    lg: 'min-h-11 px-5 text-sm gap-2.5 rounded-lg font-bold'
  };

  return (
    <motion.button
      ref={buttonRef}
      style={shouldReduce ? {} : { x: smoothX, y: smoothY }}
      whileTap={shouldReduce ? {} : { scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden inline-flex items-center justify-center cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {/* Ripple elements */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/20 pointer-events-none animate-ping"
          style={{
            left: ripple.x - 12,
            top: ripple.y - 12,
            width: 24,
            height: 24
          }}
        />
      ))}

      {loading ? (
        <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      {children ? <span className="relative z-10">{children}</span> : null}
    </motion.button>
  );
};
