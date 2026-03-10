/**
 * POST /api/auth/login — Create magic link and return verify URL directly
 * (No external email service needed — instant login)
 * To add email verification later, send verifyUrl via any email API instead of returning it.
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { createMagicLink } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, url }) => {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase()?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB(locals.runtime);
    const result = await createMagicLink(db, email);

    if ('error' in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lang = body.lang || 'en';
    const verifyUrl = `${url.origin}/api/auth/verify?token=${result.token}&lang=${lang}`;

    // Return the verify URL directly — client auto-redirects
    return new Response(JSON.stringify({ success: true, verifyUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth/login]', msg);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
