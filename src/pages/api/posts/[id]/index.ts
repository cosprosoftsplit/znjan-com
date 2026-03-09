/**
 * GET /api/posts/:id — Get single post
 * PUT /api/posts/:id — Update own post
 * DELETE /api/posts/:id — Delete own post
 */
import type { APIRoute } from 'astro';
import { getDB, now } from '@/lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const post = await db
      .prepare(
        `SELECT p.*, u.display_name as author_name, u.level as author_level, u.avatar_url as author_avatar
         FROM posts p JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`,
      )
      .bind(params.id)
      .first();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Increment views
    await db
      .prepare('UPDATE posts SET views = views + 1 WHERE id = ?')
      .bind(params.id)
      .run();

    // Get join count and comment count
    const joins = await db
      .prepare("SELECT COUNT(*) as cnt FROM responses WHERE post_id = ? AND type = 'join'")
      .bind(params.id)
      .first<{ cnt: number }>();
    const comments = await db
      .prepare("SELECT r.*, u.display_name as author_name, u.level as author_level FROM responses r JOIN users u ON r.user_id = u.id WHERE r.post_id = ? AND r.type = 'comment' ORDER BY r.created_at ASC")
      .bind(params.id)
      .all();
    const joiners = await db
      .prepare("SELECT r.user_id, u.display_name FROM responses r JOIN users u ON r.user_id = u.id WHERE r.post_id = ? AND r.type = 'join'")
      .bind(params.id)
      .all();

    // Check if current user has joined
    const user = locals.user;
    let hasJoined = false;
    if (user) {
      const userJoin = await db
        .prepare("SELECT id FROM responses WHERE post_id = ? AND user_id = ? AND type = 'join'")
        .bind(params.id, user.id)
        .first();
      hasJoined = !!userJoin;
    }

    return new Response(
      JSON.stringify({
        post: {
          ...(post as Record<string, unknown>),
          join_count: joins?.cnt ?? 0,
          comment_count: comments.results.length,
          comments: comments.results,
          joiners: joiners.results,
          has_joined: hasJoined,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('[posts/get]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);
    const existing = await db
      .prepare('SELECT user_id, status FROM posts WHERE id = ?')
      .bind(params.id)
      .first<{ user_id: string; status: string }>();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (existing.user_id !== user.id && user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { title, body: postBody, category, location, event_date, event_time, max_participants } = body;

    await db
      .prepare(
        `UPDATE posts SET title = ?, body = ?, category = ?, location = ?, event_date = ?, event_time = ?, max_participants = ?, status = 'pending', updated_at = ? WHERE id = ?`,
      )
      .bind(
        title, postBody, category,
        location || null,
        event_date || null, event_time || null,
        max_participants || null,
        now(), params.id,
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[posts/update]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

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
    const existing = await db
      .prepare('SELECT user_id FROM posts WHERE id = ?')
      .bind(params.id)
      .first<{ user_id: string }>();

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (existing.user_id !== user.id && user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete responses first, then post
    await db.prepare('DELETE FROM responses WHERE post_id = ?').bind(params.id).run();
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(params.id).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[posts/delete]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
