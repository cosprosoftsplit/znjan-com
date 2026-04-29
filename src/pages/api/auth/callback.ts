/**
 * GET /api/auth/callback — Google OAuth callback
 * Exchanges authorization code for tokens, creates/links user, sets session cookie.
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { clearOauthStateCookie, createSession, createSessionCookie, findOrCreateGoogleUser } from '@/lib/auth';
import { normalizeLanguage } from '@/lib/i18n';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // Parse state to get lang (default to 'en' on any failure)
  let lang = normalizeLanguage(undefined);
  let nonce = '';
  try {
    const decoded = JSON.parse(atob(stateParam || '')) as { lang?: string; nonce?: string };
    lang = normalizeLanguage(decoded.lang);
    nonce = typeof decoded.nonce === 'string' ? decoded.nonce : '';
  } catch {
    // state parsing failed — will be caught by validation below
  }

  const loginUrl = `/${lang}/community/login/`;

  // Google returned an error (user denied consent, etc.)
  if (errorParam) {
    return Response.redirect(new URL(`${loginUrl}?error=auth-cancelled`, url.origin).toString(), 302);
  }

  if (!code || !stateParam) {
    return Response.redirect(new URL(`${loginUrl}?error=missing-code`, url.origin).toString(), 302);
  }

  // Validate state nonce against cookie (CSRF protection)
  const cookieHeader = request.headers.get('cookie') || '';
  const stateCookieMatch = cookieHeader.match(/oauth_state=([^;]+)/);
  const cookieNonce = stateCookieMatch?.[1];

  if (!cookieNonce || cookieNonce !== nonce) {
    return Response.redirect(new URL(`${loginUrl}?error=invalid-state`, url.origin).toString(), 302);
  }

  try {
    const env = locals.runtime.env as Record<string, string>;
    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('[auth/callback] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      return Response.redirect(new URL(`${loginUrl}?error=auth-failed`, url.origin).toString(), 302);
    }

    const redirectUri = `${url.origin}/api/auth/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error('[auth/callback] Token exchange failed:', tokenRes.status, body);
      return Response.redirect(new URL(`${loginUrl}?error=auth-failed`, url.origin).toString(), 302);
    }

    const tokenData = await tokenRes.json() as { id_token?: string };

    if (!tokenData.id_token) {
      console.error('[auth/callback] No id_token in response');
      return Response.redirect(new URL(`${loginUrl}?error=auth-failed`, url.origin).toString(), 302);
    }

    // Decode ID token (JWT) — no crypto verification needed since we just received it from Google over HTTPS
    const [, payloadB64] = tokenData.id_token.split('.');
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };

    if (!payload.email) {
      console.error('[auth/callback] No email in ID token');
      return Response.redirect(new URL(`${loginUrl}?error=auth-failed`, url.origin).toString(), 302);
    }

    // Find or create user
    const db = getDB(locals.runtime);
    const user = await findOrCreateGoogleUser(
      db,
      payload.sub,
      payload.email,
      payload.name || payload.email.split('@')[0],
      payload.picture || null,
    );

    // Create session
    const sessionId = await createSession(db, user.id);
    const sessionCookie = createSessionCookie(sessionId, url);

    // Clear oauth_state cookie + set session cookie
    const clearStateCookie = clearOauthStateCookie(url);

    return new Response(null, {
      status: 302,
      headers: [
        ['Location', `/${lang}/community/`],
        ['Set-Cookie', sessionCookie],
        ['Set-Cookie', clearStateCookie],
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth/callback]', msg);
    return Response.redirect(new URL(`${loginUrl}?error=auth-failed`, url.origin).toString(), 302);
  }
};
