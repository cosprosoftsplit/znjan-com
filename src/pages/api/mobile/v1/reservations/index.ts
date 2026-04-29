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
  RESERVATION_POLICY,
  SportsReservationError,
  createSportsReservation,
  getReservationDateOptions,
  getSportsScheduleForDate,
  listUpcomingSportsReservations,
  resolveReservationDate,
} from '@/lib/sports-reservations';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const db = getDB(locals.runtime);
    const reservationDate = resolveReservationDate(url.searchParams.get('date'));

    const [resources, upcomingReservations] = await Promise.all([
      getSportsScheduleForDate(db, reservationDate, locals.user?.id),
      locals.user ? listUpcomingSportsReservations(db, locals.user.id) : Promise.resolve([]),
    ]);

    const body = createMobileEnvelope(lang, {
      viewer: createMobileViewer(locals.user),
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
      upcomingReservations: upcomingReservations.map((reservation) => ({
        id: reservation.id,
        reservationDate: reservation.reservationDate,
        slotStart: reservation.slotStart,
        slotEnd: reservation.slotEnd,
        canCancel: reservation.canCancel,
        resource: {
          id: reservation.resource.id,
          slug: reservation.resource.slug,
          kind: reservation.resource.kind,
          sortOrder: reservation.resource.sortOrder,
          reservationMode: reservation.resource.reservationMode,
          capacity: reservation.resource.capacity,
          availableSlotStarts: reservation.resource.availableSlotStarts,
          titles: reservation.resource.titles,
          isActive: reservation.resource.isActive,
        },
      })),
      actions: {
        createReservation: `/api/mobile/v1/reservations`,
        cancelReservation: '/api/mobile/v1/reservations/:id',
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

export const POST: APIRoute = async ({ request, url, locals }) => {
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
    const body = await request.json();
    const resourceSlug = typeof body?.resourceSlug === 'string' ? body.resourceSlug : '';
    const reservationDate = typeof body?.reservationDate === 'string' ? body.reservationDate : '';
    const slotStart = typeof body?.slotStart === 'string' ? body.slotStart : '';

    const reservation = await createSportsReservation(db, user.id, {
      resourceSlug,
      reservationDate,
      slotStart,
    });

    return createMobileResponse(
      createMobileEnvelope(lang, {
        reservation: {
          id: reservation.id,
          resourceSlug,
          reservationDate,
          slotStart,
        },
      }),
      201,
      MOBILE_PRIVATE_CACHE_CONTROL,
    );
  } catch (error) {
    if (error instanceof SportsReservationError) {
      return createMobileErrorResponse(error.code, error.message, error.status, {
        cacheControl: MOBILE_PRIVATE_CACHE_CONTROL,
      });
    }

    console.error('[mobile/reservations/post]', error);
    return createMobileErrorResponse(
      'internal-error',
      'Internal server error',
      500,
      { retryable: true },
    );
  }
};
