import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  getCollisionReportDateOptions,
  SportsReservationError,
  createSportsBlackout,
  getReservationDateOptions,
  getTimeSlots,
  listActiveSportsBlackouts,
  listSportsCollisionReports,
  listSportsResources,
} from '@/lib/sports-reservations';

export const prerender = false;

function ensureAdmin(user: App.Locals['user']) {
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}

export const GET: APIRoute = async ({ locals }) => {
  const denied = ensureAdmin(locals.user);
  if (denied) return denied;

  try {
    const db = getDB(locals.runtime);
    const [resources, blackouts, collisionReports] = await Promise.all([
      listSportsResources(db),
      listActiveSportsBlackouts(db),
      listSportsCollisionReports(db),
    ]);

    return new Response(
      JSON.stringify({
        resources,
        blackouts,
        collisionReports,
        dateOptions: getReservationDateOptions(),
        collisionDateOptions: getCollisionReportDateOptions(),
        timeSlots: getTimeSlots(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[admin/reservations/get]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const denied = ensureAdmin(locals.user);
  if (denied) return denied;

  try {
    const db = getDB(locals.runtime);
    const body = await request.json();
    const resourceSlug = typeof body?.resourceSlug === 'string' ? body.resourceSlug : '';
    const blackoutDate = typeof body?.blackoutDate === 'string' ? body.blackoutDate : '';
    const slotStart = typeof body?.slotStart === 'string' ? body.slotStart : '';
    const slotEnd = typeof body?.slotEnd === 'string' ? body.slotEnd : '';
    const reason = typeof body?.reason === 'string' ? body.reason : '';

    const blackout = await createSportsBlackout(db, {
      resourceSlug,
      blackoutDate,
      slotStart,
      slotEnd,
      reason,
    });

    return new Response(JSON.stringify({ success: true, id: blackout.id }), {
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

    console.error('[admin/reservations/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
