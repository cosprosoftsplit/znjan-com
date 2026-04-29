import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  SportsReservationError,
  deactivateSportsPilotCoverageBlock,
} from '@/lib/sports-reservations';

export const prerender = false;

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const coverageId = params.id;
    if (!coverageId) {
      return new Response(JSON.stringify({ error: 'Coverage block id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDB(locals.runtime);
    await deactivateSportsPilotCoverageBlock(db, coverageId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof SportsReservationError) {
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('[admin/reservations/coverage/delete]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
