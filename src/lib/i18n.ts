/**
 * i18n utilities for znjan.com
 * Handles 4 languages: EN (default), HR, DE, IT
 */

export const LANGUAGES = ['en', 'hr', 'de', 'it'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

/** Localized route segment mappings */
export const ROUTE_SEGMENTS: Record<string, Record<Language, string>> = {
  guides: { en: 'guides', hr: 'vodici', de: 'reisefuehrer', it: 'guide' },
  articles: { en: 'articles', hr: 'clanci', de: 'artikel', it: 'articoli' },
  places: { en: 'places', hr: 'mjesta', de: 'orte', it: 'luoghi' },
  activities: { en: 'activities', hr: 'aktivnosti', de: 'aktivitaeten', it: 'attivita' },
  events: { en: 'events', hr: 'dogadanja', de: 'veranstaltungen', it: 'eventi' },
  'beach-areas': { en: 'beach-areas', hr: 'dijelovi-plaze', de: 'strandbereiche', it: 'zone-spiaggia' },
  about: { en: 'about', hr: 'o-nama', de: 'ueber-uns', it: 'chi-siamo' },
  contact: { en: 'contact', hr: 'kontakt', de: 'kontakt', it: 'contatti' },
  privacy: { en: 'privacy', hr: 'privatnost', de: 'datenschutz', it: 'privacy' },
};

/** Reverse lookup: find the canonical segment from a localized one */
const reverseSegments = new Map<string, { canonical: string; lang: Language }>();
for (const [canonical, translations] of Object.entries(ROUTE_SEGMENTS)) {
  for (const [lang, localized] of Object.entries(translations)) {
    reverseSegments.set(localized, { canonical, lang: lang as Language });
  }
}

export function getCanonicalSegment(localizedSegment: string): string | undefined {
  return reverseSegments.get(localizedSegment)?.canonical;
}

/** Get localized URL for a given path and language */
export function getLocalizedUrl(
  lang: Language,
  segment: string,
  slug?: string,
): string {
  const localizedSegment = ROUTE_SEGMENTS[segment]?.[lang] ?? segment;
  const base = `/${lang}/${localizedSegment}/`;
  if (slug) {
    return `${base}${slug}/`;
  }
  return base;
}

/** Get the home URL for a language */
export function getHomeUrl(lang: Language): string {
  return `/${lang}/`;
}

/** Generate hreflang links for a page */
export function getHreflangLinks(
  segment: string,
  slugs: Record<Language, string>,
): Array<{ lang: Language | 'x-default'; href: string }> {
  const links: Array<{ lang: Language | 'x-default'; href: string }> = [];

  for (const lang of LANGUAGES) {
    const localizedSegment = ROUTE_SEGMENTS[segment]?.[lang] ?? segment;
    const slug = slugs[lang];
    links.push({
      lang,
      href: `https://znjan.com/${lang}/${localizedSegment}/${slug}/`,
    });
  }

  // x-default points to English
  const enSegment = ROUTE_SEGMENTS[segment]?.en ?? segment;
  links.push({
    lang: 'x-default',
    href: `https://znjan.com/en/${enSegment}/${slugs.en}/`,
  });

  return links;
}

/** Language display names */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hr: 'Hrvatski',
  de: 'Deutsch',
  it: 'Italiano',
};

/** Language flag emojis for language switcher */
export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  hr: '🇭🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

/** Extract language from URL path */
export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (LANGUAGES.includes(lang as Language)) {
    return lang as Language;
  }
  return DEFAULT_LANGUAGE;
}

/** Get a field value for a specific language from a multilingual object */
export function getLocalized<T>(
  field: Record<Language, T>,
  lang: Language,
): T {
  return field[lang] ?? field[DEFAULT_LANGUAGE];
}
