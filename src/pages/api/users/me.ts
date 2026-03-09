/**
 * PUT /api/users/me — Update own profile
 */
import type { APIRoute } from 'astro';
import { getDB, now } from '@/lib/db';
import { awardPoints } from '@/lib/gamification';

export const prerender = false;

export const PUT: APIRoute = async ({ request, locals }) => {
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
    const { display_name, bio } = body;

    if (!display_name || display_name.length < 2 || display_name.length > 50) {
      return new Response(JSON.stringify({ error: 'Display name must be 2-50 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (bio && bio.length > 500) {
      return new Response(JSON.stringify({ error: 'Bio must be under 500 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const wasMissingProfile = !user.bio && !user.display_name?.includes('@');

    await db
      .prepare('UPDATE users SET display_name = ?, bio = ?, updated_at = ? WHERE id = ?')
      .bind(display_name, bio || null, now(), user.id)
      .run();

    // Award profile completion bonus if applicable
    if (wasMissingProfile && bio) {
      await awardPoints(db, user.id, 'complete-profile');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[users/me]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
