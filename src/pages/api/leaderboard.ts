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
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[leaderboard]', msg);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
