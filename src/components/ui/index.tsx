'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, ArrowDown, Loader2, X, Search } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   BUTTON                                   */
/* -------------------------------------------------------------------------- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 relative select-none';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md shadow-blue-600/20 border border-blue-400/25',
    secondary:
      'bg-[#121c2e] hover:bg-[#1a273f] active:bg-[#0f1726] text-slate-200 border border-[#223352] hover:border-slate-400/30',
    outline:
      'bg-transparent border border-[#223352] text-slate-300 hover:bg-[#121c2e] hover:text-white hover:border-slate-400/40',
    ghost:
      'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-[#121c2e]/70',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/30 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 min-h-[30px]',
    md: 'text-xs px-3.5 py-2 gap-2 min-h-[36px]',
    lg: 'text-sm px-4.5 py-2.5 gap-2.5 min-h-[42px]'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    CARD                                    */
/* -------------------------------------------------------------------------- */

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'none';
  tilt?: boolean;
}> = ({ children, className = '', onClick, glow = 'none' }) => {
  const shouldReduceMotion = useReducedMotion();

  const glowStyles = {
    none: 'border-[#1b263b] hover:border-[#273857]',
    blue: 'border-[#1b263b] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10',
    emerald: 'border-[#1b263b] hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10',
    amber: 'border-[#1b263b] hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10',
    rose: 'border-[#1b263b] hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10',
    cyan: 'border-[#1b263b] hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10'
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion || !onClick ? {} : { y: -1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      className={`bg-[#0a101d] rounded-xl p-5 border transition-all duration-200 relative ${glowStyles[glow]} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Precision top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    BADGE                                   */
/* -------------------------------------------------------------------------- */

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'neutral';
  pulse?: boolean;
  className?: string;
}> = ({ children, variant = 'neutral', pulse = false, className = '' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  const dotStyles = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    cyan: 'bg-cyan-400',
    neutral: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotStyles[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    INPUT                                   */
/* -------------------------------------------------------------------------- */

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }> = ({
  icon,
  className = '',
  ...props
}) => (
  <div className="relative w-full">
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
    <input
      className={`w-full bg-[#0c1322] border border-[#1e2d47] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg text-xs text-slate-100 placeholder:text-slate-500 py-2 transition-colors ${
        icon ? 'pl-9 pr-3' : 'px-3'
      } ${className}`}
      {...props}
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/*                                 PAGE HEADER                                */
/* -------------------------------------------------------------------------- */

export const PageHeader: React.FC<{
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, description, badge, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b273d]">
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          {title}
        </h1>
        {badge && (
          typeof badge === 'string' ? (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {badge}
            </span>
          ) : badge
        )}
      </div>
      <p className="text-xs text-slate-400 max-w-2xl">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">{actions}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                              ANIMATED NUMBER                               */
/* -------------------------------------------------------------------------- */

export const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 600; // ms
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

/* -------------------------------------------------------------------------- */
/*                                  KPI CARD                                  */
/* -------------------------------------------------------------------------- */

export const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtext?: string;
  trend?: { direction?: 'up' | 'down'; isPositive?: boolean; value: string };
  icon: React.ReactNode;
  iconBg?: string;
  glow?: 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
}> = ({
  title,
  value,
  subtext,
  trend,
  icon,
  iconBg = 'bg-blue-600/10 text-blue-400 border-blue-500/20',
  glow = 'blue'
}) => {
  const isUp = trend?.direction === 'up' || trend?.isPositive === true;

  return (
    <Card glow={glow} className="relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">{title}</span>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline justify-between">
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : <span className="tabular-nums font-mono">{value}</span>}
        {trend && (
          <span
            className={`text-[11px] font-semibold font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${
              isUp
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
      {subtext && <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1 font-medium">{subtext}</div>}
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MODAL / DIALOG                               */
/* -------------------------------------------------------------------------- */

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, description, children, size = 'lg', maxWidth }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const resolvedWidth = maxWidth || sizeClasses[size] || 'max-w-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${resolvedWidth} bg-[#0b1120] border border-[#1f2d48] rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150`}
      >
        <div className="flex items-start justify-between border-b border-[#1b263b] pb-3.5">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white">{title}</h2>
            {description && <p className="text-xs text-slate-400">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#141d30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 EMPTY STATE                                */
/* -------------------------------------------------------------------------- */

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="p-10 rounded-xl bg-[#090e1a] border border-[#1b263b] text-center space-y-3 flex flex-col items-center justify-center">
    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
      {icon}
    </div>
    <div className="space-y-1 max-w-sm">
      <h3 className="text-sm font-bold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
    {action && <div className="pt-2">{action}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/*                            ANIMATION VARIANTS                              */
/* -------------------------------------------------------------------------- */

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

export const RouteDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`route-line-divider my-4 ${className}`} />
);

export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05
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
