/**
 * Authentication & Site URL helper for TruckSaathi
 * Resolves appropriate production vs local development URLs dynamically
 * without leaking localhost into production flows.
 */

export function getSiteUrl(): string {
  // 1. Client-side: use active browser origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // 2. Explicit public site URL from environment (e.g. https://truck-saathi.vercel.app)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL.trim();
    if (url) {
      return url.replace(/\/+$/, '');
    }
  }

  // 3. Vercel deployment URL fallback
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL.trim();
    if (vercelUrl) {
      const formatted = vercelUrl.startsWith('http://') || vercelUrl.startsWith('https://')
        ? vercelUrl
        : `https://${vercelUrl}`;
      return formatted.replace(/\/+$/, '');
    }
  }

  // 4. Default fallback for local dev / server SSR
  return 'http://localhost:3000';
}

/**
 * Returns the fully qualified URL for the OAuth callback route
 */
export function getAuthCallbackUrl(nextPath?: string | null): string {
  const baseUrl = getSiteUrl();
  const callbackUrl = new URL('/auth/callback', baseUrl);

  if (nextPath) {
    const sanitized = sanitizeRedirectPath(nextPath);
    if (sanitized && sanitized !== '/dashboard') {
      callbackUrl.searchParams.set('next', sanitized);
    }
  }

  return callbackUrl.toString();
}

/**
 * Sanitizes redirect paths to prevent open redirect vulnerabilities.
 * Only safe relative paths starting with a single '/' are permitted.
 */
export function sanitizeRedirectPath(path: string | null | undefined, fallback: string = '/dashboard'): string {
  if (!path || typeof path !== 'string') {
    return fallback;
  }

  const trimmed = path.trim();

  // Disallow external URLs (e.g., //evil.com, https://evil.com, /\evil.com, etc.)
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('\\')
  ) {
    return fallback;
  }

  return trimmed;
}
