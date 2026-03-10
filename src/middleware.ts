/**
 * Astro middleware — session auth + CSRF protection for community routes
 */

import { defineMiddleware } from 'astro:middleware';
import { getUserFromSession, getSessionIdFromCookie } from '@/lib/auth';
import { getDB } from '@/lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  // Only run auth for community and API routes
  const isCommunity = url.pathname.includes('/community/');
  const isApi = url.pathname.startsWith('/api/');

  if (!isCommunity && !isApi) {
    return next();
  }

  // Extract session
  const cookieHeader = request.headers.get('cookie');
  const sessionId = getSessionIdFromCookie(cookieHeader);

  if (sessionId) {
    try {
      const db = getDB(context.locals.runtime);
      const user = await getUserFromSession(db, sessionId);
      context.locals.user = user;
    } catch (err) {
      // DB not available (e.g., during build)
      console.error('[middleware] DB access failed:', err instanceof Error ? err.message : err);
      context.locals.user = null;
    }
  } else {
    context.locals.user = null;
  }

  // CSRF protection for mutations
  if (isApi && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return new Response(JSON.stringify({ error: 'CSRF validation failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return next();
});
