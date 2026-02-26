# Architecture Decision Record — znjan.com

> **Version:** 1.0
> **Date:** 2026-02-26
> **Status:** Accepted
> **Author:** Genesis (AI-assisted)

---

## 1. Project Overview

**znjan.com** is a comprehensive beach portal for Znjan Beach in Split, Croatia — recently transformed via a €45M investment ("Miami of Split"). No dedicated portal exists. This project aims to become the definitive online resource for the beach.

**Goals:**
- Tourism information hub (visitor essentials, activities, places)
- Local business directory (restaurants, bars, shops)
- Content/SEO authority (topical clusters, guides)
- Community hub (events, news, seasonal updates)
- Revenue via affiliate links, business listings, display ads

**Audience:** Tourists, locals, digital nomads, travel planners
**Languages:** EN (default) + HR + DE + IT

---

## 2. Tech Stack Decisions

### 2.1 Framework — Astro 5.x

**Decision:** Use Astro 5.x as the framework with SSG (Static Site Generation).

**Confidence:** 0.95

**Rationale:**
- Content-first architecture is ideal for a portal site
- Content collections with Zod validation provide type-safe content at build time
- SSG produces fast, CDN-friendly static files
- Proven across 5+ projects in this ecosystem (cosmic-production-web, ivanboban-com, etc.)
- Island architecture allows selective hydration for interactive components (maps, search)

**Alternatives considered:**
- **Next.js** — Overkill for a content site; SSR complexity unnecessary
- **Hugo** — No TypeScript ecosystem; less flexible content modeling
- **11ty** — Viable but lacks Astro's component model and image pipeline

### 2.2 Content — MDX + YAML with Zod Validation

**Decision:** Use MDX for long-form content (guides, articles) and YAML for structured data (places, activities, FAQ). All validated with Zod schemas.

**Confidence:** 0.90

**Rationale:**
- MDX allows rich content with embedded components (affiliate blocks, maps)
- YAML is clean for structured entity data
- Zod schemas catch content errors at build time — critical for 4-language content
- No external CMS dependency at launch (can add later if needed)

**Alternatives considered:**
- **Headless CMS (Sanity, Strapi)** — Premature; adds complexity, hosting cost, and latency
- **Markdown only** — Insufficient for structured multilingual data
- **JSON** — More verbose than YAML for content files

### 2.3 Styling — Tailwind CSS 4

**Decision:** Use Tailwind CSS 4 for styling with custom design tokens.

**Confidence:** 0.95

**Rationale:**
- Utility-first approach enables rapid iteration
- Consistent with other projects in the ecosystem
- Custom Mediterranean color palette via design tokens
- Excellent responsive design support
- Tree-shaking produces minimal CSS bundles

**Alternatives considered:**
- **CSS Modules** — Slower development velocity
- **Styled Components** — Requires React runtime
- **Vanilla CSS** — Too slow for initial build phase

### 2.4 Hosting — Cloudflare Pages

**Decision:** Deploy to Cloudflare Pages with Workers for dynamic endpoints.

**Confidence:** 0.95

**Rationale:**
- Edge network with 300+ PoPs globally
- Generous free tier (500 builds/month, unlimited bandwidth)
- Proven deployment pipeline across existing projects
- Workers for serverless form handling (GDPR-friendly, no third-party data transfer)
- Web Analytics included (privacy-friendly, no cookies)

**Alternatives considered:**
- **Vercel** — Works well but Cloudflare is the established standard
- **Netlify** — Similar to Vercel; no advantage over CF
- **Self-hosted** — Unnecessary complexity

### 2.5 Search — Pagefind

**Decision:** Use Pagefind for static site search.

**Confidence:** 0.90

**Rationale:**
- Indexes at build time, runs entirely client-side
- No external service dependency
- Proven in cosmic-production-web
- Supports multiple languages
- Tiny bundle size (~150KB including index)

**Alternatives considered:**
- **Algolia** — Paid, overkill for launch
- **Lunr.js** — Older, less feature-rich
- **Meilisearch** — Requires server

### 2.6 Maps — Leaflet + OpenStreetMap

**Decision:** Use Leaflet with OpenStreetMap tiles for interactive maps.

**Confidence:** 0.90

**Rationale:**
- Free, no API key required
- Privacy-friendly (no Google tracking)
- Open source with rich plugin ecosystem
- Lightweight (~40KB)
- Perfect for showing beach zones, places, and facilities

**Alternatives considered:**
- **Google Maps** — Paid after quota, tracking concerns, API key management
- **Mapbox** — Paid tier needed for production traffic
- **Static map images** — Insufficient interactivity

