import type { APIRoute } from 'astro';

import { getDB } from '@/lib/db';
import { normalizeLanguage } from '@/lib/i18n';
import {
  MOBILE_PRIVATE_CACHE_CONTROL,
  createMobileEnvelope,
  createMobileErrorResponse,
  createMobileResponse,
} from '@/lib/mobile-api';
import { SportsReservationError, cancelSportsReservation } from '@/lib/sports-reservations';

export const prerender = false;

export const DELETE: APIRoute = async ({ params, url, locals }) => {
  const user = locals.user;
  if (!user) {
    return createMobileErrorResponse(
      'authentication-required',
      'Authentication required',
      401,
      { authRequired: true },
    );
  }

  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const db = getDB(locals.runtime);
    await cancelSportsReservation(db, user.id, params.id ?? '');

    return createMobileResponse(
      createMobileEnvelope(lang, {
        success: true,
        reservationId: params.id ?? '',
      }),
      200,
      MOBILE_PRIVATE_CACHE_CONTROL,
    );
  } catch (error) {
    if (error instanceof SportsReservationError) {
      return createMobileErrorResponse(error.code, error.message, error.status, {
        cacheControl: MOBILE_PRIVATE_CACHE_CONTROL,
      });
    }

    console.error('[mobile/reservations/delete]', error);
    return createMobileErrorResponse(
      'internal-error',
      'Internal server error',
      500,
      { retryable: true },
    );
  }
};
