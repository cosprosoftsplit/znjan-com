# SEO Fixes & Future Roadmap — znjan.com

> Companion to [`deliverables/gsc-query-gap-analysis.md`](../deliverables/gsc-query-gap-analysis.md) (the GSC diagnosis).
> Produced from a 6-agent design workflow on 2026-06-02. Two tracks: **NOW** (fix the current status) and **FUTURE** (build, after the now-fixes ship).

## Diagnosis in one line

The canonical/SEO code layer is already correct (canonical tags + sitemap + hreflang all hardcode `https://znjan.com`). The problems are: (1) a missing **Cloudflare host-level 301** lets the insecure `http://www.znjan.com/` hoard 81% of impressions at 0.06% CTR; (2) **30 stale 404s** (cross-language slug mismatches — already code-fixed in the latest commit, but the indexed URLs need 301s — plus deleted events and legacy WordPress paths); (3) the **money guides are internal-linking orphans** mis-titled for "Žnjan Beach" while demand is "in Split"; (4) **venue pages** are thin directory cards with no intent-rich titles or Restaurant/Hotel schema.

---

## NOW — current-status fixes

Legend: ✅ done · ⬜ pending · 🔒 needs production access · 👤 needs owner data
Sequencing matters — shared files (`src/i18n/*.json`, `seo.ts`, `config.ts`, `astro.config.mjs`, place template) are each edited once, in order.

### Code (shipped in this change)

| # | Step | Files | Impact |
|---|------|-------|--------|
| 1 | **All path-level 301s in one `astro.config.mjs` edit** — cross-lang slug 404s → correct localized slug; 5 deleted events → `/[lang]/events/`; legacy `/2020/*` → `/en/`. (Each target slug verified against content before adding.) | `astro.config.mjs` | high |
| 2 | **All new i18n keys, one coordinated 4-file edit** — homepage guide anchors (`home.guideThingsToDoAnchor`, `home.guideBeachesAnchor`), venue title tokens (`places.titleNear/menuWord/bookWord/nearbyVenues`). Reuse existing `home.featuredGuides` + `nav.articles`. | `src/i18n/{en,hr,de,it}.json` | high |
| 3 | **Homepage "Featured Guides" section** linking the two money guides with demand-matched anchor text ("Things to do in Split", "Best beaches in Split"). | `src/pages/[lang]/index.astro` | high |
| 4 | **RelatedContent block in `Guide.astro`** so existing frontmatter relationships render as crawlable links (gives `best-beaches-in-split` ~8 inbound links from articles that already declare `guide:` in frontmatter). | `Guide.astro`, guides+articles `[...slug].astro` | high |
| 5 | **Retarget `things-to-do` title** to lead with "in Split" (keep Žnjan as hero); update `seo.activitiesTitle`. Slugs untouched (changing them would 404). | `things-to-do-*.mdx`, `src/i18n/*.json` | high |
| 6 | **Extend `buildPlaceSchema`** — add Hotel/Resort types, `servesCuisine`, `sameAs` (from Instagram/website); **replace** the misleading star-derived `aggregateRating` with proper `starRating` (rich-result-loss risk). | `src/lib/seo.ts`, places `[...slug].astro` | high |
| 7 | **Intent-rich localized venue `<title>`/meta** ("Mimi … — Restaurant & Menu, Žnjan Beach, Split") + **Related Venues/Guides block** turning dead-end detail pages into authority distributors. | places `[...slug].astro`, `Place.astro`, `labels.ts` | high |
| 8 | **Articles in header nav + footer** (cluster currently has zero sitewide links) + contextual guide callouts on places/beach-areas hubs. | `Header.astro`, `Footer.astro`, hub `index.astro` | medium |
| 9 | **FAQPage JSON-LD** on the two money guides (opt-in `faqs` frontmatter; `buildFAQSchema` already exists). | `config.ts`, guides route, money-guide MDX | medium |
| 10 | **Remove dead `redirects` content collection** (YAML + config.ts definition + export) — misleading unused stub. | `src/content/redirects/`, `config.ts` | low |
| 11 | **Harden `LanguageSwitcher` fallback** — when no `alternates`, link to language home instead of fabricating a deep URL (kills the latent 404 footgun). | `LanguageSwitcher.astro` | medium |
| 12 | **Verification gate** — `npm run build` + `check-i18n` + `check-refs` + `npx astro check`; inspect `dist/_redirects`. | — | high |

### Production access (owner / Cloudflare) — the single biggest lever

