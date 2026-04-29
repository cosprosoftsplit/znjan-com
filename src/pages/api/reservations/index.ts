import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  RESERVATION_POLICY,
  SportsReservationError,
  createSportsReservation,
  getReservationDateOptions,
  getSportsScheduleForDate,
  listUpcomingSportsReservations,
  resolveReservationDate,
} from '@/lib/sports-reservations';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const reservationDate = resolveReservationDate(url.searchParams.get('date'));

    const [resources, upcomingReservations] = await Promise.all([
      getSportsScheduleForDate(db, reservationDate, locals.user?.id),
      locals.user ? listUpcomingSportsReservations(db, locals.user.id) : Promise.resolve([]),
    ]);

    return new Response(
      JSON.stringify({
        reservationDate,
        resources,
        upcomingReservations,
        dateOptions: getReservationDateOptions(),
        policy: RESERVATION_POLICY,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[reservations/get]', error);
    return new Response(JSON.stringify({ error: 'Reservations unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

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
    const resourceSlug = typeof body?.resourceSlug === 'string' ? body.resourceSlug : '';
    const reservationDate = typeof body?.reservationDate === 'string' ? body.reservationDate : '';
    const slotStart = typeof body?.slotStart === 'string' ? body.slotStart : '';

    const reservation = await createSportsReservation(db, user.id, {
      resourceSlug,
      reservationDate,
      slotStart,
    });

    return new Response(JSON.stringify({ success: true, id: reservation.id }), {
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

    console.error('[reservations/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
