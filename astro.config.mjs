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

    // --- SEO: retire stale GSC 404s (cross-language slug mismatches from a now-fixed
    //     link-generation bug). 301 each stale URL to its correct localized equivalent. ---
    // Beach areas (English segment, localized slug)
    '/hr/beach-areas/amphitheater-bereich/': '/hr/beach-areas/amfiteatar/',
    '/de/beach-areas/amphitheater-area/': '/de/beach-areas/amphitheater-bereich/',
    '/hr/beach-areas/amphitheater-area/': '/hr/beach-areas/amfiteatar/',
    '/it/beach-areas/amphitheater-area/': '/it/beach-areas/zona-anfiteatro/',
    '/de/beach-areas/setnica/': '/de/beach-areas/promenade/',
    '/en/beach-areas/setnica/': '/en/beach-areas/promenade/',
    '/it/beach-areas/setnica/': '/it/beach-areas/lungomare/',
    // Activities
    '/en/activities/beach-volley/': '/en/activities/beach-volleyball/',
    '/hr/activities/beach-volley/': '/hr/activities/odbojka-na-pijesku/',
    '/de/activities/beach-volley/': '/de/activities/beachvolleyball/',
    '/it/activities/kayaking/': '/it/activities/kayak/',
    '/it/activities/kajak/': '/it/activities/kayak/',
    '/de/activities/cycling-running/': '/de/activities/radfahren-laufen/',
    '/it/activities/cycling-running/': '/it/activities/ciclismo-corsa/',
    '/en/activities/biciklizam-trcanje/': '/en/activities/cycling-running/',
    '/de/activities/biciklizam-trcanje/': '/de/activities/radfahren-laufen/',
    '/it/activities/biciklizam-trcanje/': '/it/activities/ciclismo-corsa/',
    // Standalone pages (localized slug, no segment)
    '/it/about/': '/it/chi-siamo/',
    '/it/contact/': '/it/contatti/',
    '/hr/privacy/': '/hr/privatnost/',
    // Guides (English slug used under de/it -> localized guide slug)
    '/de/guides/where-to-stay-near-znjan-beach/': '/de/guides/unterkunft-nahe-strand-znjan/',
    '/it/guides/where-to-stay-near-znjan-beach/': '/it/guides/dove-alloggiare-vicino-spiaggia-znjan/',

    // --- SEO: deleted (fictional) event pages that still had clicks -> same-language listing ---
    '/en/events/znjan-beach-season-opening-2026/': '/en/events/',
    '/hr/events/otvorenje-sezone-plaze-znjan-2026/': '/hr/events/',
    '/it/events/apertura-stagione-spiaggia-znjan-2026/': '/it/events/',
    '/de/events/znjan-strand-saisoneroeffnung-2026/': '/de/events/',
    '/it/events/torneo-beach-volley-znjan-2026/': '/it/events/',

    // --- SEO: legacy WordPress URLs from the prior site (still indexed on the www host) ---
    '/2020/06/': '/en/',
    '/2020/06/19/hello-world/': '/en/',
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