| # | Step | Where |
|---|------|-------|
| 13 🔒 | **Enable "Always Use HTTPS" + a host-canonicalization Redirect Rule.** SSL/TLS → Edge Certificates → *Always Use HTTPS* ON. Rules → Redirect Rules → "Canonical host → apex": When `http.host ne "znjan.com"`, Then *Dynamic* `concat("https://znjan.com", http.request.uri.path)`, **301**, preserve query. This one rule + Always-HTTPS covers `http://*`, `http://www.*`, `https://www.*` → `https://znjan.com/<path>`. Verify with curl (each must end at one `200` on the apex). | Cloudflare dashboard, znjan.com zone |
| 14 🔒 | **Request re-indexing in GSC** after 301s deploy — URL-inspect the homepage + two money guides; validate the fixed 404s so Google consolidates the 216K impressions onto the apex faster. | GSC (`ivan@cosmicproduction.hr`) |

### Owner data (code ships now, data filled as confirmed)

| # | Step |
|---|------|
| 15 👤 | **Structured opening hours, NAP (address/phone), menu URLs.** Add optional `openingHours`/`menuUrl`/`acceptsReservations` to the places schema + emit `openingHoursSpecification`/`hasMenu` (graceful when absent). Then populate verified hours/phone/address for Mimi, Palma, Taboo, Mistral, Central, GAL + hotels. (Žnjan promenade street already known: *Šetalište Pape Ivana Pavla II, 21000 Split*.) |

---

## FUTURE — roadmap (after the now-fixes ship)

### Phase 1 — Verify & monitor (parallel, from day one)
- **Post-deploy curl smoke test** for host canonicalization (asserts single 200 on apex + HSTS).
- **Monthly GSC monitoring cadence** — branded vs non-branded split, indexed-page count (target >90%, was ~65%), homepage CTR (confirm the www black hole drains), per-fix lift. Decides FR/ES/PL go/no-go.

### Phase 2 — Harden against regression
- **Build-time `alternates` check** — fail the build if any detail template omits `alternates` (permanently kills the category-A 404 class).
- **Programmatic cross-language redirect map** — generate 301s from content slug maps instead of the hand list in step 1.
- **Centralize title templating in `seo.ts`** — remove the fragile `title.includes('Žnjan')` brand-suffix conditional in `Base.astro`.

### Phase 3 — Language-agnostic content wins (compound regardless of FR)
- **Broaden "Things to Do in Split" into a real Split-attractions pillar** (new `things-to-do-split` guide: Diocletian's Palace, Riva, Marjan, Old Town, Bačvice + a "Best Beach" funnel to Žnjan). **Highest forward ROI — 48.8K impr.** The page FR will later translate.
- **Per-town nearby/day-trip sections** in the day-trips article (Solin/Salona, Klis, Podstrana, Stobreč, Žrnovnica) — captures 41K tangential impr; cheap, rankings already exist.
- **Per-venue menus + real review `aggregateRating` + reservation CTA** (needs owner menus + sanctioned review source). Real SERP stars are a top CTR multiplier.
- **Hotel pages buildout** (Radisson/Amphora/Olivier/More/Mövenpick at pos 30–50) — mostly content; YAMLs + Hotel schema (step 6) already exist.
- **"Split guides" cluster hub + cluster breadcrumbs** — feature money guides at top of `/guides/`, group by cluster.

### Phase 4 — Authority & expansion (gated on Phase 3 proving the model)
- **Off-site authority / backlink program** — local/tourism citations, partner-venue cross-links (7 beach clubs + hotels), digital-PR on the €45.77M transformation. The structural unlock that lets deep pages outrank the homepage.
- **French as the 5th language** (17.7K impr, > supported Italy). Large effort: `LANGUAGES` is hardcoded across `i18n.ts`/`seo.ts`/`astro.config.mjs`/`config.ts`/`check-i18n.ts`; ~252-key `fr.json` + ~38 MDX + ~59 YAML fr-fields. Gate behind the Split pillar; queue **ES (11.4K)** and **PL (11.8K)** after FR proves ROI.
- **Resolve route-segment tension** — `ROUTE_SEGMENTS` still defines unused localized segments (the original 404 source); delete them or localize properly.
- **"Žnjan + Split area" hub** for nearby-towns/sightseeing demand — requires an owner positioning decision (stay beach-pure vs widen).

---

## Open questions for the owner
1. **Cloudflare access** — who applies step 13 (the highest-impact fix)? It can't be done from the repo.
2. **Positioning** — stay a pure Žnjan portal, or widen to "Žnjan + things to do in Split" to win the 48.8K-impression sightseeing demand?
3. **French go/no-go** and timing (strongest language case; largest effort).
4. **Venue data** — can you supply verified hours, phone, address, and menu links for the venues?
5. **Review source** — sanctioned Google Business / TripAdvisor data to surface real SERP star ratings?
