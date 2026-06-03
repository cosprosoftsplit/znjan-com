/**
 * SEO utilities for znjan.com
 * Meta tag generation, structured data helpers
 */

import type { Language } from './i18n';
import { getLocalized } from './i18n';

export interface SeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
  article?: {
    publishedTime: string;
    modifiedTime: string;
    author: string;
  };
}

export interface HreflangLink {
  lang: string;
  href: string;
}

/** Generate hreflang links for a page.
 *  Route segments always use English (Astro generates pages at English paths). */
export function generateHreflangLinks(
  segment: string,
  slugs: Record<Language, string>,
): HreflangLink[] {
  const languages: Language[] = ['en', 'hr', 'de', 'it', 'fr', 'es', 'pl', 'nl'];
  const links: HreflangLink[] = [];

  for (const lang of languages) {
    links.push({
      lang,
      href: `https://znjan.com/${lang}/${segment}/${slugs[lang]}/`,
    });
  }

  links.push({
    lang: 'x-default',
    href: `https://znjan.com/en/${segment}/${slugs.en}/`,
  });

  return links;
}

/** Generate hreflang links for hub pages (no slug).
 *  Route segments always use English (Astro generates pages at English paths). */
export function generateHubHreflangLinks(segment: string): HreflangLink[] {
  const languages: Language[] = ['en', 'hr', 'de', 'it', 'fr', 'es', 'pl', 'nl'];
  const links: HreflangLink[] = [];

  for (const lang of languages) {
    links.push({
      lang,
      href: `https://znjan.com/${lang}/${segment}/`,
    });
  }

  links.push({
    lang: 'x-default',
    href: `https://znjan.com/en/${segment}/`,
  });

  return links;
}

/** Generate hreflang links for home page */
export function generateHomeHreflangLinks(): HreflangLink[] {
  const languages: Language[] = ['en', 'hr', 'de', 'it', 'fr', 'es', 'pl', 'nl'];
  return [
    ...languages.map((lang) => ({ lang, href: `https://znjan.com/${lang}/` })),
    { lang: 'x-default', href: 'https://znjan.com/en/' },
  ];
}

// ============================================================
// Schema.org Structured Data Builders
// ============================================================

export function buildBeachSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Beach',
    '@id': 'https://znjan.com/#beach',
    name: 'Žnjan Beach',
    alternateName: 'Plaža Žnjan',
    description: 'The largest beach in Split, Croatia, recently transformed with a €45M investment. Known as the Miami of Split.',
    url: 'https://znjan.com',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.5025,
      longitude: 16.4875,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Split',
      addressRegion: 'Split-Dalmatia County',
      addressCountry: 'HR',
    },
    isAccessibleForFree: true,
    publicAccess: true,
  };
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://znjan.com/#organization',
    name: 'Znjan.com',
    url: 'https://znjan.com',
    description: 'The definitive online portal for Žnjan Beach in Split, Croatia.',
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleSchema(options: {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.description,
    url: options.url,
    datePublished: options.publishedAt,
    dateModified: options.updatedAt,
    author: {
      '@type': 'Organization',
      '@id': 'https://znjan.com/#organization',
      name: options.author,
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://znjan.com/#organization',
    },
    ...(options.image && {
      image: {
        '@type': 'ImageObject',
        url: options.image,
      },
    }),
  };
}

export function buildFAQSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildPlaceSchema(options: {
  type: 'Restaurant' | 'BarOrPub' | 'CafeOrCoffeeShop' | 'Store' | 'TouristAttraction' | 'Hotel' | 'Resort';
  name: string;
  description: string;
  url: string;
  slug: string;
  coordinates: { lat: number; lng: number };
  address?: string;
  phone?: string;
  priceRange?: string;
  starRating?: number;
  cuisine?: string[];
  website?: string;
  instagram?: string;
  images?: string[];
}) {
  const sameAs = [
    ...(options.website ? [options.website] : []),
    ...(options.instagram ? [`https://www.instagram.com/${options.instagram}/`] : []),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': options.type,
    '@id': `https://znjan.com/#place-${options.slug}`,
    name: options.name,
    description: options.description,
    url: options.url,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: options.coordinates.lat,
      longitude: options.coordinates.lng,
    },
    ...(options.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: options.address,
        addressLocality: 'Split',
        addressCountry: 'HR',
      },
    }),
    ...(options.phone && { telephone: options.phone }),
    ...(options.priceRange && { priceRange: options.priceRange }),
    ...(options.cuisine && options.cuisine.length > 0 && { servesCuisine: options.cuisine }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(options.images && options.images.length > 0 && { image: options.images }),
    // Hotel/resort class is a star rating of the property, not a review rating.
    // Emit it as schema.org Rating (starRating) — never as aggregateRating.
    ...(options.starRating && {
      starRating: {
        '@type': 'Rating',
        ratingValue: options.starRating,
        bestRating: 5,
      },
    }),
  };
}

export function buildCollectionPageSchema(options: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.items.length,
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function buildEventSchema(options: {
  name: string;
  description: string;
  url: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isFree: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: options.name,
    description: options.description,
    url: options.url,
    startDate: options.startDate,
    ...(options.endDate && { endDate: options.endDate }),
    location: {
      '@type': 'Place',
      name: options.location ?? 'Žnjan Beach',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Split',
        addressCountry: 'HR',
      },
    },
    isAccessibleForFree: options.isFree,
  };
}
