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
      setError('Please enter both your email address and password.');
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
    <div className="flex h-screen max-h-screen w-full flex-col justify-between overflow-hidden bg-canvas text-text-primary select-none">
      {/* Main Centered Content */}
      <main className="flex flex-1 min-h-0 items-center justify-center px-6 lg:px-16 w-full">
        <div className="mx-auto grid w-full max-w-[1340px] grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] xl:gap-16">
          
          {/* Left Hero Branding Section */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-4 lg:space-y-5"
          >
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-brand-navy p-1 shadow-sm">
                <img
                  src="/logo-dark.png"
                  alt="TruckSaathi Logo"
                  className="w-full h-full object-contain filter brightness-125 contrast-125"
                />
              </div>
              <span className="font-mono text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                TRUCK<span className="text-brand-orange">SAATHI</span>
              </span>
            </div>

            {/* Badge Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3.5 py-1.5 text-xs font-semibold text-text-secondary">
              <Sparkles className="h-4 w-4 text-brand-orange" />
              <span>AI-powered enterprise logistics OS</span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="max-w-2xl text-3xl font-black leading-[1.15] tracking-tight text-text-primary sm:text-4xl lg:text-[3.25rem]">
                Keep every truck moving. <br />
                <span className="text-brand-orange">One intelligent control center.</span>
              </h1>
            </div>

            {/* Subtitle Description */}
            <p className="max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Real-time dispatch, fleet telemetry, trip P&L, driver field portal, and intelligent route optimization for modern logistics.
            </p>

            {/* Value Highlights */}
            <div className="grid max-w-lg grid-cols-3 gap-6 border-t border-border/80 pt-5">
              <div>
                <div className="font-mono text-2xl font-black text-text-primary sm:text-3xl">99.8%</div>
                <div className="text-xs font-medium text-text-muted mt-0.5">GPS uptime</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-focus sm:text-3xl">14+</div>
                <div className="text-xs font-medium text-text-muted mt-0.5">Fleet modules</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-emerald-500 sm:text-3xl">&lt; 3s</div>
                <div className="text-xs font-medium text-text-muted mt-0.5">Live POD sync</div>
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
            <div className="w-full max-w-[460px] space-y-4 rounded-2xl border border-border bg-surface p-7 shadow-popover sm:p-8">
              {/* Card Header */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">Welcome to TruckSaathi</h2>
                <p className="text-sm text-text-secondary">Sign in with your enterprise credentials</p>
              </div>

              {/* Google Social SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors duration-150 hover:bg-surface-muted shadow-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs font-bold text-focus">G</span>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-border" />
                <span className="absolute bg-surface px-3 text-xs font-medium text-text-muted">
                  Or sign in with email & password
                </span>
              </div>

              {/* Error & Feedback Alerts */}
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug text-xs">{error}</span>
                </div>
              )}

              {message && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug text-xs">{message}</span>
                </div>
              )}

              {/* Form */}
              {view === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 text-sm">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 pl-10 font-mono text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot');
                          setError(null);
                          setMessage(null);
                        }}
                        className="cursor-pointer text-xs font-medium text-focus hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 pl-10 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-bold text-white transition-all duration-150 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-brand-orange/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <span>Sign In to Control Tower</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Account email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={resetEmail || email}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 pl-10 font-mono text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 text-sm font-bold text-white transition-all duration-150 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60 shadow-md shadow-brand-orange/20"
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
                    className="block w-full cursor-pointer pt-1 text-center text-xs font-medium text-text-secondary hover:text-text-primary hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}

              {/* Bottom Card Helper */}
              <div className="pt-1 text-center text-xs text-text-muted">
                <span>Role & permissions are verified directly via Supabase.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Page Bottom Slim Footer */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between border-t border-border px-8 py-3 text-xs text-text-muted">
        <div>© 2026 TruckSaathi Inc. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-focus" />
          <span>Crafted for Indian Logistics & Enterprise Fleets</span>
        </div>
      </footer>
    </div>
  );
}
