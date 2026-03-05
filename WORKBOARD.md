# WORKBOARD — znjan.com

> Self-maintaining project board. Each work item is an atomic, verifiable chunk.
> Updated at the end of every session. Pick up where you left off.

## Session Protocol

### Start of Session
1. Read this file (`WORKBOARD.md`)
2. Read `MEMORY.md` for context
3. Run `npm run build` to confirm baseline (must pass)
4. Pick the **first `[ ]` item** in the highest-priority phase
5. Announce what you're working on

### End of Session
1. Run full verification: `npm run build && npm run check-i18n && npm run check-refs`
2. Update this file: check off completed items, add notes
3. Update `MEMORY.md` if new facts/patterns discovered
4. Commit with descriptive message (if user approves)
5. Write a **Session Log** entry at the bottom of this file

### Verification Standard
Every work item must pass ALL of:
- [ ] `npm run build` succeeds (no errors)
- [ ] `npm run check-i18n` passes (translation parity)
- [ ] `npm run check-refs` passes (reference integrity)
- [ ] `npx astro check` passes (TypeScript/Astro diagnostics)
- [ ] Visual spot-check in browser if UI changed

---

## Phase 1: Ship It (Deployment & Go-Live)
**Goal:** Get the site live on Cloudflare Pages
**Priority:** HIGHEST — everything else is invisible until deployed

- [x] **1.1 Push to GitHub** (2026-03-03)
  - Scope: Stage all tracked changes, commit, push to `main`
  - Verify: `git log --oneline -1` shows commit on `main`; GitHub repo reflects changes
  - Done: 2 commits pushed — `0d68d74` (P3 content + A++ upgrade, 40 files) + `b87202e` (workboard + .gitignore)

- [x] **1.2 Cloudflare Pages Setup** (2026-03-03)
  - Done: User connected GitHub repo → CF Pages. Auto-deploy on push to main.

- [x] **1.3 Custom Domain** (2026-03-03)
  - Done: znjan.com pointed to CF Pages. HTTPS active. Served from ZAG (Zagreb) edge.

- [x] **1.4 Post-Deploy Smoke Test** (2026-03-03)
  - 16/16 checks pass:
  - Homepages (EN/HR/DE/IT): all 200
  - Content pages (places, guides, articles, beach-areas, activities): all 200
  - 404 page: custom page with language switcher
  - Root `/`: meta-refresh redirect to `/en/`
  - OG tags: title, description, image all present
  - hreflang: en, hr, de, it, x-default
  - Structured data: 3 JSON-LD blocks (Beach, Organization, FAQPage)
  - HTTPS: Cloudflare TLS active

---

## Phase 2: Search (Pagefind UI)
**Goal:** Users can search the site
**Priority:** HIGH — content exists but isn't discoverable

- [x] **2.1 Pagefind Search Component** (2026-03-03)
  - Already existed as `src/components/widgets/SearchDialog.astro`
  - Fixed: language filtering bug (was slicing before filtering — could show 0 results)
  - Fixed: now uses i18n translation keys instead of hardcoded label records
  - Fixed: removed unused `pagefind-ui.css` import
  - Added: initial hint state ("/ to search"), proper DOM cleanup between searches

- [x] **2.2 Search in Navigation** (2026-03-03)
  - Already integrated in Header.astro (desktop + mobile)
  - No changes needed

- [x] **2.3 Search i18n** (2026-03-03)
  - Added `search.placeholder` and `search.hint` keys to all 4 language files
  - Component now uses `t(lang, key)` for all labels (nav.search, common.noResults, etc.)
  - 128 keys per language (up from 126), check-i18n passes

---

## Phase 3: Maps (Leaflet + OpenStreetMap)
**Goal:** Interactive map showing beach zones, businesses, parking, etc.
**Priority:** MEDIUM — high user value but not blocking

- [x] **3.1 Leaflet Component** (2026-03-05)
  - Already existed as `src/components/maps/BeachMap.astro` with Leaflet CDN v1.9.4
  - Custom markers with category-based colors and popups with links
  - No changes needed

- [x] **3.2 Coordinates Audit** (2026-03-05)
  - All beach-areas (5) and places (12) have coordinates in YAML
  - `npm run check-refs` passes; all coordinate fields populated

