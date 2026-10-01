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
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { ensureUserProfile } from '@/lib/services/profileService';
import { getAuthCallbackUrl, getSiteUrl, sanitizeRedirectPath } from '@/lib/auth/url';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, currentUser, authLoading } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const isConfigured = isSupabaseConfigured();

  // Listen for query error or message parameters (e.g. from callback or reset flow)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const msgParam = searchParams.get('message');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    if (msgParam) {
      setMessage(decodeURIComponent(msgParam));
    }
  }, [searchParams]);

  // If already authenticated in Supabase, redirect to the appropriate destination
  useEffect(() => {
    if (!authLoading && session && currentUser) {
      const redirectParam = searchParams.get('redirect');
      if (currentUser.role === 'Driver') {
        router.replace('/driver-portal');
      } else if (redirectParam && redirectParam.startsWith('/') && redirectParam !== '/driver-portal') {
        router.replace(sanitizeRedirectPath(redirectParam, '/dashboard'));
      } else {
        router.replace('/dashboard');
      }
    }
  }, [authLoading, session, currentUser, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isConfigured) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);

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
        // Fetch verified profile from Supabase to route user according to their assigned role
        const profile = await ensureUserProfile(data.session.user);
        const redirectParam = searchParams.get('redirect');

        if (profile.role === 'Driver') {
          router.push('/driver-portal');
        } else if (redirectParam && redirectParam.startsWith('/') && redirectParam !== '/driver-portal') {
          router.push(sanitizeRedirectPath(redirectParam, '/dashboard'));
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
      setError('Supabase is not configured in .env.local');
      return;
    }

    try {
      const targetDestination = searchParams.get('redirect') || '/dashboard';
      const callbackUrl = getAuthCallbackUrl(targetDestination);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl
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
      setError('Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      setLoading(false);
      return;
    }

    try {
      const targetEmail = resetEmail.trim() || email.trim();
      if (!targetEmail) {
        setError('Please enter your account email address.');
        setLoading(false);
        return;
      }

      const resetRedirectUrl = `${getSiteUrl()}/login?message=${encodeURIComponent('Password reset email verified. Please sign in with your credentials.')}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: resetRedirectUrl
      });

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
    <div className="flex h-screen min-h-screen flex-col justify-between overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-canvas text-text-primary">
      {/* Main Centered Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-3 sm:px-6 lg:px-12 w-full">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          
          {/* Left Hero Branding Section */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-3.5 lg:space-y-4"
          >
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-card border border-white/10 bg-brand-navy p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-control bg-brand-navy p-1">
                  <img
                    src="/logo-dark.png"
                    alt="TruckSaathi Logo"
                    className="w-full h-full object-contain filter brightness-125 contrast-125"
                  />
                </div>
              </div>
              <span className="font-mono text-lg font-black tracking-tight text-text-primary sm:text-xl">
                TRUCK<span className="text-brand-orange">SAATHI</span>
              </span>
            </div>

            {/* Badge Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
              <span>AI-powered logistics OS</span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="max-w-2xl text-2xl font-extrabold leading-[1.1] tracking-tight text-text-primary sm:text-3xl lg:text-[2.6rem]">
                Keep every truck moving. <br />
                <span className="text-brand-orange">One intelligent control center.</span>
              </h1>
            </div>

            {/* Subtitle Description */}
            <p className="max-w-lg text-xs leading-relaxed text-text-secondary sm:text-sm">
              Real-time dispatch, fleet telemetry, trip P&L, driver field portal, and intelligent route optimization for enterprise fleets.
            </p>

            {/* Value Highlights */}
            <div className="grid max-w-md grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <div className="font-mono text-lg font-black text-text-primary sm:text-xl">99.8%</div>
                <div className="text-[11px] font-medium text-text-secondary">GPS uptime</div>
              </div>
              <div>
                <div className="font-mono text-lg font-black text-focus sm:text-xl">14+</div>
                <div className="text-[11px] font-medium text-text-secondary">Modules</div>
              </div>
              <div>
                <div className="font-mono text-lg font-black text-green-600 sm:text-xl">&lt; 3s</div>
                <div className="text-[11px] font-medium text-text-secondary">POD sync</div>
              </div>
            </div>
          </motion.div>

          {/* Right Auth Card Section */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="flex w-full justify-center"
          >
            <div className="w-full max-w-[430px] space-y-3.5 rounded-card border border-border bg-surface p-5 shadow-popover sm:p-6">
              {/* Card Header */}
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-text-primary">Welcome to TruckSaathi</h2>
                <p className="text-xs text-text-secondary">Sign in with your enterprise Supabase account</p>
              </div>

              {/* Google Social SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-primary transition-colors duration-150 hover:bg-surface-muted"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] font-bold text-focus">G</span>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-0.5">
                <div className="w-full border-t border-border" />
                <span className="absolute bg-surface px-2.5 text-[11px] font-medium text-text-muted">
                  Or sign in with email & password
                </span>
              </div>

              {/* Error & Feedback Alerts */}
              {error && (
                <div className="p-2.5 rounded-control bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug text-xs">{error}</span>
                </div>
              )}

              {message && (
                <div className="p-2.5 rounded-control bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug text-xs">{message}</span>
                </div>
              )}

              {/* Form */}
              {view === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-3 text-xs">
                  <div>
                    <label className="mb-1 block font-medium text-text-secondary">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 font-mono text-xs text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-medium text-text-secondary">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot');
                          setError(null);
                          setMessage(null);
                        }}
                        className="cursor-pointer text-[11px] text-focus hover:text-blue-700"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-xs text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
                      />
                    </div>
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand-orange px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-orange-700 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                  <div>
                    <label className="mb-1 block font-medium text-text-secondary">Account email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={resetEmail || email}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 font-mono text-xs text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-control bg-brand-orange px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-orange-700 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                    className="block w-full cursor-pointer pt-0.5 text-center text-xs text-text-secondary hover:text-text-primary"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}

              {/* Bottom Card Helper */}
              <div className="pt-1 text-center text-[11px] text-text-muted">
                <span>Role and permissions are automatically assigned from your Supabase profile.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Page Bottom Slim Footer */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between border-t border-border px-6 py-2.5 text-[11px] text-text-muted">
        <div>© 2026 TruckSaathi Inc. All rights reserved.</div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Crafted for Indian Logistics & Enterprise Fleets</span>
        </div>
      </footer>
    </div>
  );
}
