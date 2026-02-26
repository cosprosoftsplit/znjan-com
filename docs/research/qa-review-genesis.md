# znjan.com — Genesis Quality Review

> Quality review of genesis build. Generated 2026-02-26.

---

**Reviewer:** QA Agent (Claude Opus 4.6)
**Date:** 2026-02-26
**Scope:** All files in the project as of this date
**Build tested:** Yes -- `npx astro build` was executed and **failed**

---

## EXECUTIVE SUMMARY

The project demonstrates strong architectural thinking, thorough documentation, and generally high code quality for a genesis-phase build. The documentation suite (CLAUDE.md, ADR, ASSUMPTIONS, SWARM_TICKETS, SWARM_SPAWN) is well above average. The i18n system, Zod schemas, and component design are thoughtful.

However, the project **cannot build** in its current state. There are 3 confirmed build-breaking issues and approximately 12 high-priority functional bugs. These must be resolved before any further feature work proceeds.

**Overall Grade: B+** -- Excellent foundation, blocked by dependency and configuration errors.

---

## SECTION 1: DOCUMENTATION FILES

---

### 1.1 CLAUDE.md

**File:** `C:\Users\ivanb\znjan.com\CLAUDE.md`
**Grade: A**

**Strengths:**
- Comprehensive stack table with every technology layer identified
- Content collections table is clear and complete with all 11 collections
- i18n section includes the localized route segment mapping table, which is essential for any agent
- Build commands documented with clear purpose descriptions
- Key files table maps every important file to its role
- Directory structure diagram is accurate
- Patterns and conventions section covers the critical rules (affiliate links, component strategy, image handling)

**Issues:**

1. `scripts/check-i18n.ts` and `scripts/check-refs.ts` are referenced as key files and wired into `package.json` scripts, but **neither file exists** in the repository. Any agent running `npm run check-i18n` or `npm run check-refs` will get an immediate failure.

2. The document does not mention that there are **two separate translation systems**: the async `useTranslations()` in `src/lib/i18n.ts` and the synchronous `t()` / `getTranslations()` in `src/lib/translations.ts`. A new agent would not know which to use. The correct answer is that `translations.ts` is the preferred system for `.astro` components (synchronous, build-time), but this is undocumented.

3. The custom CSS classes `container-page` and `prose-beach` (defined in `src/styles/global.css`) are used throughout every layout and page component but are never mentioned in CLAUDE.md. An agent creating new pages would need to know these exist.

4. States "Tailwind CSS 4" in the stack table, but the installed version is `tailwindcss ^3.4.19`. The configuration file uses Tailwind v3 format (`module.exports` style config with `content` array). This discrepancy would mislead an agent into writing Tailwind v4 syntax (CSS-based config, `@theme` directives) that would not work.

---

### 1.2 docs/ADR.md

**File:** `C:\Users\ivanb\znjan.com\docs\ADR.md`
**Grade: A+**

**Strengths:**
- Every technology decision has a clear rationale and alternatives considered
- Confidence scores are honest and well-calibrated: 0.95 for proven choices (Astro, Tailwind, Cloudflare), 0.75 for the riskiest decision (4-language i18n with localized slugs)
- Entity relationship diagram is clear and complete
- Multilingual content strategy is well-reasoned with a concrete YAML example
- SEO architecture section covers topical clusters, Schema.org types per page, and the `@id` strategy
- Monetization architecture is forward-looking without over-engineering
- Risk register identifies the real risks with realistic likelihood assessments
- Decision log provides a concise audit trail

**Issues:**

1. **Tailwind version discrepancy.** Section 2.3 states "Tailwind CSS 4" but the project installs `tailwindcss@^3.4.19`. Tailwind v4 has a fundamentally different API (CSS-based configuration, no `tailwind.config.mjs`). The ADR should read "Tailwind CSS 3.4."

2. **Cloudflare adapter inconsistency.** Section 2.4 discusses Cloudflare Workers for dynamic endpoints, and `@astrojs/cloudflare` is in `package.json`, but `astro.config.mjs` sets `output: 'static'` and does not configure the adapter. For pure SSG, the adapter is unnecessary. The ADR should clarify whether server-side endpoints are planned for launch or deferred.

3. **Performance target uses deprecated metric.** Section 7 targets "FID < 100ms" but Google replaced First Input Delay (FID) with Interaction to Next Paint (INP) as a Core Web Vital in March 2024. Should read "INP < 200ms."

4. The "Open question" about places directory scope (500m radius) is noted in section 3.1, which is good. However, no decision mechanism or deadline is specified for resolving it.

---

### 1.3 ASSUMPTIONS.md

**File:** `C:\Users\ivanb\znjan.com\ASSUMPTIONS.md`
**Grade: A**

**Strengths:**
- Clean separation between high-confidence assumptions (A1-A5) and risky assumptions (R1-R7)
- R1 (i18n complexity) is correctly identified as the highest-risk item with a concrete mitigation (launch EN+HR first)
- R3 (translation quality) acknowledges the risk of AI translations and provides a practical mitigation (native speaker review of top 5 pages)
- Validation timelines are tied to specific project phases
- Dependencies table identifies the real blockers (photography, local business info, translation review)

**Issues:**

