import type { APIRoute } from 'astro';
import { PUBLIC_SPORTS_ACCESS_MESSAGE } from '@/lib/sports-reservations';

export const prerender = false;

export const DELETE: APIRoute = async () => {
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
