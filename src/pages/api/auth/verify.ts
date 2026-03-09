/**
 * GET /api/auth/verify — Verify magic link token → create session → redirect
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { verifyMagicLink, createSessionCookie } from '@/lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const lang = url.searchParams.get('lang') || 'en';

  if (!token) {
    return redirect(`/${lang}/community/login/?error=missing-token`);
  }

  try {
    const db = getDB(locals.runtime);
    const result = await verifyMagicLink(db, token);

    if ('error' in result) {
      return redirect(`/${lang}/community/login/?error=invalid-token`);
    }

    const cookie = createSessionCookie(result.sessionId);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/${lang}/community/`,
        'Set-Cookie': cookie,
      },
    });
  } catch (err) {
    console.error('[auth/verify]', err);
    return redirect(`/${lang}/community/login/?error=server-error`);
  }
};