### 2.7 Analytics — Cloudflare Web Analytics

**Decision:** Use Cloudflare Web Analytics exclusively.

**Confidence:** 0.85

**Rationale:**
- Privacy-friendly, no cookies required
- No GDPR consent banner needed (significant for 4-language site)
- Free with Cloudflare Pages
- Core metrics (page views, visitors, Web Vitals) sufficient for launch

**Alternatives considered:**
- **Google Analytics 4** — GDPR overhead with consent management across 4 languages
- **Plausible** — Paid; CF analytics is free and sufficient
- **Fathom** — Paid; same reasoning

---

## 3. Content Architecture

### 3.1 Entity Model — Content Collections

| # | Collection | Type | Storage | Has Pages | Languages | Confidence |
|---|-----------|------|---------|-----------|-----------|------------|
| 1 | `beach-areas` | data | YAML | Yes | All 4 | 0.90 |
| 2 | `activities` | data | YAML | Yes | All 4 | 0.90 |
| 3 | `places` | data | YAML | Yes | All 4 | 0.85 |
| 4 | `guides` | content | MDX | Yes | All 4 | 0.90 |
| 5 | `articles` | content | MDX | Yes | All 4 | 0.90 |
| 6 | `events` | content | MDX | Yes | All 4 | 0.85 |
| 7 | `news` | content | MDX | Yes | All 4 | 0.80 |
| 8 | `faq` | data | YAML | No | All 4 | 0.90 |
| 9 | `pages` | data | YAML | Yes | All 4 | 0.90 |
| 10 | `global` | data | YAML | No | All 4 | 0.95 |
| 11 | `redirects` | data | YAML | No | N/A | 0.95 |

**Open question (places):** How far from the beach should the directory extend? Current assumption: ~500m radius. Needs human validation.

### 3.2 Entity Relationships

```
beach-areas ──▶ activities     (activities available in each area)
beach-areas ──▶ places         (places near each area)
guides      ──▶ activities     (guides reference activities)
guides      ──▶ beach-areas    (guides reference areas)
articles    ──▶ guides         (articles cluster under guides)
articles    ──▶ places         (articles reference places)
events      ──▶ places         (events happen at places)
events      ──▶ beach-areas    (events happen at areas)
```

Cross-references validated at build time via `npm run check-refs`.

### 3.3 Multilingual Content Strategy

**Single-file multilingual pattern:**

```yaml
# src/content/places/joe-bar.yaml
id: joe-bar
slug:
  en: joes-beach-bar
  hr: joein-beach-bar
  de: joes-strandbar
  it: bar-sulla-spiaggia-joe
title:
  en: "Joe's Beach Bar"
  hr: "Joein Beach Bar"
  de: "Joe's Strandbar"
  it: "Bar sulla Spiaggia Joe"
description:
  en: "Cocktails with a view..."
  hr: "Kokteli s pogledom..."
  de: "Cocktails mit Aussicht..."
  it: "Cocktail con vista..."
```

**Rationale:** Single file per entity keeps translations together, prevents drift, and enables build-time parity validation.

---

## 4. i18n Architecture

### 4.1 URL Strategy

**Decision:** Localized route segments with language prefix.

**Confidence:** 0.75

**Pattern:** `/[lang]/[localized-segment]/[localized-slug]/`

**Examples:**
- EN: `/en/guides/getting-here/`
- HR: `/hr/vodici/kako-doci/`
- DE: `/de/reisefuehrer/anreise/`
- IT: `/it/guide/come-arrivare/`

**Rationale:**
- Localized URLs improve SEO in each language
- Language prefix enables clean routing and language detection
- `/en/` is the default (primary tourist audience)

**Risk:** 4-language i18n with localized slugs is significantly more complex than 2-language implementations. This is the highest-complexity area of the project.

### 4.2 Translation Workflow

1. **UI strings** — JSON files (`src/i18n/{lang}.json`) for navigation, buttons, labels
2. **Content** — Multilingual fields in YAML/MDX files
3. **Build validation** — `npm run check-i18n` fails if any translation is missing
4. **Initial translations** — AI-assisted for DE/IT, human-reviewed for HR/EN

### 4.3 Hreflang Implementation

All pages include hreflang tags for all 4 languages plus `x-default` pointing to EN.

```html
<link rel="alternate" hreflang="en" href="https://znjan.com/en/guides/getting-here/" />
<link rel="alternate" hreflang="hr" href="https://znjan.com/hr/vodici/kako-doci/" />
<link rel="alternate" hreflang="de" href="https://znjan.com/de/reisefuehrer/anreise/" />
<link rel="alternate" hreflang="it" href="https://znjan.com/it/guide/come-arrivare/" />
<link rel="alternate" hreflang="x-default" href="https://znjan.com/en/guides/getting-here/" />
```

