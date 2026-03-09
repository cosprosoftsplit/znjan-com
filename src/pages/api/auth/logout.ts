/**
 * POST /api/auth/logout — Clear session
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { deleteSession, getSessionIdFromCookie, clearSessionCookie } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const sessionId = getSessionIdFromCookie(request.headers.get('cookie'));
    if (sessionId) {
      const db = getDB(locals.runtime);
      await deleteSession(db, sessionId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    });
  } catch (err) {
    console.error('[auth/logout]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
