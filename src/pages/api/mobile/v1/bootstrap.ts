import type { APIRoute } from 'astro';

import {
  getMobileBootstrap,
  createMobileEnvelope,
  createMobileErrorResponse,
  createMobileResponse,
} from '@/lib/mobile-api';
import { normalizeLanguage } from '@/lib/i18n';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const body = createMobileEnvelope(lang, await getMobileBootstrap(lang));

    return createMobileResponse(body);
  } catch (error) {
    console.error('[mobile/bootstrap]', error);
    return createMobileErrorResponse(
      'mobile-bootstrap-unavailable',
      'Mobile bootstrap unavailable',
      500,
      { retryable: true },
    );
  }
};
