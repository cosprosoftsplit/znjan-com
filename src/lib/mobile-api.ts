import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

import { DEFAULT_LANGUAGE, LANGUAGES, getLocalizedUrl, type Language } from './i18n';
import type { User } from './auth';

export const MOBILE_API_VERSION = 'v1';
export const MOBILE_API_CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=86400';
export const MOBILE_PRIVATE_CACHE_CONTROL = 'no-store';

type LocalizedText = Partial<Record<Language, string>> & { en: string };

type MobileImage = {
  src: string;
  alt: string | null;
};

type MobileBeachArea = {
  id: string;
  slug: string;
  slugs: Record<Language, string>;
  title: string;
  description: string;
  shortDescription: string | null;
  featured: boolean;
  order: number;
  coordinates: { lat: number; lng: number };
  facilities: string[];
  activities: string[];
  image: MobileImage | null;
  webUrl: string;
};

type MobileActivity = {
  id: string;
  slug: string;
  slugs: Record<Language, string>;
  title: string;
  description: string;
  shortDescription: string | null;
  category: string;
  difficulty: string | null;
  duration: string | null;
  priceRange: string | null;
  season: string;
  featured: boolean;
  order: number;
  beachAreas: string[];
  image: MobileImage | null;
  webUrl: string;
};

type MobilePlace = {
  id: string;
  slug: string;
  slugs: Record<Language, string>;
  title: string;
  description: string;
  shortDescription: string | null;
  category: string;
  status: string;
  featured: boolean;
  order: number;
  listingTier: string;
  coordinates: { lat: number; lng: number };
  beachArea: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  priceRange: string | null;
  tags: string[];
  image: MobileImage | null;
  webUrl: string;
};

type MobileFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
};

type MobileBootstrap = {
  site: {
    name: string;
    url: string;
    defaultLanguage: Language;
    supportedLanguages: readonly Language[];
    contactEmail: string | null;
  };
  capabilities: {
    publicContent: true;
    communityRead: true;
    communityWriteRequiresSession: true;
    reservationsRead: true;
    reservationsWriteEnabled: boolean;
    reservationsWriteRequiresSession: boolean;
    nativeAuthReady: false;
    authMode: 'google-oauth-cookie-session';
  };
  endpoints: {
    bootstrap: string;
    discover: string;
    authSession: string;
    communityFeed: string;
    communityPostById: string;
    reservations: string;
    reservationsById: string;
    webPosts: string;
    webPostById: string;
    webReservations: string;
    webReservationsById: string;
    authMe: string;
  };
  counts: {
    beachAreas: number;
    activities: number;
    places: number;
    faq: number;
  };
  featured: {
    beachAreas: MobileBeachArea[];
    activities: MobileActivity[];
    places: MobilePlace[];
  };
};

type MobileDiscover = {
  beachAreas: MobileBeachArea[];
  activities: MobileActivity[];
  places: MobilePlace[];
  faq: MobileFaq[];
};

export type MobileEnvelope<T> = {
  version: typeof MOBILE_API_VERSION;
  generatedAt: string;
  lang: Language;
  data: T;
};

export type MobileErrorResponse = {
  version: typeof MOBILE_API_VERSION;
  generatedAt: string;
  error: {
    code: string;
    message: string;
    authRequired?: boolean;
    retryable?: boolean;
    details?: Record<string, unknown>;
  };
};

export type MobileViewer = {
  isAuthenticated: boolean;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
    role: string;
  } | null;
};

function localizeText(field: LocalizedText | undefined, lang: Language): string | null {
  if (!field) {
    return null;
  }

  return field[lang] ?? field[DEFAULT_LANGUAGE] ?? null;
}

function absolutizePath(siteUrl: string, path: string): string {
  return new URL(path, siteUrl).toString();
}

function getPrimaryImage(
  entry: { heroImage?: { src: string; alt: LocalizedText }; images?: Array<{ src: string; alt: LocalizedText }> },
  lang: Language,
): MobileImage | null {
  const image = entry.heroImage ?? entry.images?.[0];
  if (!image) {
    return null;
  }

  return {
    src: image.src,
    alt: localizeText(image.alt, lang),
  };
}

