/**
 * GET /api/leaderboard — Top 20 users by points
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { getLeaderboard } from '@/lib/gamification';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDB(locals.runtime);
    const leaders = await getLeaderboard(db, 20);

    return new Response(JSON.stringify({ leaders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[leaderboard]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
