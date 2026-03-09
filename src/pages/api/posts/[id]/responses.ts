/**
 * POST /api/posts/:id/responses — Add a comment
 */
import type { APIRoute } from 'astro';
import { getDB, generateId, now } from '@/lib/db';
import { awardPoints, checkBadges } from '@/lib/gamification';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
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
    const comment = body.body?.trim();

    if (!comment || comment.length < 2 || comment.length > 2000) {
      return new Response(JSON.stringify({ error: 'Comment must be 2-2000 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify post exists and is approved
    const post = await db
      .prepare("SELECT id, user_id FROM posts WHERE id = ? AND status = 'approved'")
      .bind(params.id)
      .first<{ id: string; user_id: string }>();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = generateId();
    await db
      .prepare("INSERT INTO responses (id, post_id, user_id, type, body, created_at) VALUES (?, ?, ?, 'comment', ?, ?)")
      .bind(id, params.id, user.id, comment, now())
      .run();

    // Award points
    await awardPoints(db, user.id, 'leave-comment', id);
    await checkBadges(db, user.id);

    return new Response(
      JSON.stringify({
        id,
        body: comment,
        author_name: user.display_name,
        author_level: user.level,
        created_at: now(),
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('[posts/responses]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
