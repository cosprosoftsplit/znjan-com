/**
 * PUT /api/admin/posts/:id — Approve or reject a post (admin only)
 */
import type { APIRoute } from 'astro';
import { getDB, now } from '@/lib/db';
import { awardPoints, checkBadges } from '@/lib/gamification';
import { sendNotification, buildNotificationEmail } from '@/lib/email';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getDB(locals.runtime);
    const body = await request.json();
    const { action, rejection_reason } = body;

    if (!['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const post = await db
      .prepare('SELECT p.*, u.email as author_email FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?')
      .bind(params.id)
      .first<{
        id: string;
        user_id: string;
        title: string;
        status: string;
        author_email: string;
      }>();

    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await db
      .prepare('UPDATE posts SET status = ?, rejection_reason = ?, updated_at = ? WHERE id = ?')
      .bind(newStatus, rejection_reason || null, now(), params.id)
      .run();

    // Award bonus points on approval
    if (action === 'approve') {
      await awardPoints(db, post.user_id, 'post-approved', params.id);
      await checkBadges(db, post.user_id);
    }

    // Email notification to author (logged only — no email provider configured yet)
    const heading = action === 'approve' ? 'Your post was approved!' : 'Your post was not approved';
    const emailBody =
      action === 'approve'
        ? `Your post "${post.title}" is now live on the Žnjan Community board.`
        : `Your post "${post.title}" was not approved.${rejection_reason ? ` Reason: ${rejection_reason}` : ''}`;

    await sendNotification({
      to: post.author_email,
      subject: heading,
      html: buildNotificationEmail(heading, emailBody),
    });

    return new Response(JSON.stringify({ success: true, status: newStatus }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin/posts/update]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