- [x] **3.3 Map on Key Pages** (2026-03-05)
  - Map embedded on beach-areas listing page with area + place markers
  - Map embedded on homepage (overview section)
  - Individual place pages show coordinates via structured data
  - Responsive on mobile

---

## Phase 4: Photography Integration
**Goal:** Replace placeholder/missing images with real photos
**Priority:** MEDIUM — blocked on user taking photos (see `docs/photo-shot-list.md`)

- [ ] **4.1 Image Pipeline Setup**
  - Scope: Configure Astro `<Image>` component with sharp for optimization
  - Requirements: WebP output, responsive sizes, lazy loading, alt text from translations
  - Verify: Test with one sample image; build succeeds; image is optimized in `dist/`

- [ ] **4.2 Priority 1 Photos (Hero & OG)**
  - Scope: Integrate 4 hero images when provided by user
  - Shots: Aerial panoramic, promenade golden hour, turquoise water, night promenade
  - Verify: Homepage hero uses real photo; OG image updated; Lighthouse image audit passes

- [ ] **4.3 Priority 2 Photos (Beach Zones)**
  - Scope: Integrate 5 beach zone images
  - Verify: Each beach-area detail page has its hero image

- [ ] **4.4 Priority 3 Photos (Businesses)**
  - Scope: Integrate 7 business exterior photos
  - Verify: Each place detail page has its photo; places listing shows thumbnails

- [ ] **4.5 Remaining Photos (P4-P8)**
  - Scope: Integrate remaining 32 shots as user provides them
  - Verify: All content pages have relevant imagery; no placeholder images remain

---

## Phase 5: Analytics & Monitoring
**Goal:** Track visitors, understand usage
**Priority:** LOW — nice to have post-launch

- [x] **5.1 Cloudflare Web Analytics** (2026-03-05)
  - Done: User enabled CF Web Analytics in dashboard (auto-injected beacon)
  - Verify: Analytics data appearing in CF dashboard

- [x] **5.2 robots.txt & Sitemap Verification** (2026-03-05)
  - Done: User set up Google Search Console, verified domain, submitted sitemap
  - robots.txt → 200, points to /sitemap-index.xml
  - /sitemap.xml → 308 redirect to /sitemap-index.xml (working)
  - /sitemap-index.xml → 200 (281 pages listed)
  - Verify: Monitor GSC for indexing progress over next 2-4 weeks

---

## Phase 6: Contact & Engagement
**Goal:** Let users contact/interact
**Priority:** LOW — requires CF Worker backend

- [ ] **6.1 Contact Form Backend**
  - Scope: Cloudflare Worker that receives form POST and sends email
  - Verify: Form submits; email arrives; error cases handled

- [ ] **6.2 Contact Form Frontend**
  - Scope: Update contact page with working form (name, email, message)
  - Verify: Form validates inputs; submits to Worker; shows success/error state

---

## Phase 7: Business Expansion
**Goal:** Add remaining businesses as they're confirmed
**Priority:** ONGOING — depends on owner intel

- [ ] **7.1 Identify 4 Unknown Pavilion Businesses**
  - Candidates: Barakuda, Cool, Rosa Negra, Procaffe
  - Scope: User confirms which are real post-renovation tenants
  - Verify: Updated ground-truth doc; YAML files created; all 4 langs

- [ ] **7.2 Aquapark Content**
  - Scope: Add when operator is announced (tender issued)
  - Verify: YAML + article in all 4 langs

- [ ] **7.3 Diving Club Content**
  - Scope: Add when operator is announced
  - Verify: YAML + article in all 4 langs

- [ ] **7.4 Windsurfing Club Content**
  - Scope: Add when operator is announced
  - Verify: YAML + article in all 4 langs

---

## Blocked Items (Waiting on External Input)

| Item | Blocked By | Action Needed |
|------|-----------|---------------|
| 1.1 Push | User approval | User reviews staged changes and approves commit |
| 1.2-1.3 CF Pages | User's CF + DNS access | User provides CF account or does setup with guidance |
| 4.2-4.5 Photos | User takes photos | See `docs/photo-shot-list.md` for shot list |
| 7.1 Businesses | Owner intel | User confirms which 4 remaining pavilion tenants are |

---

## Session Log

> Append a new entry after each work session. Format:
> `### YYYY-MM-DD — Summary (items completed)`

