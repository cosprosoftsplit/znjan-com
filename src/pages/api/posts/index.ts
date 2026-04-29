/**
 * GET /api/posts — List approved posts (with filters)
 * POST /api/posts — Create a new post (requires auth)
 */
import type { APIRoute } from 'astro';
import { getDB, generateId, now } from '@/lib/db';
import { awardPoints, checkBadges } from '@/lib/gamification';
import { listCommunityPosts, normalizeCommunityListFilters } from '@/lib/community-api';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const filters = normalizeCommunityListFilters({
      type: url.searchParams.get('type'),
      category: url.searchParams.get('category'),
      page: parseInt(url.searchParams.get('page') || '1', 10),
      limit: parseInt(url.searchParams.get('limit') || '20', 10),
    });
    const result = await listCommunityPosts(db, filters);

    return new Response(
      JSON.stringify({
        posts: result.posts.map((post) => ({
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
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[posts/list]', msg);
    return new Response(JSON.stringify({ error: 'Internal server error', detail: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
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

    // Validation
    const { title, body: postBody, type, category, location, lat, lng, event_date, event_time, max_participants, lang } = body;

    if (!title || title.length < 3 || title.length > 200) {
      return new Response(JSON.stringify({ error: 'Title must be 3-200 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!postBody || postBody.length < 10 || postBody.length > 5000) {
      return new Response(JSON.stringify({ error: 'Description must be 10-5000 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!['meetup', 'event-idea', 'partner-search', 'discussion'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid post type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!['sports', 'social', 'culture', 'food-drink', 'other'].includes(category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit: max 10 posts/user/day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const dailyCount = await db
      .prepare('SELECT COUNT(*) as cnt FROM posts WHERE user_id = ? AND created_at > ?')
      .bind(user.id, oneDayAgo)
      .first<{ cnt: number }>();

    if (dailyCount && dailyCount.cnt >= 10) {
      return new Response(JSON.stringify({ error: 'Daily post limit reached (10/day)' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = generateId();
    const timestamp = now();

    await db
      .prepare(
        `INSERT INTO posts (id, user_id, type, category, title, body, lang, location, lat, lng, event_date, event_time, max_participants, status, views, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      )
      .bind(
        id, user.id, type, category, title, postBody,
        lang || 'en',
        location || null, lat || null, lng || null,
        event_date || null, event_time || null,
        max_participants || null,
        timestamp, timestamp,
      )
      .run();

    // Award points for creating a post
    await awardPoints(db, user.id, 'create-post', id);

    // Check if this is the first post ever
    const totalPosts = await db
      .prepare('SELECT COUNT(*) as cnt FROM posts WHERE user_id = ?')
      .bind(user.id)
      .first<{ cnt: number }>();
    if (totalPosts && totalPosts.cnt === 1) {
      await awardPoints(db, user.id, 'first-post', id);
    }

    await checkBadges(db, user.id);

    return new Response(JSON.stringify({ id, status: 'pending' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[posts/create]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
