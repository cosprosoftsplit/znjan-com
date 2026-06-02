import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  PUBLIC_SPORTS_ACCESS_MESSAGE,
  RESERVATION_POLICY,
  getReservationDateOptions,
  getSportsScheduleForDate,
  resolveReservationDate,
} from '@/lib/sports-reservations';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const reservationDate = resolveReservationDate(url.searchParams.get('date'));
    const resources = await getSportsScheduleForDate(db, reservationDate, locals.user?.id);

    return new Response(
      JSON.stringify({
        reservationsEnabled: false,
        publicAccessMessage: PUBLIC_SPORTS_ACCESS_MESSAGE,
        reservationDate,
        resources,
        upcomingReservations: [],
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

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: PUBLIC_SPORTS_ACCESS_MESSAGE,
      code: 'reservations-disabled',
    }),
    {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
