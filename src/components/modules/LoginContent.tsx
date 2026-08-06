'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';

export function LoginContent() {
  const [email, setEmail] = useState('sylborn@trucksaathi.in');
  const [password, setPassword] = useState('••••••••••••');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#060911] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Gradient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, filter: shouldReduceMotion ? 'none' : 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <img
            src="/logo-dark.png"
            alt="TruckSaathi Logo"
            className="h-14 w-auto object-contain mx-auto filter brightness-125 contrast-125 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"
          />
          <p className="text-xs text-slate-400 font-medium">Your AI Companion for Every Truck</p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel border border-[#202736] rounded-2xl p-8 space-y-6 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {view === 'login' ? (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-100">Sign in to Enterprise Portal</h2>
                <p className="text-xs text-slate-400">Enter your credentials to access company fleet telemetry.</p>
              </div>

              <form onSubmit={e => e.preventDefault()} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5 font-mono backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-400 font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-blue-400 hover:underline text-[11px]"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5 backdrop-blur-md"
                    />
                  </div>
                </div>

                <Link href="/dashboard" className="block w-full">
                  <Button variant="primary" className="w-full py-3" icon={<ArrowRight className="w-4 h-4" />}>
                    Access Command Center
                  </Button>
                </Link>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-100">Reset Password</h2>
                <p className="text-xs text-slate-400">Enter your registered email to receive a password reset token.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Work Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.in"
                    className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-slate-100 px-3 py-2.5 font-mono"
                  />
                </div>

                <Button variant="primary" className="w-full" onClick={() => setView('login')}>
                  Send Reset Link
                </Button>

                <button
                  onClick={() => setView('login')}
                  className="w-full text-slate-400 hover:text-slate-200 text-[11px] text-center block"
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Protected by Supabase Auth & Row Level Security (RLS)</span>
        </div>
      </motion.div>
    </div>
  );
}
