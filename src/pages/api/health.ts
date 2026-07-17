import type { APIRoute } from 'astro';

import type { D1Database } from '@/lib/db';
import { isApplicationReady } from '@/lib/readiness';

export const prerender = false;

function readinessResponse(ready: boolean): Response {
  return new Response(JSON.stringify({ status: ready ? 'ready' : 'not-ready' }), {
    status: ready ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime?.env as Record<string, unknown> | undefined;
  const db = env?.DB as D1Database | undefined;

  if (!db) {
    return readinessResponse(false);
  }

  try {
    return readinessResponse(await isApplicationReady(db));
  } catch (error) {
    console.error('[health/readiness]', error);
    return readinessResponse(false);
  }
};
