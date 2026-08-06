'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 relative overflow-hidden';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-[#1c2333]/80 hover:bg-[#262f42] text-slate-200 border border-[#2e374a] backdrop-blur-md hover:border-slate-400/30 hover:scale-[1.02] active:scale-[0.98]',
    outline:
      'bg-transparent border border-[#202736] text-slate-300 hover:bg-[#1c2333]/60 hover:text-white hover:border-slate-400/30 hover:scale-[1.02] active:scale-[0.98]',
    ghost:
      'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-[#1c2333]/60',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 shadow-md shadow-rose-500/10 hover:scale-[1.02] active:scale-[0.98]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2'
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: 'blue' | 'emerald' | 'amber' | 'rose' | 'none';
  tilt?: boolean;
}> = ({ children, className = '', onClick, glow = 'none', tilt = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3; // max 3 deg
    const rotateY = ((x - centerX) / centerX) * 3; // max 3 deg

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    if (!tilt || shouldReduceMotion) return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.3s ease-out'
    });
  };

  const glowStyles = {
    none: 'hover:shadow-lg hover:shadow-blue-500/5',
    blue: 'hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500/40',
    emerald: 'hover:shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-500/40',
    amber: 'hover:shadow-xl hover:shadow-amber-500/20 hover:border-amber-500/40',
    rose: 'hover:shadow-xl hover:shadow-rose-500/20 hover:border-rose-500/40'
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`glass-panel rounded-xl p-5 transition-all duration-300 relative group ${glowStyles[glow]} ${className}`}
    >
      {/* 1px Inner Top Edge Glass Light Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  pulse?: boolean;
  className?: string;
}> = ({ children, variant = 'neutral', pulse = false, className = '' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/10',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/10',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const dotStyles = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    neutral: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border backdrop-blur-md ${styles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }> = ({
  icon,
  className = '',
  ...props
}) => (
  <div className="relative w-full">
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
    <input
      className={`w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-xs text-slate-100 placeholder:text-slate-500 py-2.5 transition-all duration-200 backdrop-blur-md ${
        icon ? 'pl-9 pr-3' : 'px-3'
      } ${className}`}
      {...props}
    />
  </div>
);

export const PageHeader: React.FC<{ title: string; description: string; actions?: React.ReactNode }> = ({
  title,
  description,
  actions
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202736]/60">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-50 flex items-center gap-2">
        {title}
      </h1>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2.5 self-start sm:self-auto">{actions}</div>}
  </div>
);

export const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 800; // ms
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums font-mono">{displayValue}</span>;
};

export const KPICard: React.FC<{
  title: string;
  value: number;
  subtext?: string;
  trend?: { direction: 'up' | 'down'; value: string };
  icon: React.ReactNode;
  iconBg?: string;
  glow?: 'blue' | 'emerald' | 'amber' | 'rose';
}> = ({
  title,
  value,
  subtext,
  trend,
  icon,
  iconBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  glow = 'blue'
}) => (
  <Card glow={glow} className="relative overflow-hidden">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-lg ${iconBg}`}>{icon}</div>
    </div>
    <div className="mt-3 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300 tracking-tight flex items-baseline justify-between">
      <AnimatedNumber value={value} />
      {trend && (
        <span
          className={`text-xs font-semibold font-mono flex items-center gap-0.5 px-2 py-0.5 rounded-full border ${
            trend.direction === 'up'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {trend.direction === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {trend.value}
        </span>
      )}
    </div>
    {subtext && <div className="mt-2 text-xs text-slate-400 flex items-center gap-1 font-medium">{subtext}</div>}
  </Card>
);

export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

export const RouteDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`route-line-divider my-6 ${className}`} />
);

export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative"
    >
      {children}
    </motion.div>
  );
};
