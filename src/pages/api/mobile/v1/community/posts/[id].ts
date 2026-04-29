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
import { getCommunityPostDetail } from '@/lib/community-api';

export const prerender = false;

export const GET: APIRoute = async ({ params, url, locals }) => {
  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const db = getDB(locals.runtime);
    const post = await getCommunityPostDetail(
      db,
      params.id ?? '',
      locals.user ? { id: locals.user.id, role: locals.user.role } : null,
    );

    if (!post) {
      return createMobileErrorResponse(
        'post-not-found',
        'Post not found',
        404,
        { cacheControl: MOBILE_PRIVATE_CACHE_CONTROL },
      );
    }

    return createMobileResponse(
      createMobileEnvelope(lang, {
        viewer: createMobileViewer(locals.user),
        post,
      }),
      200,
      MOBILE_PRIVATE_CACHE_CONTROL,
    );
  } catch (error) {
    console.error('[mobile/community/post]', error);
    return createMobileErrorResponse(
      'community-post-unavailable',
      'Community post unavailable',
      503,
      { retryable: true },
    );
  }
};
