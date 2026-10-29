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
  Sparkles,
  ArrowRight,
  Truck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { ensureUserProfile } from '@/lib/services/profileService';
import { getAuthCallbackUrl, getSiteUrl, sanitizeRedirectPath } from '@/lib/auth/url';
import { HighwayConvoy } from '@/components/auth/HighwayConvoy';
import { useMotionSafe } from '@/lib/motion';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, currentUser, authLoading } = useApp();
  const { safe } = useMotionSafe();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const errorParam = searchParams.get('error');
  const msgParam = searchParams.get('message');
  const [error, setError] = useState<string | null>(() => (errorParam ? decodeURIComponent(errorParam) : null));
  const [message, setMessage] = useState<string | null>(() => (msgParam ? decodeURIComponent(msgParam) : null));

  const isConfigured = isSupabaseConfigured();

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

  const triggerShake = () => {
    if (shouldReduceMotion) return;
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isConfigured) {
      setError('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      triggerShake();
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError) {
        if (authError.message === '{}' || authError.status === 500) {
          setError('Unable to authenticate with this account. If you created this user directly via SQL, please make sure auth.identities was created or create the user via the Supabase Dashboard.');
        } else if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. Please click "Confirm user" in your Supabase Dashboard under Authentication > Users.');
        } else {
          setError(authError.message);
        }
        triggerShake();
        setLoading(false);
        return;
      }

      if (data.session) {
        setAuthSuccess(true);
        // Small pause to allow driving truck animation to complete
        await new Promise((r) => setTimeout(r, 600));

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
      triggerShake();
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      setError('Supabase is not configured in .env.local');
      triggerShake();
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
      if (oauthError) {
        setError(oauthError.message);
        triggerShake();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth sign-in failed';
      setError(msg);
      triggerShake();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isConfigured) {
      setError('Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
      triggerShake();
      setLoading(false);
      return;
    }

    try {
      const targetEmail = resetEmail.trim() || email.trim();
      if (!targetEmail) {
        setError('Please enter your account email address.');
        triggerShake();
        setLoading(false);
        return;
      }

      const resetRedirectUrl = `${getSiteUrl()}/login?message=${encodeURIComponent('Password reset email verified. Please sign in with your credentials.')}`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: resetRedirectUrl
      });

      if (resetError) {
        setError(resetError.message);
        triggerShake();
      } else {
        setMessage(`Password reset instructions have been sent to ${targetEmail}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request password reset';
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // Tagline typewriter effect words
  const taglineWords = [
    'The',
    'mission',
    'control',
    'system',
    'for',
    "India's",
    'night',
    'highways.'
  ];

  return (
    <div className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-canvas text-text-primary selection:bg-brand-orange selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[600px] h-[300px] bg-brand-orange/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Main Centered Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-16 py-12 w-full">
        <div className="mx-auto grid w-full max-w-[1300px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-16">
          
          {/* Left Hero Section: Convoy Animation + Typewriter Tagline */}
          <motion.div
            initial={safe({ opacity: 0, x: -24 })}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-brand-orange/40 bg-surface shadow-glow-orange/20 overflow-hidden">
                <img
                  src="/logo-dark.png"
                  alt="TruckSaathi Logo"
                  className="w-7 h-7 object-contain relative z-10 filter brightness-125"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                  TRUCK<span className="text-brand-orange">SAATHI</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
                  Logistics Mission Control OS
                </span>
              </div>
            </div>

            {/* Highway Convoy Animation */}
            <HighwayConvoy />

            {/* Headline with Typewriter Tagline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-tight tracking-tight text-text-primary">
                Keep every truck moving. <br />
                <span className="text-brand-orange">One intelligent control center.</span>
              </h1>
              
              {/* Typewriter animated words */}
              <p className="text-sm sm:text-base font-mono text-text-secondary h-6 flex items-center gap-1.5 pt-1">
                {taglineWords.map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={safe({ opacity: 0, y: 5 })}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: 0.4 + idx * 0.1,
                      ease: 'easeOut'
                    }}
                    className={word === "India's" || word === 'night' ? 'text-brand-orange font-bold' : ''}
                  >
                    {word}
                  </motion.span>
                ))}
              </p>
            </div>

            {/* Value Highlights Chips */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-5 max-w-lg">
              <div className="bg-surface/50 border border-white/[0.04] p-3 rounded-xl">
                <div className="font-mono text-xl sm:text-2xl font-black text-text-primary">99.8%</div>
                <div className="text-[11px] font-medium text-text-muted mt-0.5">GPS Uptime</div>
              </div>
              <div className="bg-surface/50 border border-white/[0.04] p-3 rounded-xl">
                <div className="font-mono text-xl sm:text-2xl font-black text-cyan-400">&lt; 3s</div>
                <div className="text-[11px] font-medium text-text-muted mt-0.5">Telemetry Rate</div>
              </div>
              <div className="bg-surface/50 border border-white/[0.04] p-3 rounded-xl">
                <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400">100%</div>
                <div className="text-[11px] font-medium text-text-muted mt-0.5">E-Way Audit</div>
              </div>
            </div>
          </motion.div>

          {/* Right Auth Card Section */}
          <motion.div
            initial={safe({ opacity: 0, scale: 0.96 })}
            animate={{
              opacity: 1,
              scale: 1,
              x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0
            }}
            transition={{
              duration: shake ? 0.5 : 0.4,
              ease: 'easeOut'
            }}
            className="flex w-full justify-center"
          >
            <div className="w-full max-w-[460px] space-y-5 rounded-2xl border border-white/[0.12] bg-surface/90 backdrop-blur-xl p-7 sm:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Inner ambient card glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header */}
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  Welcome to Mission Control
                </h2>
                <p className="text-xs text-text-secondary">
                  Sign in with your enterprise credentials
                </p>
              </div>

              {/* Google Social SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-surface-muted px-4 text-xs font-bold text-text-primary transition-all hover:bg-surface hover:border-white/20 active:scale-[0.99] shadow-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-brand-orange">
                  G
                </span>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="w-full border-t border-white/[0.08]" />
                <span className="absolute bg-surface px-3 font-mono text-[11px] text-text-muted">
                  OR ENTERPRISE CREDENTIALS
                </span>
              </div>

              {/* Error & Feedback Alerts */}
              {error && (
                <motion.div
                  initial={safe({ opacity: 0, y: -6 })}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug text-xs">{error}</span>
                </motion.div>
              )}

              {message && (
                <motion.div
                  initial={safe({ opacity: 0, y: -6 })}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug text-xs">{message}</span>
                </motion.div>
              )}

              {/* Form Content */}
              {view === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 text-sm">
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                      Corporate Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="dispatcher@company.com"
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-canvas/70 px-3.5 pl-10 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                        Security Key / Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setView('forgot');
                          setError(null);
                          setMessage(null);
                        }}
                        className="cursor-pointer text-xs font-medium text-brand-orange hover:underline"
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
                        placeholder="••••••••••••"
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-canvas/70 px-3.5 pl-10 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Morphing Animated Submit Button */}
                  <div className="relative pt-1 overflow-hidden">
                    <button
                      type="submit"
                      disabled={loading || authSuccess}
                      className="relative h-12 w-full cursor-pointer rounded-xl bg-brand-orange text-xs font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-90 shadow-glow-orange/30 overflow-hidden flex items-center justify-center gap-2"
                    >
                      {loading || authSuccess ? (
                        <div className="flex items-center justify-center w-full relative">
                          {/* Mini Truck Driving Across Button */}
                          <motion.div
                            initial={{ x: -180 }}
                            animate={{ x: 200 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.2,
                              ease: 'easeInOut'
                            }}
                            className="flex items-center gap-1 text-white"
                          >
                            <Truck className="w-5 h-5 text-white" />
                            <span className="font-mono text-[10px] tracking-wider uppercase">
                              {authSuccess ? 'LAUNCHING...' : 'DISPATCHING...'}
                            </span>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Enter Mission Control</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 text-sm">
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                      Corporate Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        required
                        value={resetEmail || email}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder="dispatcher@company.com"
                        className="h-11 w-full rounded-xl border border-white/[0.1] bg-canvas/70 px-3.5 pl-10 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-orange text-xs font-bold text-white transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60 shadow-glow-orange/30"
                  >
                    <span>Send Reset Instructions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setError(null);
                      setMessage(null);
                    }}
                    className="block w-full cursor-pointer pt-1 text-center text-xs font-medium text-text-secondary hover:text-white hover:underline"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}

              {/* Bottom Card Helper */}
              <div className="pt-1 text-center font-mono text-[11px] text-text-muted">
                <span>Direct Supabase Session Authentication</span>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Page Bottom Slim Footer */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center justify-between border-t border-white/[0.08] px-8 py-4 text-xs text-text-muted">
        <div>© 2026 TruckSaathi Logistics Technologies. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-orange" />
          <span>Built for Commercial Freight & Indian Night Highways</span>
        </div>
      </footer>
    </div>
  );
}