### 2026-03-03 — Comprehensive Review: 13 Issues Fixed
- Ran 4-dimension review (SEO, code quality, content, performance/a11y)
- **C1 FIXED:** Critical routing bug — getLocalizedUrl() was generating 404 URLs for non-EN pages (~123 broken links)
- **C2 FIXED:** Image alt="" → use place titles for SEO + accessibility
- **C4 FIXED:** Added skip-to-content link + id="main-content" on all layouts
- **C5 FIXED:** Added public/_headers with HSTS, CSP, X-Frame-Options, Permissions-Policy
- **H1 FIXED:** Search input aria-label for screen readers
- **H2 FIXED:** Global focus-visible indicator for keyboard navigation
- **H4 FIXED:** Place.astro ternary chains → i18n keys (places.information, places.priceRange)
- **H5 FIXED:** Guide.astro breadcrumb SVGs → aria-hidden="true"
- **H6 FIXED:** External links rel="noopener noreferrer"
- Also: og:image:width/height meta, unused CSS removed, unused import removed
- Remaining: C3 (image optimization) deferred to Phase 4 (needs real photos first)
- Build: 261 pages, 130 i18n keys x 4 langs, all checks pass
- Security headers verified live: HSTS, CSP, X-Frame-Options, Permissions-Policy all active

### 2026-03-03 — Phase 2 Complete: Search Fixed & Polished
- SearchDialog already existed but had critical language filtering bug
- Fixed: filter by language BEFORE taking top 8 results
- Migrated hardcoded labels to i18n system (128 keys per language)
- Removed unused pagefind-ui.css import
- Added initial hint state with "/" keyboard shortcut indicator
- Build: 261 pages, check-i18n OK (128 keys x 4), check-refs OK

### 2026-03-05 — SEO Meta + JSON-LD + Polish
- **SEO meta titles/descriptions**: Added 12 new `seo.*` keys to all 4 i18n JSON files (142 keys per lang)
  - All 6 listing pages now have 50-60 char titles and 120-160 char descriptions for search engines
  - Visible H1/subtitle unchanged (still uses short i18n strings)
- **JSON-LD CollectionPage**: Added `buildCollectionPageSchema()` to `seo.ts`
  - All 6 listing pages (places, articles, beach-areas, activities, events, guides) now emit `CollectionPage` + `ItemList` structured data
- **Sitemap redirect**: `/sitemap.xml` → `/sitemap-index.xml` via Astro redirects
- **Mobile menu fix**: Nav links now auto-close the mobile menu on click
- **Phase 3 verified complete**: BeachMap.astro already existed with Leaflet + markers on beach-areas listing and homepage
- Build: 261 pages, 142 i18n keys x 4 langs, all checks pass (build, check-i18n, check-refs)

### 2026-03-05 — Gap-Closing Content: 5 New Articles (20 MDX files)
- Comprehensive keyword research + content gap analysis (60+ web searches, 18 gaps identified)
- **5 new articles created**, each in all 4 languages (EN, HR, DE, IT):
  1. **Beach Club Comparison** (G2): All 7 venues compared — prices, vibes, cuisine, decision guide
  2. **Airport Transfer Guide** (G1): Split Airport (SPU) to Žnjan — bus, shuttle, Uber, Bolt, taxi, rental car
  3. **Cruise Ship Visitor Guide** (G3): Half-day itinerary from Split port, transport, timing, tips
  4. **Sunset & Evening Guide** (G6): Best sunset spots, golden hour timing, evening activities, dining
  5. **Best Accommodation** (G5): Hotels (Radisson Blu, Amphora, Fanat, More, Mövenpick) + Airbnb tips
- Fixed guide references (where-to-eat-drink, where-to-stay-near-znjan)
- Build: 281 pages (up from 261), 142 i18n keys x 4 langs, all checks pass
- Pagefind: 19,646 indexed words across 4 languages

### 2026-03-03 — Phase 1 Complete: Site is LIVE
- Created `WORKBOARD.md` as self-maintaining project board
- Committed and pushed P3 content + A++ upgrade (40 files) + workboard (2 files)
- User connected CF Pages + custom domain
- Smoke test: 16/16 checks pass — znjan.com is live with HTTPS, 4 languages, structured data
- **Phase 1 complete** (items 1.1–1.4 all done)
- Build status: PASS (261 pages, check-i18n OK, check-refs OK)