---

## 5. SEO Architecture

### 5.1 Topical Clusters

| Cluster | Type | Pillar Guide | # Articles |
|---------|------|-------------|------------|
| Visitor Essentials | BOFU | Complete Guide to Znjan Beach Split | 6 |
| Activities & Sports | MOFU | Things to Do at Znjan Beach | 4 |
| Food & Drink | MOFU/BOFU | Where to Eat & Drink at Znjan Beach | 3 |
| Split Beaches | TOFU | Best Beaches in Split | 4 |
| The Transformation | TOFU | The €45M Transformation of Znjan Beach | 3 |

**Confidence:** 0.85

### 5.2 Structured Data (Schema.org)

| Page Type | Schema Types |
|-----------|-------------|
| Home | TouristDestination + Beach + BreadcrumbList |
| Place (restaurant) | Restaurant + BreadcrumbList + FAQPage |
| Place (bar) | BarOrPub + BreadcrumbList |
| Activity | TouristAttraction + Offer + BreadcrumbList |
| Guide/Article | Article + author + BreadcrumbList + FAQPage |
| Event | Event + location + BreadcrumbList |
| Beach Area | Beach + Place + BreadcrumbList |

**@id strategy:**
- `https://znjan.com/#beach` — Main beach entity
- `https://znjan.com/#organization` — Znjan.com publisher
- `https://znjan.com/#place-[slug]` — Individual places
- `https://znjan.com/#activity-[slug]` — Activities

---

## 6. Monetization Architecture

| Channel | Implementation | Priority | Confidence |
|---------|---------------|----------|------------|
| Affiliate links | Booking.com, GetYourGuide, Viator in guides/activities | P1 | 0.90 |
| Business listings | `listing_tier` field (free/featured/premium) in places | P1 | 0.85 |
| Display ads | Reserved ad slot divs in article/guide templates | P2 | 0.80 |
| Sponsored content | `is_sponsored` flag on articles/guides | P2 | 0.80 |

---

## 7. Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | >90 |
| Lighthouse Accessibility | >95 |
| Lighthouse SEO | >95 |
| LCP | <2.5s |
| FID | <100ms |
| CLS | <0.1 |
| Total page weight (home) | <500KB |

---

## 8. Security & Privacy

- No cookies required (CF Analytics is cookieless)
- No third-party trackers
- Form data processed by Cloudflare Workers (stays on CF edge, GDPR-friendly)
- Affiliate links use `rel="sponsored noopener"` with no PII transfer
- CSP headers configured at Cloudflare level
- HTTPS enforced via Cloudflare

---

## 9. Risk Register

| Risk | Impact | Likelihood | Mitigation | Confidence |
|------|--------|-----------|------------|------------|
| 4-language i18n complexity | High | Medium | Build-time validation, progressive rollout (EN+HR first) | 0.75 |
| DE/IT translation quality | Medium | High | AI-assisted + human review workflow | 0.70 |
| Places directory scope creep | Medium | Medium | Defined 500m radius, human review of boundary | 0.80 |
| Content volume for launch | Medium | Medium | Prioritize Cluster 1 (Visitor Essentials) first | 0.85 |
| Pagefind multilingual support | Low | Low | Well-tested in other projects, fallback to per-language index | 0.90 |

---

## 10. Decision Log

| # | Decision | Date | Rationale |
|---|---------|------|-----------|
| 1 | Astro 5.x over Next.js | 2026-02-26 | Content site, SSG preferred, proven stack |
| 2 | MDX+YAML over headless CMS | 2026-02-26 | No external dependency, build-time validation |
| 3 | Cloudflare Pages over Vercel | 2026-02-26 | Established deployment standard |
| 4 | Pagefind over Algolia | 2026-02-26 | Free, static, privacy-friendly |
| 5 | Leaflet over Google Maps | 2026-02-26 | Free, no API key, privacy-friendly |
| 6 | Single-file multilingual pattern | 2026-02-26 | Keeps translations together, prevents drift |
| 7 | Localized route segments | 2026-02-26 | SEO benefit per language |
| 8 | EN as default language | 2026-02-26 | Primary tourist audience |
| 9 | CF Web Analytics over GA4 | 2026-02-26 | No cookies, no GDPR banner needed |
| 10 | No CMS at launch | 2026-02-26 | Can add later; reduces launch complexity |
