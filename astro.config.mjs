// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://znjan.com',
  output: 'static',
  trailingSlash: 'always',

  redirects: {
    '/': '/en/',
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
