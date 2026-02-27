import { defineCollection, z } from 'astro:content';

// ============================================================
// Shared Zod schemas for multilingual fields
// ============================================================

const languages = ['en', 'hr', 'de', 'it'] as const;

/** A string that must be provided in all 4 languages */
const multilingualString = z.object({
  en: z.string(),
  hr: z.string(),
  de: z.string(),
  it: z.string(),
});

/** A slug that must be provided in all 4 languages */
const multilingualSlug = z.object({
  en: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  hr: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  de: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  it: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

/** Optional multilingual string (for fields that might not be translated yet) */
const optionalMultilingualString = z.object({
  en: z.string(),
  hr: z.string().optional(),
  de: z.string().optional(),
  it: z.string().optional(),
});

/** Coordinates for map placement */
const coordinates = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/** Image reference */
const imageRef = z.object({
  src: z.string(),
  alt: multilingualString,
});

// ============================================================
// Content Collections
// ============================================================

/** 1. Beach Areas — zones of the beach */
const beachAreas = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    shortDescription: multilingualString.optional(),
    coordinates: coordinates,
    facilities: z.array(z.string()).default([]),
    activities: z.array(z.string()).default([]),
    images: z.array(imageRef).default([]),
    heroImage: imageRef.optional(),
    order: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

/** 2. Activities — things to do at the beach */
const activities = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    shortDescription: multilingualString.optional(),
    category: z.enum(['water-sports', 'beach-sports', 'fitness', 'relaxation', 'tours', 'other']),
    beachAreas: z.array(z.string()).default([]),
    difficulty: z.enum(['easy', 'moderate', 'hard']).optional(),
    duration: multilingualString.optional(),
    priceRange: z.string().optional(),
    season: z.enum(['year-round', 'summer', 'spring-autumn']).default('summer'),
    images: z.array(imageRef).default([]),
    heroImage: imageRef.optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

/** 3. Places — restaurants, bars, cafes, shops */
const places = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    shortDescription: multilingualString.optional(),
    category: z.enum(['restaurant', 'bar', 'cafe', 'beach-club', 'shop', 'hotel', 'other']),
    cuisine: z.array(z.string()).optional(),
    beachArea: z.string().optional(),
    coordinates: coordinates,
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    instagram: z.string().optional(),
    hours: z.record(z.string()).optional(),
    priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
    listingTier: z.enum(['free', 'featured', 'premium']).default('free'),
    featured: z.boolean().default(false),
    images: z.array(imageRef).default([]),
    heroImage: imageRef.optional(),
    tags: z.array(z.string()).default([]),
    starRating: z.number().min(1).max(5).optional(),
    roomCount: z.number().optional(),
    status: z.enum(['active', 'coming-soon', 'seasonal']).default('active'),
    openingDate: z.string().optional(),
    order: z.number().default(0),
  }),
});

/** 4. Guides — pillar content */
const guides = defineCollection({
  type: 'content',
  schema: z.object({
    guideId: z.string(),
    slugs: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    cluster: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.string().default('znjan-team'),
    heroImage: imageRef.optional(),
    relatedActivities: z.array(z.string()).default([]),
    relatedPlaces: z.array(z.string()).default([]),
    relatedBeachAreas: z.array(z.string()).default([]),
    relatedGuides: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    isSponsored: z.boolean().default(false),
    readingTime: z.number().optional(),
    lang: z.enum(languages),
  }),
});

/** 5. Articles — cluster content */
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    articleId: z.string(),
    slugs: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    guide: z.string().optional(),
    cluster: z.string().optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.string().default('znjan-team'),
    heroImage: imageRef.optional(),
    relatedActivities: z.array(z.string()).default([]),
    relatedPlaces: z.array(z.string()).default([]),
    relatedBeachAreas: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    isSponsored: z.boolean().default(false),
    readingTime: z.number().optional(),
    lang: z.enum(languages),
  }),
});

/** 6. Events — beach events, concerts, tournaments */
const events = defineCollection({
  type: 'content',
  schema: z.object({
    eventId: z.string(),
    slugs: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    beachArea: z.string().optional(),
    place: z.string().optional(),
    category: z.enum(['concert', 'festival', 'sports', 'market', 'community', 'other']).default('other'),
    heroImage: imageRef.optional(),
    website: z.string().url().optional(),
    ticketUrl: z.string().url().optional(),
    isFree: z.boolean().default(true),
    featured: z.boolean().default(false),
    lang: z.enum(languages),
  }),
});

/** 7. News — seasonal updates */
const news = defineCollection({
  type: 'content',
  schema: z.object({
    newsId: z.string(),
    slugs: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.string().default('znjan-team'),
    heroImage: imageRef.optional(),
    category: z.enum(['update', 'announcement', 'season', 'development']).default('update'),
    featured: z.boolean().default(false),
    lang: z.enum(languages),
  }),
});

/** 8. FAQ — structured questions and answers */
const faq = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    question: multilingualString,
    answer: multilingualString,
    category: z.string().default('general'),
    relatedPage: z.string().optional(),
    order: z.number().default(0),
  }),
});

/** 9. Pages — custom static pages */
const pages = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    slug: multilingualSlug,
    title: multilingualString,
    description: multilingualString,
    content: multilingualString,
    template: z.enum(['default', 'contact', 'about']).default('default'),
    order: z.number().default(0),
  }),
});

/** 10. Global — site-wide configuration */
const global = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    siteName: z.string().default('Znjan.com'),
    siteUrl: z.string().url().default('https://znjan.com'),
    defaultLanguage: z.enum(languages).default('en'),
    socialLinks: z.object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      twitter: z.string().url().optional(),
      youtube: z.string().url().optional(),
    }).optional(),
    contactEmail: z.string().email().optional(),
    analyticsId: z.string().optional(),
  }),
});

/** 11. Redirects — URL mappings */
const redirects = defineCollection({
  type: 'data',
  schema: z.object({
    from: z.string(),
    to: z.string(),
    status: z.enum(['301', '302']).default('301'),
  }),
});

// ============================================================
// Export collections
// ============================================================

export const collections = {
  'beach-areas': beachAreas,
  activities,
  places,
  guides,
  articles,
  events,
  news,
  faq,
  pages,
  global,
  redirects,
};
