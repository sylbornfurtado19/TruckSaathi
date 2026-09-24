'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  User,
  Shield,
  Info,
  Building2,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { ensureUserProfile } from '@/lib/services/profileService';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, currentUser, authLoading, loginAsDemoRole } = useApp();

  const [portalRole, setPortalRole] = useState<'driver' | 'management'>('management');
  const [email, setEmail] = useState('sylborn@trucksaathi.in');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const isConfigured = isSupabaseConfigured();

  // If already authenticated, redirect to the appropriate destination
  useEffect(() => {
    if (!authLoading && session && currentUser) {
      const redirectParam = searchParams.get('redirect');
      if (currentUser.role === 'Driver') {
        router.replace('/driver-portal');
      } else if (redirectParam && redirectParam.startsWith('/') && redirectParam !== '/driver-portal') {
        router.replace(redirectParam);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [authLoading, session, currentUser, router, searchParams]);

  // Handle switching role tabs
  const handleRoleChange = (role: 'driver' | 'management') => {
    setPortalRole(role);
    setError(null);
    if (role === 'driver') {
      if (email === 'sylborn@trucksaathi.in' || !email) {
        setEmail('ramesh.k@trucksaathi.in');
      }
    } else {
      if (email === 'ramesh.k@trucksaathi.in' || !email) {
        setEmail('sylborn@trucksaathi.in');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isConfigured) {
      // In offline/unconfigured prototype mode, allow direct access based on selected role
      if (portalRole === 'driver') {
        router.push('/driver-portal');
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Fetch profile to route user according to their role
        const profile = await ensureUserProfile(data.session.user);
        const redirectParam = searchParams.get('redirect');

        if (profile.role === 'Driver') {
          router.push('/driver-portal');
        } else if (redirectParam && redirectParam.startsWith('/') && redirectParam !== '/driver-portal') {
          router.push(redirectParam);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      if (portalRole === 'driver') {
        router.push('/driver-portal');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
        }
      });
      if (oauthError) setError(oauthError.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth sign-in failed';
      setError(msg);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isConfigured) {
      setError(
        'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file to enable password reset.'
      );
      setLoading(false);
      return;
    }

    try {
      const targetEmail = resetEmail.trim() || email.trim();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail);

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage(`Password reset instructions have been sent to ${targetEmail}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request password reset';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600/30">
      {/* Ambient background glows matching TruckSaathi brand palette */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Hero Branding Section */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="lg:col-span-7 space-y-8"
        >
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-600/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center p-1.5">
                <img
                  src="/logo-dark.png"
                  alt="TruckSaathi Logo"
                  className="w-full h-full object-contain filter brightness-125 contrast-125"
                />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white font-mono">
              TRUCK<span className="text-blue-500">SAATHI</span>
            </span>
          </div>

          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121824]/90 border border-[#202736] text-xs font-semibold text-slate-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              AI-Powered Logistics OS
            </span>
          </div>

          {/* Headline inspired by PLATR design */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Seamless logistics, <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                effortless
              </span>{' '}
              <br />
              fleet management.
            </h1>
          </div>

          {/* Subtitle Description */}
          <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
            Welcome to TruckSaathi — the modern fleet OS for instant digital dispatching, real-time GPS telemetry, and AI-driven India logistics.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1c2333] max-w-lg">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">99.8%</div>
              <div className="text-xs text-slate-500 font-medium">GPS Telemetry Uptime</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">14+</div>
              <div className="text-xs text-slate-500 font-medium">Integrated Modules</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">&lt; 3s</div>
              <div className="text-xs text-slate-500 font-medium">Digital POD Sync</div>
            </div>
          </div>
        </motion.div>

        {/* Right Auth Card Section */}
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-5"
        >
          <div className="bg-[#0c111d]/90 backdrop-blur-2xl border border-[#1f2838] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-6 relative overflow-hidden">
            {/* Subtle top card glow highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

            {/* Card Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
              <p className="text-xs text-slate-400">Select your portal role to log in</p>
            </div>

            {/* 2-Window Live Simulation Quick Demo Launcher */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/70 via-indigo-950/50 to-[#0e1627] border border-blue-500/40 shadow-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  2-Window Live Simulation
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  Real-Time Sync
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoRole('Fleet Manager');
                    router.push('/dashboard');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Fleet Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemoRole('Driver', 'd-1');
                    router.push('/driver-portal');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Driver (Ramesh)</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                💡 <strong>Demo tip:</strong> Open one tab as <em>Fleet Manager</em> and another tab (or Incognito) as <em>Driver</em> to see the highway simulation and speed sync in real time!
              </p>
            </div>

            {/* Role Selector Tabs (Customer vs Staff & Manager in PLATR reference) */}
            <div className="p-1 rounded-xl bg-[#141b2b] border border-[#202738] grid grid-cols-2 gap-1 text-xs">
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                className={`py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  portalRole === 'driver'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2338]/40'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('management')}
                className={`py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  portalRole === 'management'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2338]/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Staff & Manager</span>
              </button>
            </div>

            {/* Google Social SSO Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12s.45 3.8 1.26 5.42l4.01-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#1f2838] w-full" />
              <span className="bg-[#0c111d] px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 absolute">
                OR SIGN IN WITH EMAIL
              </span>
            </div>

            {/* Developer / Prototype Mode Notice */}
            {!isConfigured && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Prototype Demo Mode</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Click below to log in instantly as{' '}
                  <strong className="text-white">
                    {portalRole === 'driver' ? 'Ramesh Kumar (Driver)' : 'Sylborn Furtado (Admin)'}
                  </strong>
                  .
                </p>
              </div>
            )}

            {/* Error & Feedback Alerts */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{message}</span>
              </div>
            )}

            {/* Form */}
            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#141b2b] border border-[#202738] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none rounded-xl text-slate-100 pl-10 pr-3.5 py-3 font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-slate-300 font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-[11px] cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required={isConfigured}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#141b2b] border border-[#202738] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none rounded-xl text-slate-100 pl-10 pr-3.5 py-3 transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>
                      {portalRole === 'driver' ? 'Sign In as Driver' : 'Sign In as Fleet Manager'}
                    </span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail || email}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#141b2b] border border-[#202738] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none rounded-xl text-slate-100 pl-10 pr-3.5 py-3 font-mono transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError(null);
                    setMessage(null);
                  }}
                  className="w-full text-slate-400 hover:text-slate-200 text-xs text-center block pt-1 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {/* Bottom Card Footer */}
            <div className="pt-2 text-center text-xs text-slate-400">
              {portalRole === 'driver' ? (
                <span>
                  New driver?{' '}
                  <span className="text-blue-400 font-medium">Contact your dispatch fleet manager</span>
                </span>
              ) : (
                <span>
                  New enterprise fleet?{' '}
                  <span className="text-blue-400 font-medium">Create an account</span>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Page Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 border-t border-[#1c2333]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative z-10">
        <div>© 2026 TruckSaathi Inc. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Crafted for Indian Logistics & Enterprise Fleets</span>
        </div>
      </footer>
    </div>
  );
}
