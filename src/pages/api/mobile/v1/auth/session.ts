import type { APIRoute } from 'astro';

import {
  createMobileEnvelope,
  createMobileResponse,
  createMobileViewer,
  MOBILE_PRIVATE_CACHE_CONTROL,
} from '@/lib/mobile-api';
import { normalizeLanguage } from '@/lib/i18n';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const lang = normalizeLanguage(url.searchParams.get('lang'));
  const body = createMobileEnvelope(lang, {
    authMode: 'google-oauth-cookie-session' as const,
    nativeAuthReady: false,
    viewer: createMobileViewer(locals.user),
    web: {
      loginScreen: `/${lang}/community/login/`,
      googleStart: `/api/auth/google?lang=${lang}`,
      logout: '/api/auth/logout',
    },
    nativePlan: {
      status: 'documented-not-implemented' as const,
      targetFlow: 'oauth-pkce-with-native-session-exchange' as const,
    },
  });

  return createMobileResponse(body, 200, MOBILE_PRIVATE_CACHE_CONTROL);
};
