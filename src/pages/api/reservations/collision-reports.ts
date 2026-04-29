import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  SportsReservationError,
  createSportsCollisionReport,
} from '@/lib/sports-reservations';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);
    const body = await request.json();
    const reservationId = typeof body?.reservationId === 'string' ? body.reservationId : '';
    const issueType = typeof body?.issueType === 'string' ? body.issueType : '';
    const notes = typeof body?.notes === 'string' ? body.notes : '';

    const report = await createSportsCollisionReport(db, {
      reporterUserId: user.id,
      source: 'reservation-followup',
      issueType: issueType as
        | 'occupied-on-arrival'
        | 'double-booking'
        | 'closure-mismatch'
        | 'session-over-capacity'
        | 'other',
      reservationId,
      notes,
    });

    return new Response(JSON.stringify({ success: true, id: report.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof SportsReservationError) {
      return new Response(
        JSON.stringify({ error: error.message, code: error.code }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.error('[reservations/collision-reports/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
