/**
 * Translation loader for znjan.com
 * Flattens nested JSON into dot-notation keys for easy access.
 */

import type { Language } from './i18n';

import en from '@/i18n/en.json';
import hr from '@/i18n/hr.json';
import de from '@/i18n/de.json';
import it from '@/i18n/it.json';

const translations: Record<Language, Record<string, unknown>> = { en, hr, de, it };

/** Flatten a nested object into dot-notation keys */
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
    } else if (typeof value === 'string') {
      result[fullKey] = value;
    }
  }
  return result;
}

/** Cache flattened translations */
const cache = new Map<Language, Record<string, string>>();

/** Get all translations for a language as flat key-value map */
export function getTranslations(lang: Language): Record<string, string> {
  if (!cache.has(lang)) {
    cache.set(lang, flatten(translations[lang]));
  }
  return cache.get(lang)!;
}

/** Get a single translation value */
export function t(lang: Language, key: string): string {
  const strings = getTranslations(lang);
  return strings[key] ?? key;
}
