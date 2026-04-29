/**
 * GET /api/posts/:id — Get single post
 * PUT /api/posts/:id — Update own post
 * DELETE /api/posts/:id — Delete own post
 */
import type { APIRoute } from 'astro';
import { getDB, now } from '@/lib/db';
import { getCommunityPostDetail } from '@/lib/community-api';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const user = locals.user;
    const post = await getCommunityPostDetail(
      db,
      params.id ?? '',
      user ? { id: user.id, role: user.role } : null,
    );

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        post: {
          id: post.id,
          user_id: post.userId,
          type: post.type,
          category: post.category,
          title: post.title,
          body: post.body,
          lang: post.lang,
          location: post.location,
          lat: post.lat,
          lng: post.lng,
          event_date: post.eventDate,
          event_time: post.eventTime,
          max_participants: post.maxParticipants,
          status: post.status,
          views: post.views,
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          author_id: post.author.id,
          author_name: post.author.displayName,
          author_avatar: post.author.avatarUrl,
          author_level: post.author.level,
          join_count: post.joinCount,
          comment_count: post.commentCount,
          comments: post.comments.map((comment) => ({
            id: comment.id,
            user_id: comment.userId,
            body: comment.body,
            created_at: comment.createdAt,
            author_id: comment.author.id,
            author_name: comment.author.displayName,
            author_avatar: comment.author.avatarUrl,
            author_level: comment.author.level,
          })),
          joiners: post.joiners.map((joiner) => ({
            user_id: joiner.userId,
            display_name: joiner.displayName,
            avatar_url: joiner.avatarUrl,
          })),
          has_joined: post.hasJoined,
          viewer_can_edit: post.viewerCanEdit,
          viewer_can_delete: post.viewerCanDelete,
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
