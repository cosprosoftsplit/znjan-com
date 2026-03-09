/**
 * POST /api/posts/:id/leave — Leave a meetup
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);

    await db
      .prepare("DELETE FROM responses WHERE post_id = ? AND user_id = ? AND type = 'join'")
      .bind(params.id, user.id)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[posts/leave]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
