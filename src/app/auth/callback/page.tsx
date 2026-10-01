'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ensureUserProfile } from '@/lib/services/profileService';
import { sanitizeRedirectPath } from '@/lib/auth/url';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying credentials...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Check for incoming OAuth errors from provider
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error || errorDescription) {
          throw new Error(errorDescription || error || 'Authentication was denied or canceled.');
        }

        // 2. Check for PKCE authorization code
        const code = searchParams.get('code');
        const nextParam = searchParams.get('next');

        if (code) {
          if (isMounted) setStatusMessage('Completing secure exchange...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Failed to exchange code for session:', exchangeError);
            throw new Error(exchangeError.message || 'Failed to complete OAuth authentication.');
          }

          if (data.session?.user) {
            if (isMounted) setStatusMessage('Loading profile...');
            const profile = await ensureUserProfile(data.session.user);

            // Determine destination based on user role
            let targetDestination: string;
            if (profile.role === 'Driver') {
              targetDestination = '/driver-portal';
            } else if (nextParam && nextParam !== '/driver-portal') {
              targetDestination = sanitizeRedirectPath(nextParam, '/dashboard');
            } else {
              targetDestination = '/dashboard';
            }

            if (isMounted) {
              setStatusMessage('Redirecting to platform...');
              router.replace(targetDestination);
            }
            return;
          }
        }

        // 3. Fallback: check if session is already stored or detected in URL (e.g. implicit flow hash)
        if (isMounted) setStatusMessage('Checking existing session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message || 'Unable to retrieve authenticated session.');
        }

        if (sessionData.session?.user) {
          if (isMounted) setStatusMessage('Loading profile...');
          const profile = await ensureUserProfile(sessionData.session.user);

          let targetDestination: string;
          if (profile.role === 'Driver') {
            targetDestination = '/driver-portal';
          } else if (nextParam && nextParam !== '/driver-portal') {
            targetDestination = sanitizeRedirectPath(nextParam, '/dashboard');
          } else {
            targetDestination = '/dashboard';
          }

          if (isMounted) {
            setStatusMessage('Redirecting to platform...');
            router.replace(targetDestination);
          }
          return;
        }

        // If no code and no session found
        throw new Error('No authentication credentials found in the callback request.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication verification failed';
        console.error('Auth callback error:', err);
        if (isMounted) {
          setErrorMessage(msg);
          // Redirect back to login with error details after a brief moment
          setTimeout(() => {
            router.replace(`/login?error=${encodeURIComponent(msg)}`);
          }, 2000);
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-4 text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/60 border border-white/10">
          <img
            src="/logo-dark.png"
            alt="TruckSaathi"
            className="h-8 w-8 object-contain"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">TruckSaathi Authentication</h2>
          <p className="mt-1 text-sm text-text-secondary">AI-powered Smart Fleet Safety & Logistics</p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-300">Authentication Failed</p>
                <p className="text-xs text-red-200/80 mt-1">{errorMessage}</p>
                <p className="text-xs text-text-muted mt-2">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface-muted/60 py-3 px-4">
              <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
              <span className="font-mono text-xs text-text-secondary">{statusMessage}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Secured by Supabase & Google Cloud</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
            <span>Initializing authentication...</span>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
