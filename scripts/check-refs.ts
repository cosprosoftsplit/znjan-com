/**
 * check-refs.ts — Validate entity cross-references in content collections
 *
 * Checks:
 * 1. beachArea references in places/activities point to valid beach-area IDs
 * 2. beachAreas (array) references in activities point to valid IDs
 * 3. guide references in articles point to valid guide IDs
 * 4. relatedActivities/relatedPlaces/relatedBeachAreas point to valid IDs
 *
 * Usage: npx tsx scripts/check-refs.ts
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');

let errors: string[] = [];
let warnings: string[] = [];

// ============================================================
// Helpers
// ============================================================

function loadYamlIds(collection: string): Set<string> {
  const dir = join(CONTENT_DIR, collection);
  const ids = new Set<string>();

  if (!existsSync(dir)) return ids;

  const files = readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const idMatch = content.match(/^id:\s*(.+)$/m);
    if (idMatch) {
      ids.add(idMatch[1].trim());
    }
  }

  return ids;
}

function loadMdxIds(collection: string): Set<string> {
  const dir = join(CONTENT_DIR, collection);
  const ids = new Set<string>();

  if (!existsSync(dir)) return ids;

  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    const idMatch = content.match(/^id:\s*(.+)$/m);
    if (idMatch) {
      ids.add(idMatch[1].trim());
    }
  }

  return ids;
}

function extractYamlField(content: string, field: string): string | null {
  const pattern = new RegExp(`^${field}:\\s*(.+)$`, 'm');
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

function extractYamlArrayField(content: string, field: string): string[] {
  const results: string[] = [];
  const lines = content.split('\n');
  let inField = false;

  for (const line of lines) {
    if (line.match(new RegExp(`^${field}:`))) {
      inField = true;
      continue;
    }
    if (inField) {
      const itemMatch = line.match(/^\s+-\s+(.+)/);
      if (itemMatch) {
        results.push(itemMatch[1].trim());
      } else if (!line.match(/^\s/)) {
        inField = false;
      }
    }
  }

  return results;
}

// ============================================================
// Collect all entity IDs
// ============================================================

console.log('=== Entity Reference Check ===');

const beachAreaIds = loadYamlIds('beach-areas');
const activityIds = loadYamlIds('activities');
const placeIds = loadYamlIds('places');
const guideIds = loadMdxIds('guides');
const articleIds = loadMdxIds('articles');

console.log(`  beach-areas: ${beachAreaIds.size} entities`);
console.log(`  activities: ${activityIds.size} entities`);
console.log(`  places: ${placeIds.size} entities`);
console.log(`  guides: ${guideIds.size} entities`);
console.log(`  articles: ${articleIds.size} entities`);

// ============================================================
// Check references
// ============================================================

function checkCollectionRefs(collection: string, isYaml: boolean) {
  const dir = join(CONTENT_DIR, collection);
  if (!existsSync(dir)) return;

  const ext = isYaml ? ['.yaml', '.yml'] : ['.mdx', '.md'];
  const files = readdirSync(dir).filter((f) => ext.some((e) => f.endsWith(e)));

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');

    // Check beachArea (singular) reference
    const beachArea = extractYamlField(content, 'beachArea');
    if (beachArea && !beachAreaIds.has(beachArea)) {
      errors.push(`${collection}/${file}: Invalid beachArea reference "${beachArea}"`);
    }

    // Check beachAreas (array) references
    const beachAreas = extractYamlArrayField(content, 'beachAreas');
    for (const ref of beachAreas) {
      if (!beachAreaIds.has(ref)) {
        errors.push(`${collection}/${file}: Invalid beachAreas reference "${ref}"`);
      }
    }

    // Check guide reference
    const guide = extractYamlField(content, 'guide');
    if (guide && !guideIds.has(guide)) {
      warnings.push(`${collection}/${file}: Guide reference "${guide}" not found (may not be created yet)`);
    }

    // Check relatedActivities
    const relatedActivities = extractYamlArrayField(content, 'relatedActivities');
    for (const ref of relatedActivities) {
      if (!activityIds.has(ref)) {
        warnings.push(`${collection}/${file}: Related activity "${ref}" not found`);
      }
    }

    // Check relatedPlaces
    const relatedPlaces = extractYamlArrayField(content, 'relatedPlaces');
    for (const ref of relatedPlaces) {
      if (!placeIds.has(ref)) {
        warnings.push(`${collection}/${file}: Related place "${ref}" not found`);
      }
    }

    // Check relatedBeachAreas
    const relatedBeachAreas = extractYamlArrayField(content, 'relatedBeachAreas');
    for (const ref of relatedBeachAreas) {
      if (!beachAreaIds.has(ref)) {
        warnings.push(`${collection}/${file}: Related beach area "${ref}" not found`);
      }
    }
  }
}

console.log('\n--- Checking references ---');
checkCollectionRefs('places', true);
checkCollectionRefs('activities', true);
checkCollectionRefs('guides', false);
checkCollectionRefs('articles', false);
checkCollectionRefs('events', false);

// ============================================================
// Report
// ============================================================

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
  console.log('\n✅ All reference checks passed!');
}

if (errors.length > 0) {
  console.log(`\n💥 ${errors.length} error(s) found. Fix broken references.`);
  process.exit(1);
} else {
  console.log('\n✅ Reference check complete (no errors).');
  process.exit(0);
}
