'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Truck, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginContent() {
  const [email, setEmail] = useState('sylborn@trucksaathi.in');
  const [password, setPassword] = useState('••••••••••••');
  const [view, setView] = useState<'login' | 'forgot'>('login');

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <img
            src="/logo-dark.png"
            alt="TruckSaathi Logo"
            className="h-12 w-auto object-contain mx-auto"
          />
          <p className="text-xs text-slate-400">Fleet Operating System for India's Logistics Industry</p>
        </div>

        {/* Card */}
        <div className="bg-[#121824] border border-[#202736] rounded-2xl p-6 space-y-6 shadow-2xl">
          {view === 'login' ? (
            <>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-100">Sign in to Enterprise Portal</h2>
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
                      className="w-full bg-[#1c2333] border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5 font-mono"
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
                      className="w-full bg-[#1c2333] border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5"
                    />
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 text-xs"
                >
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-100">Reset Password</h2>
                <p className="text-xs text-slate-400">Enter your registered email to receive a password reset token.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Work Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.in"
                    className="w-full bg-[#1c2333] border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-slate-100 px-3 py-2.5 font-mono"
                  />
                </div>

                <button
                  onClick={() => setView('login')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-xs"
                >
                  Send Reset Link
                </button>

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

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Protected by Supabase Auth & Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}
