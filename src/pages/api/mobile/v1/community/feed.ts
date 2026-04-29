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
import { listCommunityPosts, normalizeCommunityListFilters } from '@/lib/community-api';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const lang = normalizeLanguage(url.searchParams.get('lang'));
    const db = getDB(locals.runtime);
    const filters = normalizeCommunityListFilters({
      type: url.searchParams.get('type'),
      category: url.searchParams.get('category'),
      page: parseInt(url.searchParams.get('page') || '1', 10),
      limit: parseInt(url.searchParams.get('limit') || '20', 10),
    });
    const result = await listCommunityPosts(db, filters);

    return createMobileResponse(
      createMobileEnvelope(lang, {
        viewer: createMobileViewer(locals.user),
        filters: {
          type: filters.type,
          category: filters.category,
        },
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
        },
        posts: result.posts,
      }),
      200,
      MOBILE_PRIVATE_CACHE_CONTROL,
    );
  } catch (error) {
    console.error('[mobile/community/feed]', error);
    return createMobileErrorResponse(
      'community-feed-unavailable',
      'Community feed unavailable',
      503,
      { retryable: true },
    );
  }
};
