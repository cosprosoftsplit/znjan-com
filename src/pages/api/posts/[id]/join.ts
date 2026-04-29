/**
 * POST /api/posts/:id/join — Join a meetup
 */
import type { APIRoute } from 'astro';
import { getDB, generateId, now } from '@/lib/db';
import { awardPoints, checkBadges } from '@/lib/gamification';

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
    const post = await db
      .prepare('SELECT id, user_id, type, max_participants, status FROM posts WHERE id = ?')
      .bind(params.id)
      .first<{
        id: string;
        user_id: string;
        type: string;
        max_participants: number | null;
        status: string;
      }>();

    if (!post || post.status !== 'approved' || post.type !== 'meetup') {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseId = generateId();
    const inserted = await db
      .prepare(
        `INSERT INTO responses (id, post_id, user_id, type, created_at)
         SELECT ?, ?, ?, 'join', ?
         WHERE NOT EXISTS (
           SELECT 1 FROM responses WHERE post_id = ? AND user_id = ? AND type = 'join'
         )
         AND (
           ? IS NULL OR (
             SELECT COUNT(*)
             FROM responses
             WHERE post_id = ? AND type = 'join'
           ) < ?
         )`,
      )
      .bind(
        responseId,
        params.id,
        user.id,
        now(),
        params.id,
        user.id,
        post.max_participants,
        params.id,
        post.max_participants,
      )
      .run();

    const changes = Number(
      (inserted.meta as Record<string, unknown> | undefined)?.changes ?? 0,
    );

    if (changes === 0) {
      const existing = await db
        .prepare("SELECT id FROM responses WHERE post_id = ? AND user_id = ? AND type = 'join'")
        .bind(params.id, user.id)
        .first();

      if (existing) {
        return new Response(JSON.stringify({ error: 'Already joined' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'This meetup is full' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Award points
    await awardPoints(db, user.id, 'join-meetup', params.id);

    // Check if organizer gets bonus (3+ joins)
    const totalJoins = await db
      .prepare("SELECT COUNT(*) as cnt FROM responses WHERE post_id = ? AND type = 'join'")
      .bind(params.id)
      .first<{ cnt: number }>();
    if (totalJoins && totalJoins.cnt === 3) {
      await awardPoints(db, post.user_id, 'organize-meetup', params.id);
    }

    await checkBadges(db, user.id);
    if (post.user_id !== user.id) {
      await checkBadges(db, post.user_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[posts/join]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
