/**
 * GET /api/admin/posts — List pending posts (admin only)
 */
import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);
    const pending = await db
      .prepare(
        `SELECT p.*, u.display_name as author_name, u.email as author_email
         FROM posts p JOIN users u ON p.user_id = u.id
         WHERE p.status = 'pending'
         ORDER BY p.created_at ASC`,
      )
      .all();

    const stats = {
      totalUsers: (await db.prepare('SELECT COUNT(*) as cnt FROM users').first<{ cnt: number }>())?.cnt ?? 0,
      totalPosts: (await db.prepare('SELECT COUNT(*) as cnt FROM posts').first<{ cnt: number }>())?.cnt ?? 0,
      pendingPosts: (await db.prepare("SELECT COUNT(*) as cnt FROM posts WHERE status = 'pending'").first<{ cnt: number }>())?.cnt ?? 0,
    };

    return new Response(JSON.stringify({ posts: pending.results, stats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/posts]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
