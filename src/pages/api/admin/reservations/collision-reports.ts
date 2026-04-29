import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  SportsReservationError,
  createSportsCollisionReport,
} from '@/lib/sports-reservations';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);
    const body = await request.json();
    const source = typeof body?.source === 'string' ? body.source : '';
    const resourceSlug = typeof body?.resourceSlug === 'string' ? body.resourceSlug : '';
    const collisionDate = typeof body?.collisionDate === 'string' ? body.collisionDate : '';
    const slotStart = typeof body?.slotStart === 'string' ? body.slotStart : '';
    const slotEnd = typeof body?.slotEnd === 'string' ? body.slotEnd : '';
    const issueType = typeof body?.issueType === 'string' ? body.issueType : '';
    const notes = typeof body?.notes === 'string' ? body.notes : '';

    const report = await createSportsCollisionReport(db, {
      reporterUserId: user.id,
      source: source as 'admin-report' | 'ambassador-report',
      issueType: issueType as
        | 'occupied-on-arrival'
        | 'double-booking'
        | 'closure-mismatch'
        | 'session-over-capacity'
        | 'other',
      resourceSlug,
      collisionDate,
      slotStart,
      slotEnd,
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

    console.error('[admin/reservations/collision-reports/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
