import type { APIRoute } from 'astro';
import { getDB } from '@/lib/db';
import {
  SportsReservationError,
  createSportsPilotDistributionLog,
} from '@/lib/sports-reservations';

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
    const distributionDate = typeof body?.distributionDate === 'string' ? body.distributionDate : '';
    const locationName = typeof body?.locationName === 'string' ? body.locationName : '';
    const locationType = typeof body?.locationType === 'string' ? body.locationType : '';
    const materialType = typeof body?.materialType === 'string' ? body.materialType : '';
    const quantity = typeof body?.quantity === 'number' ? body.quantity : Number(body?.quantity ?? 0);
    const notes = typeof body?.notes === 'string' ? body.notes : '';

    const log = await createSportsPilotDistributionLog(db, {
      distributedByUserId: user.id,
      distributionDate,
      locationName,
      locationType: locationType as
        | 'pavilion'
        | 'bar'
        | 'restaurant'
        | 'beach-touchpoint'
        | 'other',
      materialType: materialType as
        | 'qr-sticker'
        | 'flyer'
        | 'poster'
        | 'table-card'
        | 'handout',
      quantity,
      notes,
    });

    return new Response(JSON.stringify({ success: true, id: log.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof SportsReservationError) {
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('[admin/reservations/distribution-logs/post]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