function serializeBeachArea(
  area: CollectionEntry<'beach-areas'>,
  lang: Language,
  siteUrl: string,
): MobileBeachArea {
  return {
    id: area.data.id,
    slug: area.data.slug[lang],
    slugs: area.data.slug,
    title: localizeText(area.data.title, lang) ?? area.data.title.en,
    description: localizeText(area.data.description, lang) ?? area.data.description.en,
    shortDescription: localizeText(area.data.shortDescription, lang),
    featured: area.data.featured,
    order: area.data.order,
    coordinates: area.data.coordinates,
    facilities: area.data.facilities,
    activities: area.data.activities,
    image: getPrimaryImage(area.data, lang),
    webUrl: absolutizePath(siteUrl, getLocalizedUrl(lang, 'beach-areas', area.data.slug[lang])),
  };
}

function serializeActivity(
  activity: CollectionEntry<'activities'>,
  lang: Language,
  siteUrl: string,
): MobileActivity {
  return {
    id: activity.data.id,
    slug: activity.data.slug[lang],
    slugs: activity.data.slug,
    title: localizeText(activity.data.title, lang) ?? activity.data.title.en,
    description: localizeText(activity.data.description, lang) ?? activity.data.description.en,
    shortDescription: localizeText(activity.data.shortDescription, lang),
    category: activity.data.category,
    difficulty: activity.data.difficulty ?? null,
    duration: localizeText(activity.data.duration, lang),
    priceRange: activity.data.priceRange ?? null,
    season: activity.data.season,
    featured: activity.data.featured,
    order: activity.data.order,
    beachAreas: activity.data.beachAreas,
    image: getPrimaryImage(activity.data, lang),
    webUrl: absolutizePath(siteUrl, getLocalizedUrl(lang, 'activities', activity.data.slug[lang])),
  };
}

function serializePlace(
  place: CollectionEntry<'places'>,
  lang: Language,
  siteUrl: string,
): MobilePlace {
  return {
    id: place.data.id,
    slug: place.data.slug[lang],
    slugs: place.data.slug,
    title: localizeText(place.data.title, lang) ?? place.data.title.en,
    description: localizeText(place.data.description, lang) ?? place.data.description.en,
    shortDescription: localizeText(place.data.shortDescription, lang),
    category: place.data.category,
    status: place.data.status,
    featured: place.data.featured,
    order: place.data.order,
    listingTier: place.data.listingTier,
    coordinates: place.data.coordinates,
    beachArea: place.data.beachArea ?? null,
    address: place.data.address ?? null,
    phone: place.data.phone ?? null,
    website: place.data.website ?? null,
    instagram: place.data.instagram ?? null,
    priceRange: place.data.priceRange ?? null,
    tags: place.data.tags,
    image: getPrimaryImage(place.data, lang),
    webUrl: absolutizePath(siteUrl, getLocalizedUrl(lang, 'places', place.data.slug[lang])),
  };
}

function serializeFaq(faq: CollectionEntry<'faq'>, lang: Language): MobileFaq {
  return {
    id: faq.data.id,
    question: localizeText(faq.data.question, lang) ?? faq.data.question.en,
    answer: localizeText(faq.data.answer, lang) ?? faq.data.answer.en,
    category: faq.data.category,
    order: faq.data.order,
  };
}

export function createMobileEnvelope<T>(lang: Language, data: T): MobileEnvelope<T> {
  return {
    version: MOBILE_API_VERSION,
    generatedAt: new Date().toISOString(),
    lang,
    data,
  };
}

export function createMobileResponse(
  body: unknown,
  status = 200,
  cacheControl = MOBILE_API_CACHE_CONTROL,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
    },
  });
}

export function createMobileErrorResponse(
  code: string,
  message: string,
  status = 400,
  options?: {
    authRequired?: boolean;
    retryable?: boolean;
    details?: Record<string, unknown>;
    cacheControl?: string;
  },
): Response {
  const body: MobileErrorResponse = {
    version: MOBILE_API_VERSION,
    generatedAt: new Date().toISOString(),
    error: {
      code,
      message,
      authRequired: options?.authRequired,
      retryable: options?.retryable,
      details: options?.details,
    },
  };

  return createMobileResponse(
    body,
    status,
    options?.cacheControl ?? MOBILE_PRIVATE_CACHE_CONTROL,
  );
}

export function createMobileViewer(user: User | null | undefined): MobileViewer {
  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      level: user.level,
      role: user.role,
    },
  };
}

