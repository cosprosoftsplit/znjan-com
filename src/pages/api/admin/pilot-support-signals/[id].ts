import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  archivePilotSupportSignal,
  type PilotSupportSignalStatus,
  updatePilotSupportSignalFollowUpNote,
  updatePilotSupportSignalStatus,
} from '@/lib/pilot-support';

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ error: 'Admin access required' }, 403);
  }

  const signalId = params.id;
  if (!signalId) {
    return json({ error: 'Support signal id is required' }, 400);
  }

  try {
    const body = await request.json();
    const hasStatus = typeof body?.status === 'string';
    const hasFollowUpNote = Object.prototype.hasOwnProperty.call(body ?? {}, 'followUpNote');
    const followUpNote = hasFollowUpNote ? body?.followUpNote : undefined;

    if (!hasStatus && !hasFollowUpNote) {
      return json({ error: 'Status or follow-up note is required' }, 400);
    }

    if (hasFollowUpNote && typeof followUpNote !== 'string') {
      return json({ error: 'Follow-up note must be a string' }, 400);
    }

    const db = getDB(locals.runtime);
    if (hasStatus) {
      await updatePilotSupportSignalStatus(db, signalId, body.status as PilotSupportSignalStatus);
    }
    if (typeof followUpNote === 'string') {
      await updatePilotSupportSignalFollowUpNote(db, signalId, followUpNote);
    }

    return json({ success: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Support signal not found') {
      return json({ error: message }, 404);
    }
    if (message === 'Invalid support signal status') {
      return json({ error: message }, 400);
    }
    if (message === 'Follow-up note must be 500 characters or fewer') {
      return json({ error: message }, 400);
    }

    console.error('[admin/pilot-support-signals/patch]', error);
    return json({ error: 'Internal server error' }, 500);
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ error: 'Admin access required' }, 403);
  }

  const signalId = params.id;
  if (!signalId) {
    return json({ error: 'Support signal id is required' }, 400);
  }

  try {
    const db = getDB(locals.runtime);
    await archivePilotSupportSignal(db, signalId);

    return json({ success: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Support signal not found') {
      return json({ error: message }, 404);
    }

    console.error('[admin/pilot-support-signals/delete]', error);
    return json({ error: 'Internal server error' }, 500);
  }
};
