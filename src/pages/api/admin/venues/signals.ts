import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  VenueValidationError,
  createVenueValidationSignal,
} from '@/lib/venue-validation';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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
    const venueKey = typeof body?.venueKey === 'string' ? body.venueKey : '';
    const venueLabel = typeof body?.venueLabel === 'string' ? body.venueLabel : '';
    const venueType = typeof body?.venueType === 'string' ? body.venueType : '';
    const walkDate = typeof body?.walkDate === 'string' ? body.walkDate : '';
    const outcome = typeof body?.outcome === 'string' ? body.outcome : '';
    const offerFocus = typeof body?.offerFocus === 'string' ? body.offerFocus : '';
    const contactName = typeof body?.contactName === 'string' ? body.contactName : '';
    const notes = typeof body?.notes === 'string' ? body.notes : '';

    const signal = await createVenueValidationSignal(db, {
      createdByUserId: user.id,
      venueKey,
      venueLabel,
      venueType: venueType as
        | 'restaurant'
        | 'beach-club'
        | 'unknown-hospitality'
        | 'mini-market'
        | 'kiosk',
      walkDate,
      outcome: outcome as 'interested' | 'conditional' | 'not-now' | 'no-fit',
      offerFocus: offerFocus as
        | 'verified-listing'
        | 'feature-placement'
        | 'event-visibility'
        | 'pilot-story',
      contactName,
      notes,
    });

    return new Response(JSON.stringify({ success: true, id: signal.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof VenueValidationError) {
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('[admin/venues/signals/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
