/**
 * GET /api/auth/google — Initiate Google OAuth flow
 * Generates state, sets oauth_state cookie, redirects to Google consent screen.
 */
import type { APIRoute } from 'astro';
import { createOauthStateCookie } from '@/lib/auth';
import { generateToken } from '@/lib/db';
import { normalizeLanguage } from '@/lib/i18n';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const lang = normalizeLanguage(url.searchParams.get('lang'));

  const env = locals.runtime.env as Record<string, string>;
  const clientId = env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return new Response('Google OAuth not configured', { status: 500 });
  }

  // Generate a nonce for CSRF protection
  const nonce = generateToken();

  // Encode lang + nonce into the state parameter
  const statePayload = JSON.stringify({ nonce, lang });
  const state = btoa(statePayload);

  // Build the redirect URI (callback endpoint on our domain)
  const redirectUri = `${url.origin}/api/auth/callback`;

  // Set the oauth_state cookie with the nonce (10-minute expiry)
  const stateCookie = createOauthStateCookie(nonce, url);

  // Build Google OAuth URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return new Response(null, {
    status: 302,
    headers: {
      Location: googleAuthUrl.toString(),
      'Set-Cookie': stateCookie,
    },
  });
};
