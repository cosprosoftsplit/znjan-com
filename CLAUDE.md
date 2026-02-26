# znjan.com — AI Project Context

> **The definitive beach portal for Znjan Beach, Split, Croatia**
> Znjan Beach underwent a €45.5M transformation, reopening June 21, 2025 — "The Miami of Split."
> Our goal: become the source of truth for ALL Znjan-related queries on the internet.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5.x (SSG, static output) |
| Content | MDX + YAML with Zod validation |
| Styling | Tailwind CSS 3.4 + @tailwindcss/typography |
| Validation | Zod (build-time content validation) |
| Hosting | Cloudflare Pages (via GitHub) |
| Search | Pagefind (planned) |
| Analytics | Cloudflare Web Analytics (planned) |
| Maps | Leaflet + OpenStreetMap (planned) |
| Language | TypeScript (strict) |

## Architecture

- **Static-first** — All pages pre-rendered at build time (`output: 'static'`)
- **Content collections** — Astro content collections with Zod schemas for type safety
- **4-language i18n** — EN (default), HR, DE, IT
- **SEO-driven** — Topical clusters, structured data (Schema.org), hreflang tags
- **Edge-deployed** — Cloudflare Pages

## Translation System

Two systems exist — **prefer `translations.ts`** for all new code:

1. **`src/lib/translations.ts`** (PREFERRED) — Synchronous translation loader. Uses `getTranslations(lang)` and `t(lang, key)`. Statically imports all 4 JSON files and caches with a Map.
2. **`src/lib/i18n.ts`** — Core i18n utilities: `LANGUAGES`, `ROUTE_SEGMENTS`, `getLocalizedUrl`, `getLocalized`, etc. No async imports.

**Anti-pattern:** Do NOT use inline ternary chains for translations (e.g., `lang === 'hr' ? '...' : lang === 'de' ? '...'`). Add keys to the JSON translation files instead.

## Content Collections

| Collection | Type | Count | Purpose |
|-----------|------|-------|---------|
| `beach-areas` | data (YAML) | 5 | Beach zones: main beach, kids area, sports zone, promenade, amphitheater |
| `activities` | data (YAML) | 6 | Swimming, paddleboarding, volleyball, cycling, kayaking, snorkeling |
| `places` | data (YAML) | 7 | Palma, Taboo, Mistral, Casa Sol, Central Beach, MIMI, GAL Split |
| `guides` | content (MDX) | 0 | Pillar content — comprehensive guides (to be created) |
| `articles` | content (MDX) | 0 | Cluster articles — SEO content (to be created) |
| `events` | content (MDX) | 0 | Beach events, concerts, tournaments (to be created) |
| `news` | content (MDX) | 0 | Seasonal updates (to be created) |
| `faq` | data (YAML) | 5 | Structured FAQ for schema.org |
| `pages` | data (YAML) | 3 | About, contact, privacy |
| `global` | data (YAML) | 1 | Site config, navigation, footer |
| `redirects` | data (YAML) | 1 | URL mappings |

## i18n

| Aspect | Value |
|--------|-------|
| Languages | EN (default), HR, DE, IT |
| URL pattern | `/[lang]/[segment]/[slug]/` |
| Content storage | Single file per entity with multilingual fields |
| Route slugs | English segments in file system, localized content slugs |
| Validation | `npm run check-i18n` ensures translation parity |
| UI strings | 90 keys in each of 4 JSON files |

## Build Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # Production build (currently 100 pages)
npm run preview      # Preview production build
npm run check-i18n   # Validate translation parity across all 4 languages
npm run check-refs   # Validate entity cross-references
npx astro check      # TypeScript + Astro diagnostics
```

## Key Files

| File | Purpose |
|------|---------|
| `src/content/config.ts` | All 11 Zod schemas for content collections |
| `src/lib/i18n.ts` | i18n utilities, route helpers, language detection |
| `src/lib/translations.ts` | Synchronous translation loader (PREFERRED) |
| `src/lib/seo.ts` | Meta tag generation, structured data (Schema.org) |
| `src/layouts/Base.astro` | HTML shell, meta tags, OG, hreflang, structured data |
| `src/i18n/*.json` | UI string translations (4 files, 90 keys each) |
| `astro.config.mjs` | Astro config with i18n, sitemap, trailing slash |
| `scripts/check-i18n.ts` | Build-time translation parity validation |
| `scripts/check-refs.ts` | Build-time entity reference validation |
| `docs/research/znjan-businesses-ground-truth.md` | Verified business directory |

## Design Tokens (Tailwind)

| Token | Usage |
|-------|-------|
| `ocean-*` | Primary blues (brand, links, headers) |
| `adriatic-*` | Secondary blues (accents) |
| `aqua-*` | Light blues (highlights) |
| `sand-*` | Warm tones (backgrounds, badges) |
| `coral-*` | Accent reds (CTAs, alerts) |
| `warm-*` | Neutrals (text, borders) |

## CSS Classes

- `container-page` — Page-width container with responsive padding
- `prose-beach` — Typography styles for content areas (via @tailwindcss/typography)

## Patterns & Conventions

- **Content files** use single-file multilingual pattern: one YAML/MDX per entity with `title.en`, `title.hr`, etc.
- **Slugs** defined per-language: `slug: { en: "getting-here", hr: "kako-doci", ... }`
- **Schema.org** structured data injected via `Base.astro` using `structuredData` prop
- **Components** are `.astro` files (no React/Vue) unless client-side interactivity is required
- **Place categories:** restaurant, bar, beach-club, cafe, shop, hotel, other
- **Error handling** — Content validation at build time via Zod; missing translations fail the build
- **Ground truth** — All factual claims must be verified against `docs/research/` documents
- **Businesses** — Only post-June 2025 businesses are listed. See `docs/research/znjan-businesses-ground-truth.md`

## Deployment

- **Platform:** Cloudflare Pages
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Deployment:** GitHub → CF Pages (auto-deploy on push to main)
