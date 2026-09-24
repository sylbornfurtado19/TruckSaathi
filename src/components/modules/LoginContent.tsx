'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Mail,
  Lock,
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
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between overflow-hidden">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-card bg-brand-navy p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-control bg-brand-navy p-1.5">
                <img
                  src="/logo-dark.png"
                  alt="TruckSaathi Logo"
                  className="w-full h-full object-contain filter brightness-125 contrast-125"
                />
              </div>
            </div>
            <span className="font-mono text-2xl font-black tracking-tight text-brand-navy">
              TRUCK<span className="text-brand-orange">SAATHI</span>
            </span>
          </div>

          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3.5 py-1.5 text-sm font-semibold text-text-secondary">
            <Sparkles className="h-4 w-4 text-brand-orange" />
            <span>AI-powered logistics OS</span>
          </div>

          {/* Headline inspired by PLATR design */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Seamless logistics, <br />
              <span className="text-brand-orange">
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
          <div className="grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-4">
            <div>
              <div className="font-mono text-xl font-black text-text-primary sm:text-2xl">99.8%</div>
              <div className="text-xs font-medium text-text-secondary">GPS telemetry uptime</div>
            </div>
            <div>
              <div className="font-mono text-xl font-black text-focus sm:text-2xl">14+</div>
              <div className="text-xs font-medium text-text-secondary">Integrated modules</div>
            </div>
            <div>
              <div className="font-mono text-xl font-black text-green-700 sm:text-2xl">&lt; 3s</div>
              <div className="text-xs font-medium text-text-secondary">Digital POD sync</div>
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
          <div className="space-y-6 rounded-card border border-border bg-surface p-6 shadow-popover sm:p-8">
            {/* Card Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h2>
              <p className="text-sm text-text-secondary">Select your portal role to log in</p>
            </div>

            {/* 2-Window Live Simulation Quick Demo Launcher */}
            <div className="space-y-2.5 rounded-card border border-border bg-surface-muted p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-orange" />
                  2-Window Live Simulation
                </span>
                <span className="rounded-full border border-border bg-surface px-2 py-1 font-mono text-xs font-bold text-text-secondary">
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
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand-orange px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-orange-700"
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
                  className="py-2.5 px-3 rounded-control bg-brand-navy hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Driver (Ramesh)</span>
                </button>
              </div>
              <p className="text-xs leading-tight text-text-secondary">
                💡 <strong>Demo tip:</strong> Open one tab as <em>Fleet Manager</em> and another tab (or Incognito) as <em>Driver</em> to see the highway simulation and speed sync in real time!
              </p>
            </div>

            {/* Role Selector Tabs (Customer vs Staff & Manager in PLATR reference) */}
            <div className="grid grid-cols-2 gap-1 rounded-control border border-border bg-surface-muted p-1 text-sm">
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-control px-3 py-2.5 font-semibold transition-colors duration-150 ${
                  portalRole === 'driver'
                    ? 'bg-brand-orange text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('management')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-control px-3 py-2.5 font-semibold transition-colors duration-150 ${
                  portalRole === 'management'
                    ? 'bg-brand-orange text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
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
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-surface-muted"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs font-bold text-focus">G</span>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-surface px-3 text-xs font-semibold text-text-muted">
                Or sign in with email
              </span>
            </div>

            {/* Developer / Prototype Mode Notice */}
            {!isConfigured && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Prototype Demo Mode</span>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">
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
                      className="w-full rounded-control border border-border bg-surface px-3.5 py-3 pl-10 font-mono text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
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
                      className="cursor-pointer text-sm text-focus hover:text-blue-700"
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
                      className="w-full rounded-control border border-border bg-surface px-3.5 py-3 pl-10 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-brand-orange hover:bg-orange-700 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
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
                      className="w-full rounded-control border border-border bg-surface px-3.5 py-3 pl-10 font-mono text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-brand-orange px-4 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-orange-700 disabled:opacity-60"
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
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-border px-6 py-6 text-sm text-text-muted sm:flex-row lg:px-12">
        <div>© 2026 TruckSaathi Inc. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Crafted for Indian Logistics & Enterprise Fleets</span>
        </div>
      </footer>
    </div>
  );
}
