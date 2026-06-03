/**
 * i18n utilities for znjan.com
 * Handles 4 languages: EN (default), HR, DE, IT
 */

export const LANGUAGES = ['en', 'hr', 'de', 'it', 'fr', 'es', 'pl', 'nl'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

/** Localized route segment mappings */
export const ROUTE_SEGMENTS: Record<string, Record<Language, string>> = {
  guides: { en: 'guides', hr: 'vodici', de: 'reisefuehrer', it: 'guide', fr: 'guides', es: 'guias', pl: 'przewodniki', nl: 'gidsen' },
  articles: { en: 'articles', hr: 'clanci', de: 'artikel', it: 'articoli', fr: 'articles', es: 'articulos', pl: 'artykuly', nl: 'artikelen' },
  places: { en: 'places', hr: 'mjesta', de: 'orte', it: 'luoghi', fr: 'lieux', es: 'lugares', pl: 'miejsca', nl: 'plekken' },
  activities: { en: 'activities', hr: 'aktivnosti', de: 'aktivitaeten', it: 'attivita', fr: 'activites', es: 'actividades', pl: 'atrakcje', nl: 'activiteiten' },
  events: { en: 'events', hr: 'dogadanja', de: 'veranstaltungen', it: 'eventi', fr: 'evenements', es: 'eventos', pl: 'wydarzenia', nl: 'evenementen' },
  'beach-areas': { en: 'beach-areas', hr: 'dijelovi-plaze', de: 'strandbereiche', it: 'zone-spiaggia', fr: 'zones-plage', es: 'zonas-playa', pl: 'strefy-plazy', nl: 'strandzones' },
  about: { en: 'about', hr: 'o-nama', de: 'ueber-uns', it: 'chi-siamo', fr: 'a-propos', es: 'sobre-nosotros', pl: 'o-nas', nl: 'over-ons' },
  contact: { en: 'contact', hr: 'kontakt', de: 'kontakt', it: 'contatti', fr: 'contact', es: 'contacto', pl: 'kontakt', nl: 'contact' },
  privacy: { en: 'privacy', hr: 'privatnost', de: 'datenschutz', it: 'privacy', fr: 'confidentialite', es: 'privacidad', pl: 'prywatnosc', nl: 'privacy' },
  community: { en: 'community', hr: 'zajednica', de: 'gemeinschaft', it: 'comunita', fr: 'communaute', es: 'comunidad', pl: 'spolecznosc', nl: 'gemeenschap' },
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

/** Get localized URL for a given path and language.
 *  Route segments always use English (Astro generates pages at English paths). */
export function getLocalizedUrl(
  lang: Language,
  segment: string,
  slug?: string,
): string {
  const base = `/${lang}/${segment}/`;
  if (slug) {
    return `${base}${slug}/`;
  }
  return base;
}

/** Get the home URL for a language */
export function getHomeUrl(lang: Language): string {
  return `/${lang}/`;
}

/** Generate hreflang links for a page.
 *  Route segments always use English (Astro generates pages at English paths). */
export function getHreflangLinks(
  segment: string,
  slugs: Record<Language, string>,
): Array<{ lang: Language | 'x-default'; href: string }> {
  const links: Array<{ lang: Language | 'x-default'; href: string }> = [];

  for (const lang of LANGUAGES) {
    links.push({
      lang,
      href: `https://znjan.com/${lang}/${segment}/${slugs[lang]}/`,
    });
  }

  // x-default points to English
  links.push({
    lang: 'x-default',
    href: `https://znjan.com/en/${segment}/${slugs.en}/`,
  });

  return links;
}

/** Build per-language alternate URLs for a localized detail page */
export function getAlternateUrls(
  segment: string,
  slugs: Record<Language, string>,
): Record<Language, string> {
  const alternates = {} as Record<Language, string>;

  for (const lang of LANGUAGES) {
    alternates[lang] = getLocalizedUrl(lang, segment, slugs[lang]);
  }

  return alternates;
}

/** Build per-language alternate URLs for a localized standalone page */
export function getPageAlternateUrls(
  slugs: Record<Language, string>,
): Record<Language, string> {
  const alternates = {} as Record<Language, string>;

  for (const lang of LANGUAGES) {
    alternates[lang] = `/${lang}/${slugs[lang]}/`;
  }

  return alternates;
}

/** Language display names */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hr: 'Hrvatski',
  de: 'Deutsch',
  it: 'Italiano',
  fr: 'Français',
  es: 'Español',
  pl: 'Polski',
  nl: 'Nederlands',
};

/** Language flag emojis for language switcher */
export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  hr: '🇭🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  fr: '🇫🇷',
  es: '🇪🇸',
  pl: '🇵🇱',
  nl: '🇳🇱',
};

/** Check whether an arbitrary value is one of the supported site languages */
export function isLanguage(value: string | null | undefined): value is Language {
  return LANGUAGES.includes(value as Language);
}

/** Normalize arbitrary input to a supported language */
export function normalizeLanguage(value: string | null | undefined): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

/** Extract language from URL path */
export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  return normalizeLanguage(lang);
}

/** Get a field value for a specific language from a multilingual object */
export function getLocalized<T>(
  field: Record<Language, T>,
  lang: Language,
): T {
  return field[lang] ?? field[DEFAULT_LANGUAGE];
}
