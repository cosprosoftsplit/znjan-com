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
        },
      },
    }),
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hr', 'de', 'it'],
    routing: {
      prefixDefaultLocale: true,
    },
  },

  image: {
    domains: [],
    remotePatterns: [],
  },
});
