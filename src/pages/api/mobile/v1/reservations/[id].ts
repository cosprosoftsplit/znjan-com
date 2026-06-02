import type { APIRoute } from 'astro';

import {
  MOBILE_PRIVATE_CACHE_CONTROL,
  createMobileErrorResponse,
} from '@/lib/mobile-api';
import { PUBLIC_SPORTS_ACCESS_MESSAGE } from '@/lib/sports-reservations';

export const prerender = false;

export const DELETE: APIRoute = async () => {
  return createMobileErrorResponse(
    'reservations-disabled',
    PUBLIC_SPORTS_ACCESS_MESSAGE,
    409,
    { cacheControl: MOBILE_PRIVATE_CACHE_CONTROL },
  );
};