export async function getMobileBootstrap(lang: Language): Promise<MobileBootstrap> {
  const [siteConfig, beachAreas, activities, places, faq] = await Promise.all([
    getEntry('global', 'site-config'),
    getCollection('beach-areas'),
    getCollection('activities'),
    getCollection('places'),
    getCollection('faq'),
  ]);

  if (!siteConfig) {
    throw new Error('Global site configuration is missing');
  }

  const siteUrl = siteConfig.data.siteUrl;

  const sortedAreas = beachAreas.sort((a, b) => a.data.order - b.data.order);
  const sortedActivities = activities.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    return a.data.order - b.data.order;
  });
  const sortedPlaces = places.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1;
    if (!a.data.featured && b.data.featured) return 1;
    return a.data.order - b.data.order;
  });

  return {
    site: {
      name: siteConfig.data.siteName,
      url: siteUrl,
      defaultLanguage: siteConfig.data.defaultLanguage,
      supportedLanguages: LANGUAGES,
      contactEmail: siteConfig.data.contactEmail ?? null,
    },
    capabilities: {
      publicContent: true,
      communityRead: true,
      communityWriteRequiresSession: true,
      reservationsRead: true,
      reservationsWriteEnabled: false,
      reservationsWriteRequiresSession: false,
      nativeAuthReady: false,
      authMode: 'google-oauth-cookie-session',
    },
    endpoints: {
      bootstrap: `/api/mobile/${MOBILE_API_VERSION}/bootstrap?lang=${lang}`,
      discover: `/api/mobile/${MOBILE_API_VERSION}/discover?lang=${lang}`,
      authSession: `/api/mobile/${MOBILE_API_VERSION}/auth/session?lang=${lang}`,
      communityFeed: `/api/mobile/${MOBILE_API_VERSION}/community/feed?page=1&limit=20`,
      communityPostById: `/api/mobile/${MOBILE_API_VERSION}/community/posts/:id`,
      reservations: `/api/mobile/${MOBILE_API_VERSION}/reservations?date=YYYY-MM-DD`,
      reservationsById: `/api/mobile/${MOBILE_API_VERSION}/reservations/:id`,
      webPosts: '/api/posts',
      webPostById: '/api/posts/:id',
      webReservations: '/api/reservations?date=YYYY-MM-DD',
      webReservationsById: '/api/reservations/:id',
      authMe: '/api/auth/me',
    },
    counts: {
      beachAreas: sortedAreas.length,
      activities: sortedActivities.length,
      places: sortedPlaces.length,
      faq: faq.length,
    },
    featured: {
      beachAreas: sortedAreas
        .filter((area) => area.data.featured)
        .slice(0, 4)
        .map((area) => serializeBeachArea(area, lang, siteUrl)),
      activities: sortedActivities
        .slice(0, 6)
        .map((activity) => serializeActivity(activity, lang, siteUrl)),
      places: sortedPlaces
        .slice(0, 6)
        .map((place) => serializePlace(place, lang, siteUrl)),
    },
  };
}

export async function getMobileDiscover(lang: Language): Promise<MobileDiscover> {
  const [siteConfig, beachAreas, activities, places, faq] = await Promise.all([
    getEntry('global', 'site-config'),
    getCollection('beach-areas'),
    getCollection('activities'),
    getCollection('places'),
    getCollection('faq'),
  ]);

  if (!siteConfig) {
    throw new Error('Global site configuration is missing');
  }

  const siteUrl = siteConfig.data.siteUrl;

  return {
    beachAreas: beachAreas
      .sort((a, b) => a.data.order - b.data.order)
      .map((area) => serializeBeachArea(area, lang, siteUrl)),
    activities: activities
      .sort((a, b) => {
        if (a.data.featured && !b.data.featured) return -1;
        if (!a.data.featured && b.data.featured) return 1;
        return a.data.order - b.data.order;
      })
      .map((activity) => serializeActivity(activity, lang, siteUrl)),
    places: places
      .sort((a, b) => {
        if (a.data.featured && !b.data.featured) return -1;
        if (!a.data.featured && b.data.featured) return 1;
        return a.data.order - b.data.order;
      })
      .map((place) => serializePlace(place, lang, siteUrl)),
    faq: faq
      .sort((a, b) => a.data.order - b.data.order)
      .map((item) => serializeFaq(item, lang)),
  };
}