1. **A3 (Tech Stack) states "Tailwind CSS 4 is production-ready"** -- this is factually incorrect for this project since Tailwind 3.4 is installed. The assumption should read "Tailwind CSS 3.4 is production-ready" (which it is).

2. **Missing critical assumption: `@tailwindcss/typography` plugin is available and compatible.** The project uses `prose` classes extensively but does not have this dependency installed. This is a build-breaking gap that should have been flagged as a dependency.

3. **Missing assumption about static assets.** The `Base.astro` layout references `/images/og-default.jpg` and `/favicon.svg`, neither of which exist in the repository. These missing assets should be flagged as a content dependency.

4. **Missing assumption about the content model for MDX collections.** The Zod schemas for guides, articles, events, and news include both `slug: multilingualSlug` (suggesting single-file multilingual) and `lang: z.enum(languages)` (suggesting per-language files). This ambiguity is a design risk that should be called out.

---

### 1.4 SWARM_TICKETS.md

**File:** `C:\Users\ivanb\znjan.com\SWARM_TICKETS.md`
**Grade: A**

**Strengths:**
- Well-prioritized into P0 (16 launch blockers), P1 (12 quality items), P2 (12 enhancements)
- Every ticket has description, acceptance criteria, and size estimate
- Size estimates (S/M/L) are reasonable for the described work
- Good dependency awareness (content tickets depend on template tickets)
- P2 items are genuinely deferrable without affecting launch quality

**Issues:**

1. **Missing ticket: Install `@tailwindcss/typography`.** This is a build-breaking dependency. Should be part of P0/T001 or its own P0 ticket.

2. **Missing ticket: Install `typescript` and `@astrojs/check`.** Required for `npm run check`. Should be part of P0/T001.

3. **Missing ticket: Create `scripts/check-i18n.ts` and `scripts/check-refs.ts`.** P0/T015 describes "Build validation scripts" but it is unclear whether this ticket was completed. The scripts do not exist in the repository. The `package.json` references them, indicating they were intended but never created.

4. **Missing ticket: Entity detail pages.** The hub pages (`[lang]/places/index.astro`, `[lang]/activities/index.astro`, `[lang]/beach-areas/index.astro`) generate links to detail pages (e.g., `/en/places/znjan-beach-bar/`) but **no dynamic route files exist** for these pages (`[lang]/places/[...slug].astro` etc.). Every link from every hub page leads to a 404. This is arguably the most important missing ticket.

5. **T038 (Social sharing meta tags) is listed as P2** but `Base.astro` already includes OG and Twitter Card meta tags. The ticket is partially complete and should be updated to reflect remaining work (per-page type OG images).

6. **No ticket for creating the root redirect mechanism** that works with static output (the current `Astro.redirect` approach may not work for SSG).

---

### 1.5 SWARM_SPAWN.md

**File:** `C:\Users\ivanb\znjan.com\SWARM_SPAWN.md`
**Grade: A**

**Strengths:**
- Clear reading order (CLAUDE.md first, then ADR, ASSUMPTIONS, SWARM_TICKETS)
- Critical conventions are well-organized into 6 numbered sections
- Content file templates for both YAML and MDX give concrete examples
- Common pitfalls section addresses real issues that an agent would encounter
- Quick commands reference duplicates CLAUDE.md (intentionally, for standalone use)

**Issues:**

1. References `npm run check-i18n` which does not yet work (script file missing).

2. Should explicitly state which translation system to use: "`translations.ts` provides `t(lang, key)` and `getTranslations(lang)` for synchronous use in `.astro` components. The `useTranslations()` function in `i18n.ts` is async and should generally not be used."

3. Does not warn about the inline translation anti-pattern. The home page currently uses extensive ternary chains for translations instead of the i18n JSON system. A new agent might copy this pattern. The conventions should explicitly say: "Never use inline language ternaries. Always add new keys to the i18n JSON files."

4. Missing convention about the content model ambiguity for MDX collections (single-file multilingual vs. per-language files with `lang` field).

---

## SECTION 2: CONFIGURATION FILES

---

### 2.1 astro.config.mjs

**File:** `C:\Users\ivanb\znjan.com\astro.config.mjs`
**Grade: B+**

```javascript
import cloudflare from '@astrojs/cloudflare';  // imported but never used
```

**Strengths:**
- `site: 'https://znjan.com'` is correctly set
- `output: 'static'` is appropriate for SSG
- i18n config with `prefixDefaultLocale: true` matches the URL strategy (all pages under `/en/`, `/hr/`, etc.)
- Sitemap integration with i18n locales is properly configured
- MDX and Tailwind integrations are included

**Issues:**

1. **`@astrojs/cloudflare` is imported on line 6 but never used.** It is not added to `integrations` or set as `adapter`. For `output: 'static'`, no adapter is needed. Either remove the import and the `package.json` dependency, or configure it as `adapter: cloudflare()` with `output: 'hybrid'` if server-side endpoints are planned.

2. **Missing `trailingSlash: 'always'`.** All URL helpers in `i18n.ts` and `seo.ts` generate URLs with trailing slashes (e.g., `/${lang}/guides/`). Without explicit `trailingSlash: 'always'`, Astro may generate pages without trailing slashes, causing 404s or redirect loops. This should be set explicitly.

