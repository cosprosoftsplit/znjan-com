import type { APIRoute } from 'astro';

import { normalizeLanguage } from '@/lib/i18n';
import {
  normalizeFounderSprintSurface,
  renderFounderSprintCardSvg,
} from '@/lib/founder-social-card';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const lang = normalizeLanguage(url.searchParams.get('lang'));
  const surface = normalizeFounderSprintSurface(url.searchParams.get('surface'));
  const svg = renderFounderSprintCardSvg(lang, surface);

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
