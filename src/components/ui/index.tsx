'use client';

import React from 'react';

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
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 border border-blue-500/30',
    secondary: 'bg-[#1c2333] hover:bg-[#262f42] text-slate-200 border border-[#2e374a]',
    outline: 'bg-transparent border border-[#202736] text-slate-300 hover:bg-[#1c2333] hover:text-white',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-[#1c2333]/60',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2'
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className = '',
  onClick
}) => (
  <div
    onClick={onClick}
    className={`bg-[#121824] border border-[#202736] rounded-xl p-5 hover:border-[#2e374a] transition-all shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${styles[variant]} ${className}`}
    >
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
      className={`w-full bg-[#1c2333] border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-100 placeholder:text-slate-500 py-2 transition-all ${
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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#202736]/40">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-50">{title}</h1>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
  </div>
);

export const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
}> = ({ title, value, subtext, icon, iconBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20' }) => (
  <Card>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${iconBg}`}>{icon}</div>
    </div>
    <div className="mt-3 font-mono text-3xl font-bold text-slate-50">{value}</div>
    {subtext && <div className="mt-2 text-xs text-slate-400">{subtext}</div>}
  </Card>
);
