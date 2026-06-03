// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://znjan.com',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  trailingSlash: 'always',

  // NOTE: under @astrojs/cloudflare, paths route through dist/_worker.js and
  // astro.config `redirects` DON'T FIRE in production for in-app paths — only
  // `/` works here because it's excluded from the worker via _routes.json.
  // ALL other 301s (cross-language 404 recoveries, deleted events, legacy
  // WordPress URLs) live in public/_redirects so Cloudflare Pages applies
  // them at the edge.
  redirects: {
    '/': '/en/',
    '/sitemap.xml': '/sitemap-index.xml',
  },

  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          hr: 'hr',
          de: 'de',
          it: 'it',
          fr: 'fr',
          es: 'es',
          pl: 'pl',
          nl: 'nl',
        },
      },
    }),
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hr', 'de', 'it', 'fr', 'es', 'pl', 'nl'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  image: {
    domains: [],
    remotePatterns: [],
  },
});