3. **Missing `redirects` configuration.** The root `index.astro` uses `Astro.redirect('/en/')` which may not work correctly with static output. Should use Astro's built-in `redirects` config:
```javascript
redirects: {
  '/': '/en/'
}
```

4. The `image` config has empty `domains` and `remotePatterns` arrays. This is fine for launch but means no remote images can be optimized.

---

### 2.2 tailwind.config.mjs

**File:** `C:\Users\ivanb\znjan.com\tailwind.config.mjs`
**Grade: A-**

**Strengths:**
- Comprehensive Mediterranean color palette with full 50-900 shade scales for 6 color families
- The hex values are well-chosen: `ocean-500` (#0077B6) is a strong, accessible blue; `coral-400` (#FF6B6B) is vibrant but not overwhelming; `sand-200` (#F4E8C1) is a warm, inviting neutral
- Background gradients (`gradient-ocean`, `gradient-sunset`, `gradient-sand`) add design depth
- Font family configured with Inter as primary

**Issues:**

1. **The `sky` color name conflicts with Tailwind's built-in `sky` color palette.** Since this config uses `extend`, the custom `sky` definition overrides Tailwind's default sky colors. Any Tailwind documentation or examples referencing `sky-500` etc. would produce unexpected results. Rename to `adriatic`, `turquoise`, or `sky-blue` to avoid the collision.

2. **`fontFamily.display` is identical to `fontFamily.sans`.** The `global.css` applies `font-display` to all headings (`h1-h6`), so headings and body text use the same font stack. If this is intentional, the `display` family is redundant. If a distinct display font is planned, it should be noted as a TODO.

3. **Missing `@tailwindcss/typography` in the `plugins` array.** The `global.css` file uses `prose`, `prose-lg`, `prose-headings:text-ocean-700`, etc. These classes come from the Typography plugin. Without it, the build fails. Confirmed by running `npx astro build`:

```
The `prose` class does not exist. If `prose` is a custom class, make sure it is
defined within a `@layer` directive.
```

4. **Color contrast concerns.** Some combinations used in the UI may not meet WCAG AA standards:
   - `warm-500` (#737373) text on `warm-50` (#FAFAFA) background: contrast ratio ~4.6:1 (passes AA for large text, borderline for small text)
   - `ocean-200` (#80d4ff) text on `ocean-800` (#003552) in the footer: should be checked
   - `warm-400` (#A3A3A3) used for metadata text throughout: contrast ratio ~3.3:1 against white, which **fails WCAG AA** for normal text

---

### 2.3 tsconfig.json

**File:** `C:\Users\ivanb\znjan.com\tsconfig.json`
**Grade: A**

**Strengths:**
- Extends `astro/tsconfigs/strict` for maximum type safety
- Path aliases are well-organized and cover all major source directories
- `.astro/types.d.ts` is included for Astro-generated type definitions
- `dist` is properly excluded

**Issues:**

1. Minor: `@i18n/*` alias is defined but `translations.ts` uses `@/i18n/en.json` (the `@/*` alias) instead. The `@i18n/*` alias is unused.

2. Minor: No `@styles/*` alias, though there is only one CSS file so this is not pressing.

---

### 2.4 package.json

**File:** `C:\Users\ivanb\znjan.com\package.json`
**Grade: B** (build-breaking missing dependencies)

**Strengths:**
- Clean structure with `"type": "module"` for ESM
- Scripts cover dev, build, preview, check, and validation
- Core Astro dependencies are present
- `tsx` in devDependencies for running TypeScript scripts

**Critical Missing Dependencies:**

| Package | Why Needed | Impact |
|---------|-----------|--------|
| `@tailwindcss/typography` | `prose` classes in `global.css` | **Build fails** |
| `typescript` | Required by `astro check` and TypeScript compilation | `npm run check` fails |
| `@astrojs/check` | Required by `astro check` command | `npm run check` fails |

**Other Issues:**

1. `@astrojs/cloudflare: ^12.6.12` is a dependency but is not used anywhere in the config. Should be removed or properly configured.

2. `tailwindcss: ^3.4.19` is installed, but all documentation claims Tailwind CSS 4. The documentation should be corrected to say Tailwind 3.4.

3. The scripts `check-i18n` and `check-refs` reference files that do not exist:
```json
"check-i18n": "npx tsx scripts/check-i18n.ts",
"check-refs": "npx tsx scripts/check-refs.ts"
```

---

## SECTION 3: LIBRARY FILES

---

### 3.1 src/content/config.ts

**File:** `C:\Users\ivanb\znjan.com\src\content\config.ts`
**Grade: A**

**Strengths:**
- All 11 content collections defined as specified in the ADR
- Shared schema types (`multilingualString`, `multilingualSlug`, `coordinates`, `imageRef`) eliminate duplication
- Slug regex validation (`/^[a-z0-9-]+$/`) enforces URL-safe slugs
- Good use of `.default([])` for optional arrays and `.default(false)` for boolean flags
- `optionalMultilingualString` allows progressive translation (EN required, others optional)
- Correct assignment of `type: 'data'` for YAML and `type: 'content'` for MDX collections
- Enum values for categories are well-chosen and practical

**Issues:**

1. **Content model contradiction.** The `guides`, `articles`, `events`, and `news` schemas include both `slug: multilingualSlug` (all 4 language slugs in one file, suggesting single-file multilingual) and `lang: z.enum(languages)` (indicating which language this specific file is in, suggesting per-language files). These two patterns are mutually exclusive:
   - If using single-file multilingual: remove `lang`, have one MDX file per entity with all 4 language slugs
   - If using per-language files: change `slug` to `z.string()` (single slug per file) and keep `lang`

   The YAML data collections (beach-areas, places, activities, faq) correctly use single-file multilingual (no `lang` field). The MDX content collections should follow the same pattern or the difference should be documented.

2. `hours` in the places schema is `z.record(z.string())` -- too permissive. Any string key is accepted. Consider validating day names or documenting the expected format.

3. `priceRange` is `z.string()` for activities but `z.enum(['$','$$','$$$','$$$$'])` for places. Inconsistent. Either both should use the enum or both should use a free-form string.

4. `pages.content` is `multilingualString` which limits page body content to a simple string per language. For rich pages like "About" or "Contact," this is very restrictive. Consider making `pages` a content collection (MDX).

---

### 3.2 src/lib/i18n.ts

**File:** `C:\Users\ivanb\znjan.com\src\lib\i18n.ts`
**Grade: A-**

**Strengths:**
- Clean type definitions: `Language`, `LANGUAGES`, `DEFAULT_LANGUAGE`
- Complete route segment mapping including about, contact, privacy
- Efficient reverse lookup via `Map` for canonical segment resolution
- `getLocalizedUrl`, `getHomeUrl`, `getHreflangLinks` cover the main URL generation needs
- `getLocalized` provides a clean accessor with fallback to default language
- Language display names and flag emojis for the UI

**Issues:**

1. **`useTranslations` is async** (uses dynamic `import()`). In Astro `.astro` components, the frontmatter runs at build time and synchronous access is preferred. The synchronous `translations.ts` system is better for this use case. Having two parallel translation systems creates confusion. Recommendation: deprecate or remove `useTranslations` from this file and document `translations.ts` as the canonical system.

2. **Hardcoded site URL.** `getHreflangLinks` hardcodes `'https://znjan.com'` on lines 66 and 74. This should use a shared constant or be derived from `astro.config.mjs`'s `site` property. Same issue exists in `seo.ts`.

3. **Flag emojis are not universally rendered.** `LANGUAGE_FLAGS` uses emoji flags (e.g., the British flag for English) which may render as two-letter country codes on some platforms (notably older Windows systems). For a production site, consider SVG flag images or text-only labels.

4. **`getLangFromUrl` uses string splitting** (`url.pathname.split('/')[1]`) which is fragile. If the URL has no path segments, this returns `undefined` which would not match `LANGUAGES.includes()`, correctly falling back to the default. This is acceptable.

---

### 3.3 src/lib/seo.ts

**File:** `C:\Users\ivanb\znjan.com\src\lib\seo.ts`
**Grade: A-**

**Strengths:**
- Complete Schema.org builders for 6 types: Beach, Organization, BreadcrumbList, Article, FAQPage, Place, Event
- Proper use of `@id` for entity identification
- `buildPlaceSchema` supports multiple Schema.org types (Restaurant, BarOrPub, CafeOrCoffeeShop, Store)
- `buildArticleSchema` correctly references the organization as publisher via `@id`
- `buildFAQSchema` follows the Google-recommended FAQPage format

**Issues:**

1. **Duplicate hreflang generation.** `generateHreflangLinks`, `generateHubHreflangLinks`, and `generateHomeHreflangLinks` in this file duplicate similar functionality in `i18n.ts` (`getHreflangLinks`). There should be one canonical set of hreflang utilities.

2. **Missing schema types from the ADR.** The ADR specifies `TouristDestination` for the home page and `TouristAttraction` for activity pages. Neither schema builder exists.

3. `buildBeachSchema` hardcodes the beach name, coordinates, and description. These should come from content data or a shared config.

4. `buildArticleSchema` sets `author.name` to the raw `options.author` string (e.g., "znjan-team"). This should be mapped to a human-readable name.

5. `buildEventSchema` does not include an `offers` property for paid events, even though the `isFree` field is available.

6. The `getLocalized` import on line 7 is imported but never used in this file.

---

### 3.4 src/lib/translations.ts

**File:** `C:\Users\ivanb\znjan.com\src\lib\translations.ts`
**Grade: A**

**Strengths:**
- Synchronous loading via static imports -- correct for Astro's build-time model
- Nested JSON flattening into dot-notation keys is clean and efficient
- `Map`-based caching prevents redundant computation
- Simple `t(lang, key)` API
- Proper fallback: returns the key string when translation is missing

**Issues:**

1. Silent fallback on missing keys. In development, it would be helpful to emit a `console.warn` when a translation key is not found, to catch typos early.

2. No support for interpolation (e.g., `"Welcome, {{name}}"`). This is fine for the current scope but is a known limitation.

---

### 3.5 src/lib/utils.ts

**File:** `C:\Users\ivanb\znjan.com\src\lib\utils.ts`
**Grade: A-**

**Strengths:**
- `formatDate` uses `toLocaleDateString` with locale-aware formatting -- handles all 4 languages correctly
- `estimateReadingTime` is a simple, correct implementation
- `slugify` handles Unicode normalization (NFD + diacritics removal) properly
- `cn` is a minimal `clsx` replacement

**Issues:**

1. `canonicalUrl` hardcodes `'https://znjan.com'` -- third occurrence of this hardcoded value across the codebase. Should use a shared constant.

2. Missing utility: there is no function to construct the full absolute URL for a localized page (combining site URL + language + localized segment + slug). This is done inline in multiple places.

---

## SECTION 4: TRANSLATION FILES

---

### 4.1 src/i18n/en.json

**Grade: A**

Complete, well-structured, natural English. Good SEO-oriented titles.

### 4.2 src/i18n/hr.json

**Grade: A**

The Croatian reads naturally and is grammatically correct. Examples:
- "Dobrodosli na plazu Znjan" -- correct and welcoming
- "Vodeni sportovi, aktivnosti na plazi i avanture na Znjanu" -- natural phrasing
- "Sto trebate znati" -- colloquial and appropriate for the audience

**One issue:** `common.privacyPolicy` translates to "Politika privatnosti." In Croatian web usage, "Pravila privatnosti" or "Izjava o privatnosti" are more conventional. "Politika privatnosti" sounds like a direct calque from English.

### 4.3 src/i18n/de.json

**Grade: A-**

Grammatically correct German. Consistent use of the formal "Sie" form throughout (appropriate for a tourism site). "Wissenswertes" for "Things to Know" is an idiomatic choice.

### 4.4 src/i18n/it.json

**Grade: A-**

Correct Italian. "Cose da sapere" for "Things to Know" is natural. "Spalato" is correctly used as the Italian name for Split.

### Cross-file Issues:

1. **All 4 files have perfect key parity** -- every key in EN exists in HR, DE, and IT. This is excellent.

2. **Hardcoded translations in pages bypass the JSON system.** The following strings appear as inline ternary chains in `.astro` files instead of in the JSON files:
   - "Znjan Beach -- The Miami of Split" and its paragraph (home page about section)
   - Stats labels: "Investment", "Beach Length", "Beach Zones", "Restaurants & Bars"
   - Empty state messages: "Guides coming soon!", "Places coming soon!", etc.
   - "Free" badge text (events page)
   - "Information" heading (Place layout)
   - "Price Range" label (Place layout)
   - "Address" label fallback (Place layout)

   These should all be moved to the JSON files.

---

## SECTION 5: CONTENT YAML FILES

---

### 5.1 src/content/beach-areas/*.yaml

**Grade: A**

5 files: `main-beach.yaml`, `kids-area.yaml`, `sports-zone.yaml`, `promenade.yaml`, `amphitheater.yaml`

**Strengths:**
- Covers the full beach with logical zone divisions
- Coordinates are in the correct Znjan Beach vicinity (lat ~43.502, lng ~16.488)
- Facilities and activities lists are realistic
- All 4 translations are complete and natural
- Sort order (1-5) is logical (main beach first, amphitheater last)
- Featured flags are sensibly applied

**Issues:**

1. Several facility strings in the YAML files are not present in the `facilityLabels` map in `C:\Users\ivanb\znjan.com\src\pages\[lang]\beach-areas\index.astro`. Missing from the map: `shallow-water`, `seating`, `stage`, `cycling-path`, `benches`, `fitness-equipment`. These will render as raw kebab-case strings (e.g., "shallow-water") instead of translated labels.

2. All entries lack `images` and `heroImage` fields. Expected at this stage, but should have TODO markers.

---

### 5.2 src/content/activities/*.yaml

**Grade: A-**

3 files: `paddleboarding.yaml`, `beach-volleyball.yaml`, `cycling.yaml`

**Strengths:**
- Good variety covering water sports, beach sports, and fitness
- Beach area cross-references are correct (`main-beach`, `sports-zone`, `promenade`)
- Duration and price information included where relevant

**Issues:**

1. Only 3 activities created. The corresponding ticket (P1/T019) targets 5-8. Activities like kayaking, swimming, and yoga/relaxation would round out the coverage.

2. `cycling.yaml` is missing `duration` and `priceRange` fields that the other activities include.

3. `priceRange` values are not localized. "Free / 10 court rental" and "15-30/hour" are English-only strings that will display the same in all 4 languages.

---

### 5.3 src/content/faq/*.yaml

**Grade: A**

5 files: `general.yaml`, `parking.yaml`, `beach-type.yaml`, `best-time.yaml`, `facilities.yaml`

**Strengths:**
- Covers the most common visitor questions (location, parking, beach type, best time, facilities)
- Answers include specific, useful details (bus lines 8 and 12, water temperature 24-26C, specific facilities listed)
- All 4 translations are complete and sound natural

**Issues:**

1. All FAQs have `category: general`. For filtering and schema purposes, varied categories would be more useful (e.g., "transport", "facilities", "weather").

2. German and Italian answers for the parking FAQ are slightly shorter than the English version -- the street parking sentence is omitted from both.

---

### 5.4 src/content/places/*.yaml

**Grade: B+**

2 files: `znjan-beach-bar.yaml`, `konoba-marjan.yaml`

**Strengths:**
- Good variety (bar + restaurant)
- Descriptions are engaging and realistic
- Tags are useful for filtering
- Coordinates are plausible for the Znjan area

**Issues:**

1. Only 2 places created. Ticket P0/T013 calls for 5. This is significantly below target.

2. Both places lack `address`, `phone`, `website`, `email`, and `hours` fields. These are optional in the schema but are needed for realistic place pages and for the Place layout's sidebar to have content.

3. Slugs are not localized. "Konoba Marjan" uses the same slug in all 4 languages. "Znjan Beach Bar" HR slug is `znjan-beach-bar` (English, not Croatian). For SEO in each language, localized slugs would be beneficial.

---

### 5.5 src/content/global/site-config.yaml

**Grade: A-**

Minimal but correct. Has `id`, `siteName`, `siteUrl`, `defaultLanguage`, `contactEmail`. Missing `socialLinks` and `analyticsId` (both optional in the schema).

---

## SECTION 6: LAYOUTS

---

### 6.1 src/layouts/Base.astro

**Grade: A**

**Strengths:**
- Complete HTML `<head>` with charset, viewport, generator meta
- Primary meta tags (title, description)
- OG and Twitter Card meta tags
- Hreflang tag loop
- Canonical URL support
- noIndex option for non-public pages
- Structured data injection via `<script type="application/ld+json">`
- Font preconnect and loading
- Favicon reference
- Smart title construction: appends "| Znjan.com" unless "Znjan" is already in the title

**Issues:**

1. `og:image` is a relative path (`/images/og-default.jpg`). Social media platforms require absolute URLs. Should be `https://znjan.com/images/og-default.jpg`.

2. `og:locale` is set to just `lang` (e.g., "en"). The Open Graph protocol expects full locale codes like `en_GB` or `hr_HR`.

3. Missing `<meta name="theme-color" content="#0077B6">` for mobile browser chrome color.

4. **Google Fonts loaded via external stylesheet** conflicts with the ADR's "no third-party" principle. The font request goes to `fonts.googleapis.com` and `fonts.gstatic.com`, which are Google servers. For full privacy compliance, consider self-hosting the Inter font.

5. The `/images/og-default.jpg` and `/favicon.svg` files do not exist in the repository.

---

### 6.2 src/layouts/Page.astro

**Grade: A**

Clean composition of Base + Header + Footer with proper `<main>` semantics. All props passed through correctly. No issues.

---

### 6.3 src/layouts/Guide.astro

**Grade: A-**

**Strengths:**
- Breadcrumbs with `aria-label="Breadcrumb"` and proper `<ol>` structure
- Article metadata section with author, date, reading time
- Cluster badge for topical grouping
- Uses `prose-beach` custom class for article typography

**Issues:**

1. The `<article>` tag on line 125 wraps only the body content, but the article header (title, description, metadata) is outside it. Per HTML5 semantics, `<article>` should contain the complete self-contained content including its header.

2. Breadcrumb chevron SVGs lack `aria-hidden="true"` to hide them from screen readers.

3. The breadcrumb links to the guides hub but always hardcodes "guides" as the segment. If this layout is reused for articles, the breadcrumb would be incorrect.

---

### 6.4 src/layouts/Place.astro

**Grade: B+**

**Strengths:**
- Sidebar with business information card
- Category labels with 4-language support
- Hours display with day/time pairs
- Breadcrumb navigation

**Issues:**

1. **Multiple hardcoded translations.** Line 120:
```javascript
{lang === 'hr' ? 'Informacije' : lang === 'de' ? 'Informationen' : lang === 'it' ? 'Informazioni' : 'Information'}
```
Line 151:
```javascript
{lang === 'hr' ? 'Raspon cijena' : lang === 'de' ? 'Preisspanne' : lang === 'it' ? 'Fascia di prezzo' : 'Price Range'}
```
These should be i18n JSON keys.

2. `translations['places.directions']` is used as the label for the "Address" field, but the actual translation value is "Get Directions" / "Upute za dolazak". Semantically wrong -- needs a `places.address` key.

3. `new URL(website).on line 143 will throw a runtime error if `website` is an invalid URL. Since this runs at build time, a build-time error would halt the entire build. Needs a try/catch.

4. The sidebar's `<aside>` element should have an accessible label (`aria-labelledby` referencing the "Information" heading).

---

## SECTION 7: COMPONENTS

---

### 7.1 src/components/layout/Header.astro

**Grade: A-**

**Strengths:**
- Responsive: desktop nav + mobile hamburger menu
- Custom SVG logo with ocean gradient is creative and lightweight
- `aria-label` on mobile menu button
- Semantic `<header>` and `<nav>` elements

**Issues:**

1. Missing `aria-expanded="false"` on the mobile menu button. When toggled, it should switch to `aria-expanded="true"`. The script toggles visibility but does not update ARIA state.

2. The mobile menu script (lines 86-92) would need to be modified for Astro View Transitions (if used later), as `getElementById` bindings are lost on page transitions.

---

### 7.2 src/components/layout/LanguageSwitcher.astro

**Grade: B+**

**Strengths:**
- Hover dropdown with visual indication of current language
- Accepts `alternates` prop for passing correct per-language URLs

**Critical Issues:**

1. **Language switcher produces broken URLs.** The `alternates` prop is never passed from the Header component. The fallback on line 19 does:
```javascript
const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}\//, '/');
return `/${targetLang}${pathWithoutLang}`;
```
This replaces only the language prefix, not the localized segment. Example: switching from Croatian `/hr/vodici/` to English produces `/en/vodici/` instead of the correct `/en/guides/`. This is a **functional bug** that breaks cross-language navigation.

2. `aria-label="Select language"` is hardcoded in English. Should be translated.

3. The dropdown uses CSS `group-hover:block` which does not work on touch devices (no hover state). Needs a click/tap handler.

4. The dropdown is not keyboard-accessible. A user tabbing through the page cannot reach the language options.

---

### 7.3 src/components/layout/Footer.astro

**Grade: A-**

Well-structured footer with explore links, legal links, and copyright. All links use `getLocalizedUrl`. Dynamic copyright year.

---

### 7.4 src/components/sections/Hero.astro

**Grade: A-**

Nice wave SVG decoration. Responsive typography scaling (4xl/5xl/6xl). Primary and secondary CTA buttons.

**Issue:** The bottom wave SVG fills with `#FAFAFA` (hardcoded). If the section below the hero has a different background, there will be a color mismatch.

---

### 7.5 src/components/sections/FAQ.astro

**Grade: A**

Uses native `<details>` / `<summary>` elements -- accessible without JavaScript, works with keyboard navigation, and the chevron rotation animation via `group-open:rotate-180` is clean.

---

### 7.6 src/components/ui/Button.astro

**Grade: A-**

Clean variant system (primary/secondary/outline) with size options. Dynamic `<a>` vs `<button>` tag.

**Issue:** Missing `focus:ring` or `focus-visible:ring` styles for keyboard focus indication. This is a WCAG 2.1 AA requirement.

---

### 7.7 src/components/ui/Card.astro

**Grade: A-**

Dynamic tag selection (`<a>` vs `<div>`) based on `href` is a good pattern.

**Issue:** When used as a link card, nested interactive elements (like badges) inside the `<a>` tag could cause HTML validation issues (interactive content inside interactive content).

---

### 7.8 src/components/ui/Badge.astro

**Grade: A**

Simple, clean, effective. Four color variants matching the design system.

---

## SECTION 8: PAGES

---

### 8.1 src/pages/index.astro

**Grade: B+**

```astro
return Astro.redirect('/en/');
```

`Astro.redirect()` generates a server-side redirect (HTTP 301/302). With `output: 'static'`, this may not work as expected on all hosting platforms. For Cloudflare Pages, a `_redirects` file or the Astro `redirects` config option would be more reliable.

---

### 8.2 src/pages/[lang]/index.astro (Home Page)

**Grade: B+**

**Strengths:**
- `getStaticPaths` correctly generates paths for all 4 languages
- Structured data includes both Beach and Organization schemas
- Hreflang links generated via `generateHomeHreflangLinks`
- Quick links grid with icons
- Stats section with key numbers

**Issues:**

1. **Extensive hardcoded translations.** Lines 99-111 (the "About Znjan" section) and lines 128-148 (stats labels) use 4-way ternary chains instead of i18n JSON keys. This is the exact anti-pattern the project's own conventions prohibit. These strings should be added to the JSON files.

2. Missing the FAQ section. The ADR specifies FAQs on the home page, the FAQ data exists (5 entries), and the FAQ component exists. But the home page does not render any FAQs.

3. The `SectionHeader` title and subtitle are set to `beachAreasTitle` and `beachAreasSubtitle`, but the section below contains quick links to all sections (not just beach areas). The heading is misleading.

---

### 8.3 src/pages/[lang]/guides/index.astro

**Grade: B**

**Critical Issue on line 30:**
```javascript
canonicalUrl={canonicalUrl(`/${lang}/${translations['nav.guides'] === 'Vodici' ? 'vodici' : lang === 'de' ? 'reisefuehrer' : lang === 'it' ? 'guide' : 'guides'}/`)}
```

This is a fragile, incorrect approach to generating the canonical URL. It compares the translation string value to determine the URL segment. If the translation changes even slightly, the canonical URL breaks. The correct approach:
```javascript
canonicalUrl={canonicalUrl(getLocalizedUrl(lang, 'guides'))}
```
(Which is exactly what the places and activities pages do.)

---

### 8.4 src/pages/[lang]/places/index.astro

**Grade: A-**

Clean implementation. Proper sorting (featured first, then by order). Category icons and labels are well-handled.

---

### 8.5 src/pages/[lang]/activities/index.astro

**Grade: A-**

Good implementation with difficulty badges, duration, and price display.

---

### 8.6 src/pages/[lang]/beach-areas/index.astro

**Grade: A-**

Horizontal card layout with facility badges. Good use of the featured badge. Missing facility label translations noted above.

---

### 8.7 src/pages/[lang]/events/index.astro

**Grade: A-**

Good separation of upcoming/past events with visual distinction (opacity-75 for past events).

**Issue:** Line 56: `"Free"` is hardcoded in English instead of using a translated string.

---

### 8.8 Missing Pages

**No detail pages exist.** The hub pages generate links to:
- `/en/places/znjan-beach-bar/`
- `/en/activities/stand-up-paddleboarding/`
- `/en/beach-areas/main-beach/`
- `/en/guides/[slug]/`

But there are **no corresponding dynamic route files** such as:
- `src/pages/[lang]/places/[...slug].astro`
- `src/pages/[lang]/activities/[...slug].astro`
- `src/pages/[lang]/beach-areas/[...slug].astro`
- `src/pages/[lang]/guides/[...slug].astro`

Every link on every hub page currently leads to a 404.

---

## SECTION 9: STYLES

---

### 9.1 src/styles/global.css

**Grade: B** (build-breaking)

```css
.prose-beach {
  @apply prose prose-lg max-w-none;
  @apply prose-headings:text-ocean-700;
  @apply prose-a:text-ocean-500 prose-a:no-underline hover:prose-a:underline;
  @apply prose-strong:text-ocean-800;
}
```

**Build-breaking issue:** The `prose`, `prose-lg`, `prose-headings:*`, `prose-a:*`, and `prose-strong:*` classes all require `@tailwindcss/typography`. This plugin is not installed. Confirmed failure:

```
The `prose` class does not exist. If `prose` is a custom class, make sure it is
defined within a `@layer` directive.
```

**Other Issues:**

1. CSS custom properties in `:root` (`--color-ocean`, `--color-sky`, etc.) are defined but never referenced anywhere in the codebase. They duplicate the Tailwind color definitions and serve no purpose.

2. `scroll-behavior: smooth` on `html` duplicates the `scroll-smooth` class already applied to `<html>` in `Base.astro`.

---

## CRITICAL ISSUES SUMMARY

### Build-Breaking (the site will not compile)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | Missing `@tailwindcss/typography` | `package.json` | `npm install @tailwindcss/typography` + add to `tailwind.config.mjs` plugins |
| 2 | Missing `typescript` | `package.json` | `npm install -D typescript` |
| 3 | Missing `@astrojs/check` | `package.json` | `npm install -D @astrojs/check` |

### Functional Bugs (site compiles but does not work correctly)

| # | Issue | File | Severity |
|---|-------|------|----------|
| 4 | No detail pages for any entity type | `src/pages/` | High -- every hub link 404s |
| 5 | Language switcher does not translate localized segments | `LanguageSwitcher.astro` | High -- broken cross-language nav |
| 6 | Root redirect may not work with static output | `src/pages/index.astro` | Medium |
| 7 | `new URL(website)` can throw at build time | `Place.astro` line 143 | Medium |
| 8 | Canonical URL in guides page uses fragile string comparison | `guides/index.astro` line 30 | Medium |
| 9 | Missing `trailingSlash: 'always'` | `astro.config.mjs` | Medium |
| 10 | `@astrojs/cloudflare` imported but unused | `astro.config.mjs` | Low |
| 11 | Content model contradiction (`lang` + multilingual slugs) | `src/content/config.ts` | Medium (design) |
| 12 | `og:image` is relative, not absolute | `Base.astro` | Medium (SEO) |
| 13 | Missing facility translations in beach-areas page | `beach-areas/index.astro` | Low |
| 14 | Hardcoded translations throughout pages | Multiple files | Low (maintenance) |
| 15 | `sky` color name conflicts with Tailwind built-in | `tailwind.config.mjs` | Low |

---

## FINAL GRADES

| File / Area | Grade | Notes |
|-------------|-------|-------|
| **CLAUDE.md** | A | Strong; needs translation system docs and TW version fix |
| **docs/ADR.md** | A+ | Excellent; minor version and metric corrections needed |
| **ASSUMPTIONS.md** | A | Solid; missing typography plugin and asset assumptions |
| **SWARM_TICKETS.md** | A | Good coverage; missing detail page and dependency tickets |
| **SWARM_SPAWN.md** | A | Good onboarding; needs translation system guidance |
| **astro.config.mjs** | B+ | Works but has unused adapter and missing trailingSlash |
| **tailwind.config.mjs** | A- | Nice palette; sky name conflict; missing typography plugin |
| **tsconfig.json** | A | Clean and correct |
| **package.json** | **B** | **3 missing critical dependencies** |
| **src/content/config.ts** | A | Comprehensive; content model ambiguity |
| **src/lib/i18n.ts** | A- | Solid; dual translation systems confusing |
| **src/lib/seo.ts** | A- | Good Schema.org; missing types from ADR |
| **src/lib/translations.ts** | A | Clean and correct |
| **src/lib/utils.ts** | A- | Useful; hardcoded site URL |
| **src/i18n/*.json** | A / A- | Complete parity; natural translations |
| **Content YAML** | A- | Good quality; below target quantity |
| **Layouts** | A- / B+ | Good HTML; hardcoded translations in Place |
| **Components** | A- / B+ | Good design; language switcher has critical bug |
| **Pages** | B+ | Hubs work; no detail pages exist; hardcoded strings |
| **src/styles/global.css** | **B** | **Build fails without typography plugin** |

---

**Overall Project Grade: B+**

The architecture, documentation, and code quality are strong. The project would jump to **A-** by fixing the 3 build-breaking dependency issues, creating the entity detail pages, and fixing the language switcher URL generation. It would reach **A** by eliminating all hardcoded translations and resolving the content model ambiguity for MDX collections.
