/**
 * check-i18n.ts — Validate translation parity across all 4 languages
 *
 * Checks:
 * 1. All UI string JSON files have the same keys
 * 2. All content collection YAML files have all required multilingual fields
 * 3. All slugs are defined for all 4 languages
 *
 * Usage: npx tsx scripts/check-i18n.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const LANGUAGES = ['en', 'hr', 'de', 'it'] as const;
const ROOT = resolve(import.meta.dirname, '..');
const I18N_DIR = join(ROOT, 'src', 'i18n');
const CONTENT_DIR = join(ROOT, 'src', 'content');

let errors: string[] = [];
let warnings: string[] = [];

// ============================================================
// 1. Check UI string parity
// ============================================================

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function checkUIStrings() {
  console.log('\n--- Checking UI string parity ---');

  const allKeys: Record<string, string[]> = {};

  for (const lang of LANGUAGES) {
    const filePath = join(I18N_DIR, `${lang}.json`);
    if (!existsSync(filePath)) {
      errors.push(`Missing UI strings file: src/i18n/${lang}.json`);
      continue;
    }

    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    allKeys[lang] = flattenKeys(content);
  }

  // Compare all languages against English (reference)
  const enKeys = new Set(allKeys['en'] || []);

  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;
    const langKeys = new Set(allKeys[lang] || []);

    // Keys in EN but missing in this language
    for (const key of enKeys) {
      if (!langKeys.has(key)) {
        errors.push(`Missing key in ${lang}.json: "${key}"`);
      }
    }

    // Extra keys in this language (not in EN)
    for (const key of langKeys) {
      if (!enKeys.has(key)) {
        warnings.push(`Extra key in ${lang}.json (not in en.json): "${key}"`);
      }
    }
  }

  console.log(`  EN keys: ${enKeys.size}`);
  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;
    console.log(`  ${lang.toUpperCase()} keys: ${(allKeys[lang] || []).length}`);
  }
}

// ============================================================
// 2. Check content collection YAML files for multilingual fields
// ============================================================

function checkContentFiles() {
  console.log('\n--- Checking content collection multilingual fields ---');

  const dataCollections = ['beach-areas', 'activities', 'places', 'faq', 'pages'];

  for (const collection of dataCollections) {
    const dir = join(CONTENT_DIR, collection);
    if (!existsSync(dir)) {
      warnings.push(`Content collection directory missing: src/content/${collection}/`);
      continue;
    }

    const files = readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const file of files) {
      const filePath = join(dir, file);
      const content = readFileSync(filePath, 'utf-8');

      // Check for multilingual field patterns (title.en, title.hr, etc.)
      // Simple heuristic: if file has "en:" it should also have hr, de, it
      if (content.includes('  en:')) {
        for (const lang of LANGUAGES) {
          if (lang === 'en') continue;
          if (!content.includes(`  ${lang}:`)) {
            warnings.push(`${collection}/${file}: Might be missing "${lang}" translations`);
          }
        }
      }

      // Check slug fields specifically
      if (content.includes('slug:')) {
        for (const lang of LANGUAGES) {
          const slugPattern = new RegExp(`slug:[\\s\\S]*?${lang}:`, 'm');
          if (!slugPattern.test(content)) {
            errors.push(`${collection}/${file}: Missing slug for language "${lang}"`);
          }
        }
      }
    }

    console.log(`  ${collection}: ${files.length} files checked`);
  }
}

// ============================================================
// Run checks
// ============================================================

console.log('=== i18n Parity Check ===');
console.log(`Languages: ${LANGUAGES.join(', ')}`);

checkUIStrings();
checkContentFiles();

// Report
console.log('\n=== Results ===');

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} ERROR(S):`);
  for (const error of errors) {
    console.log(`  ❌ ${error}`);
  }
}

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} WARNING(S):`);
  for (const warning of warnings) {
    console.log(`  ⚠️  ${warning}`);
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All i18n checks passed!');
}

if (errors.length > 0) {
  console.log(`\n💥 ${errors.length} error(s) found. Fix before deploying.`);
  process.exit(1);
} else {
  console.log('\n✅ i18n check complete (no errors).');
  process.exit(0);
}
