/**
 * GET /api/users/:id — Get public user profile
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const user = await db
      .prepare('SELECT id, display_name, avatar_url, bio, points, level, created_at FROM users WHERE id = ?')
      .bind(params.id)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get stats
    const postCount = await db
      .prepare("SELECT COUNT(*) as cnt FROM posts WHERE user_id = ? AND status = 'approved'")
      .bind(params.id)
      .first<{ cnt: number }>();
    const meetupCount = await db
      .prepare("SELECT COUNT(*) as cnt FROM responses WHERE user_id = ? AND type = 'join'")
      .bind(params.id)
      .first<{ cnt: number }>();
    const commentCount = await db
      .prepare("SELECT COUNT(*) as cnt FROM responses WHERE user_id = ? AND type = 'comment'")
      .bind(params.id)
      .first<{ cnt: number }>();
    const badges = await db
      .prepare('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?')
      .bind(params.id)
      .all();
    const recentPosts = await db
      .prepare("SELECT id, title, type, category, created_at FROM posts WHERE user_id = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 5")
      .bind(params.id)
      .all();

    return new Response(
      JSON.stringify({
        user,
        stats: {
          posts: postCount?.cnt ?? 0,
          meetups: meetupCount?.cnt ?? 0,
          comments: commentCount?.cnt ?? 0,
        },
        badges: badges.results,
        recentPosts: recentPosts.results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('[users/get]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
