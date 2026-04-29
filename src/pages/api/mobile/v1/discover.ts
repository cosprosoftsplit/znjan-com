import type { APIRoute } from 'astro';

import {
  getMobileDiscover,
  createMobileEnvelope,
  createMobileErrorResponse,
  createMobileResponse,
} from '@/lib/mobile-api';
import { normalizeLanguage } from '@/lib/i18n';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const body = createMobileEnvelope(lang, await getMobileDiscover(lang));

    return createMobileResponse(body);
  } catch (error) {
    console.error('[mobile/discover]', error);
    return createMobileErrorResponse(
      'mobile-discover-unavailable',
      'Mobile discover feed unavailable',
      500,
      { retryable: true },
    );
  }
};
