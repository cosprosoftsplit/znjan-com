# Swarm Spawn — znjan.com Worker Onboarding

> **Version:** 1.0
> **Date:** 2026-02-26
> **Purpose:** Onboarding guide for AI agents (workers) joining the znjan.com project

---

## Project Overview

**znjan.com** is a comprehensive beach portal for Znjan Beach in Split, Croatia. It's a static Astro site with 4-language support (EN, HR, DE, IT), deployed to Cloudflare Pages.

**Read these files before starting any work:**
1. `CLAUDE.md` — Full project context, stack, conventions
2. `docs/ADR.md` — Architecture decisions and rationale
3. `ASSUMPTIONS.md` — What we assume and what's risky
4. `SWARM_TICKETS.md` — Full ticket backlog with priorities

---

## Stack Quick Reference

| What | Technology |
|------|-----------|
| Framework | Astro 5.x (SSG, TypeScript strict) |
| Content | MDX (prose) + YAML (data), Zod validation |
| Styling | Tailwind CSS 4 with Mediterranean design tokens |
| Hosting | Cloudflare Pages |
| Maps | Leaflet + OpenStreetMap |
| Search | Pagefind |

---

## Critical Conventions

### 1. Content Collections
- All content collections are defined in `src/content/config.ts` with Zod schemas
- **Every schema change must pass `npm run astro check`**
- Content files use **single-file multilingual pattern** — one file per entity with translations inline

### 2. i18n Rules
- **4 languages:** EN (default), HR, DE, IT
- URL pattern: `/[lang]/[localized-segment]/[slug]/`
- Route segments are localized (see `CLAUDE.md` for mapping table)
- **UI strings** live in `src/i18n/{lang}.json`
- **Content translations** live in content files as multilingual fields
- **NEVER hardcode user-facing text** — always use i18n strings or content fields
- Run `npm run check-i18n` before committing — it must pass

### 3. Component Patterns
- Use `.astro` components by default (no framework runtime)
- Only use client-side islands (React/Preact) for interactivity (maps, search)
- Components go in `src/components/{category}/` (ui, sections, layout, maps, widgets)
- Keep components small and focused — one responsibility each

### 4. Styling Rules
- Use Tailwind utility classes — avoid custom CSS except for design tokens
- Design tokens are in `src/styles/global.css` and `tailwind.config.mjs`
- Mediterranean palette: blues (`ocean-*`), sand (`sand-*`), coral (`coral-*`)
- Mobile-first responsive design

### 5. SEO Requirements
- Every page needs: title, description, canonical URL, hreflang tags
- Structured data (Schema.org JSON-LD) on every page via `Base.astro`
- Breadcrumbs on all pages except home
- Internal linking between related content (guides ↔ places ↔ activities)

### 6. Affiliate Links
- Always use `rel="sponsored noopener"`
- Track via UTM parameters: `?utm_source=znjan&utm_medium=affiliate&utm_campaign=[slug]`
- Mark sponsored content with `is_sponsored: true` in frontmatter

---

## Working on a Ticket

### Before Starting
1. Read the ticket description in `SWARM_TICKETS.md`
2. Check dependencies — some tickets depend on others
3. Read relevant existing code to understand context
4. Check `CLAUDE.md` for conventions

### While Working
1. Keep changes focused — one ticket per branch/session
2. Follow existing patterns in the codebase
3. Add translations for all 4 languages (or add TODO stubs with `[TRANSLATE]` marker)
4. Write Zod schemas for any new data structures
5. Test with `npm run dev` and check multiple languages

### Before Completing
1. Run `npm run build` — must pass
2. Run `npm run astro check` — must pass
3. Run `npm run check-i18n` — must pass (or document known gaps)
4. Verify pages render correctly in at least EN and HR
5. Check structured data output in page source

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Content (YAML) | `kebab-case.yaml` | `joes-beach-bar.yaml` |
| Content (MDX) | `kebab-case.mdx` | `getting-here.mdx` |
| Components | `PascalCase.astro` | `LanguageSwitcher.astro` |
| Layouts | `PascalCase.astro` | `Base.astro` |
| Libraries | `kebab-case.ts` | `schema-helpers.ts` |
| i18n strings | `{lang}.json` | `hr.json` |
| Scripts | `kebab-case.ts` | `check-i18n.ts` |

---

## Content File Template (YAML — Data Collection)

```yaml
# src/content/places/example-place.yaml
id: example-place
slug:
  en: example-place
  hr: primjer-mjesto
  de: beispiel-ort
  it: luogo-esempio
title:
  en: "Example Place"
  hr: "Primjer Mjesto"
  de: "Beispiel Ort"
  it: "Luogo Esempio"
description:
  en: "A wonderful place at Znjan beach."
  hr: "Prekrasno mjesto na plaži Žnjan."
  de: "Ein wunderbarer Ort am Strand Žnjan."
  it: "Un posto meraviglioso sulla spiaggia di Žnjan."
category: restaurant
beachArea: main-beach
coordinates:
  lat: 43.5025
  lng: 16.4875
phone: "+385-21-123-456"
website: "https://example.com"
listingTier: free
featured: false
```

## Content File Template (MDX — Content Collection)

```mdx
---
id: getting-here
slug:
  en: getting-here
  hr: kako-doci
  de: anreise
  it: come-arrivare
title:
  en: "How to Get to Znjan Beach"
  hr: "Kako doći do plaže Žnjan"
  de: "Anreise zum Strand Žnjan"
  it: "Come arrivare alla spiaggia di Žnjan"
description:
  en: "Complete transport guide to Znjan Beach Split..."
  hr: "Kompletni vodič za prijevoz do plaže Žnjan..."
  de: "Kompletter Transportführer zum Strand Žnjan..."
  it: "Guida completa ai trasporti per la spiaggia di Žnjan..."
guide: complete-guide-znjan-beach
publishedAt: 2026-02-26
updatedAt: 2026-02-26
author: znjan-team
---

# How to Get to Znjan Beach

Content here...
```

---

## Common Pitfalls

1. **Forgetting a language** — Always add all 4 translations or use `[TRANSLATE]` marker
2. **Hardcoded strings** — Never put user-visible text directly in `.astro` files
3. **Missing slugs** — Every entity needs slugs in all 4 languages
4. **Schema validation** — Always run `npm run astro check` after schema changes
5. **Cross-references** — When linking entities (e.g., activity → beach-area), use the `id` field, not the slug
6. **Image paths** — Use `src/assets/` for optimized images, `public/images/` for static-only

---

## Quick Commands

```bash
npm run dev           # Start dev server at localhost:4321
npm run build         # Production build
npm run preview       # Preview production build
npm run astro check   # TypeScript + Astro diagnostics
npm run check-i18n    # Validate translation parity
npm run check-refs    # Validate entity cross-references
```
