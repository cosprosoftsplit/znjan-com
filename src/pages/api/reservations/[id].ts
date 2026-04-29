import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { SportsReservationError, cancelSportsReservation } from '@/lib/sports-reservations';

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);
    await cancelSportsReservation(db, user.id, params.id ?? '');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
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

    console.error('[reservations/delete]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
