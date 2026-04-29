import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import { createPilotSupportSignal } from '@/lib/pilot-support';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDB(locals.runtime);
    const body = await request.json();

    const signalType = typeof body?.signalType === 'string' ? body.signalType : '';
    const name = typeof body?.name === 'string' ? body.name : '';
    const contact = typeof body?.contact === 'string' ? body.contact : '';
    const availability = typeof body?.availability === 'string' ? body.availability : '';
    const notes = typeof body?.notes === 'string' ? body.notes : '';

    const signal = await createPilotSupportSignal(db, {
      signalType: signalType as
        | 'local-intro'
        | 'on-site-help'
        | 'venue-connection'
        | 'pilot-feedback',
      name,
      contact,
      availability,
      notes,
    });

    return new Response(JSON.stringify({ success: true, id: signal.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status =
      message === 'Internal server error' ? 500 : 400;

    if (status === 500) {
      console.error('[pilot-support-signals/post]', error);
    }

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
