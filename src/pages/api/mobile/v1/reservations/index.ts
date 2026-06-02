import type { APIRoute } from 'astro';

import { getDB } from '@/lib/db';
import { normalizeLanguage } from '@/lib/i18n';
import {
  MOBILE_PRIVATE_CACHE_CONTROL,
  createMobileEnvelope,
  createMobileErrorResponse,
  createMobileResponse,
  createMobileViewer,
} from '@/lib/mobile-api';
import {
  PUBLIC_SPORTS_ACCESS_MESSAGE,
  RESERVATION_POLICY,
  getReservationDateOptions,
  getSportsScheduleForDate,
  resolveReservationDate,
} from '@/lib/sports-reservations';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const db = getDB(locals.runtime);
    const reservationDate = resolveReservationDate(url.searchParams.get('date'));
    const resources = await getSportsScheduleForDate(db, reservationDate, locals.user?.id);

    const body = createMobileEnvelope(lang, {
      viewer: createMobileViewer(locals.user),
      reservationsEnabled: false,
      publicAccessMessage: PUBLIC_SPORTS_ACCESS_MESSAGE,
      reservationDate,
      dateOptions: getReservationDateOptions(),
      policy: RESERVATION_POLICY,
      resources: resources.map((resource) => ({
        id: resource.id,
        slug: resource.slug,
        kind: resource.kind,
        sortOrder: resource.sortOrder,
        reservationMode: resource.reservationMode,
        capacity: resource.capacity,
        availableSlotStarts: resource.availableSlotStarts,
        titles: resource.titles,
        isActive: resource.isActive,
        slots: resource.slots,
      })),
      upcomingReservations: [],
      actions: {
        createReservation: null,
        cancelReservation: null,
      },
    });

    return createMobileResponse(body, 200, MOBILE_PRIVATE_CACHE_CONTROL);
  } catch (error) {
    console.error('[mobile/reservations/get]', error);
    return createMobileErrorResponse(
      'reservations-unavailable',
      'Reservations unavailable',
      503,
      { retryable: true },
    );
  }
};

export const POST: APIRoute = async () => {
  return createMobileErrorResponse(
    'reservations-disabled',
    PUBLIC_SPORTS_ACCESS_MESSAGE,
    409,
    { cacheControl: MOBILE_PRIVATE_CACHE_CONTROL },
  );
};
