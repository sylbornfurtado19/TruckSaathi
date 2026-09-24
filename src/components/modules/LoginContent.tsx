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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { ensureUserProfile } from '@/lib/services/profileService';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, currentUser, authLoading } = useApp();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!isConfigured) {
      setError(
        'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file to enable live authentication.'
      );
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

          {/* Configuration Hint for Developers */}
          {!isConfigured && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Supabase Auth Not Connected</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Add <code className="font-mono text-amber-200">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono text-amber-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="font-mono text-amber-200">.env.local</code> for live Supabase Auth.
              </p>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium inline-block pt-1 cursor-pointer"
              >
                Continue to Dashboard in Prototype Mode →
              </button>
            </div>
          )}

          {/* Feedback Badges */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{message}</span>
            </div>
          )}

          {view === 'login' ? (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-100">Sign in to Enterprise Portal</h2>
                <p className="text-xs text-slate-400">Enter your credentials to access company fleet telemetry.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.in"
                      className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5 font-mono backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-400 font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-blue-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5 backdrop-blur-md"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3"
                  disabled={loading}
                  icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                >
                  {loading ? 'Authenticating...' : 'Access Command Center'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-100">Reset Password</h2>
                <p className="text-xs text-slate-400">Enter your registered email to receive a password reset token.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail || email}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="name@company.in"
                      className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-slate-100 pl-9 pr-3 py-2.5 font-mono"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3"
                  disabled={loading}
                  icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setError(null);
                    setMessage(null);
                  }}
                  className="w-full text-slate-400 hover:text-slate-200 text-[11px] text-center block cursor-pointer"
                >
                  Back to Sign In
                </button>
              </form>
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
