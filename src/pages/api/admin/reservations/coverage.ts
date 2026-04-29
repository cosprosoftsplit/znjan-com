import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  SportsReservationError,
  createSportsPilotCoverageBlock,
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
    const coverageDate = typeof body?.coverageDate === 'string' ? body.coverageDate : '';
    const slotStart = typeof body?.slotStart === 'string' ? body.slotStart : '';
    const slotEnd = typeof body?.slotEnd === 'string' ? body.slotEnd : '';
    const role = typeof body?.role === 'string' ? body.role : '';
    const personName = typeof body?.personName === 'string' ? body.personName : '';
    const focusArea = typeof body?.focusArea === 'string' ? body.focusArea : '';
    const notes = typeof body?.notes === 'string' ? body.notes : '';

    const coverage = await createSportsPilotCoverageBlock(db, {
      scheduledByUserId: user.id,
      coverageDate,
      slotStart,
      slotEnd,
      role: role as 'founder' | 'ambassador' | 'helper',
      personName,
      focusArea,
      notes,
    });

    return new Response(JSON.stringify({ success: true, id: coverage.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof SportsReservationError) {
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('[admin/reservations/coverage/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
