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

Release checklist: `docs/release-readiness.md`

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

## Phase 6: Community Platform (Meetups, Events & Gamification)
**Goal:** Dynamic community where visitors create meetups, find sports partners, propose events
**Priority:** HIGH — adds user engagement layer on top of static content

- [x] **6.1 Infrastructure** (2026-03-08)
  - Installed `@astrojs/cloudflare` adapter, `output: 'static'` with per-page SSR opt-in
  - Created `wrangler.toml` with D1 binding
  - Created `src/env.d.ts` runtime types
  - Created `src/middleware.ts` (session auth + CSRF for community/API routes)
  - Build verified: 297 static pages unaffected

- [x] **6.2 D1 Database** (2026-03-08)
  - Created `znjan-community` database (ID: `35ad720b-...`)
  - Ran `migrations/0001_initial.sql`: 7 tables, 13 indexes
  - Tables: users, magic_links, sessions, posts, responses, point_transactions, user_badges

- [x] **6.3 Auth System** (2026-03-08)
  - Magic link auth (instant — no email provider needed, verify URL returned directly)
  - Session cookies: HttpOnly, Secure, SameSite=Strict, 7-day expiry
  - `src/lib/auth.ts`: createMagicLink, verifyMagicLink, getUserFromSession, session cookie helpers
  - Login page at `/[lang]/community/login/`

- [x] **6.4 Core Community** (2026-03-08)
  - 18 API endpoints: auth (4), posts CRUD + join/leave/comments (8), users (3), admin (2), leaderboard (1)
  - 7 SSR pages: board, post detail, create, edit, login, profile, admin dashboard
  - 6 components: AuthBanner, PostCard, PostFilters, Leaderboard, PointsDisplay, UserBadges
  - Post types: meetup, event-idea, partner-search, discussion
  - Categories: sports, social, culture, food-drink, other
  - All posts require admin approval before visibility

- [x] **6.5 Gamification** (2026-03-08)
  - 8 point actions (create-post, post-approved, comment, join, organize, first-post, daily-login, profile)
  - 8 levels: Beach Newbie → Sand Walker → Wave Rider → Beach Regular → Seaside Explorer → Ocean Lover → Beach Ambassador → Žnjan Legend
  - 8 badges: first-post, first-meetup, organizer, connector, multilingual, regular, helpful, popular
  - Leaderboard (top 20, sidebar widget)

- [x] **6.6 i18n** (2026-03-08)
  - 252 keys per language (110 new community keys)
  - Sections: auth (13), community (30), postForm (17), gamification (17), profile (9), admin (10)
  - All 4 languages in parity, `check-i18n` passes

- [x] **6.7 Community in Navigation** (2026-03-08)
  - Added "Community" to Header.astro nav + `nav.community` i18n key
  - Route segment added to `src/lib/i18n.ts`

- [x] **6.8 Content Cleanup** (2026-03-08)
  - Removed 3 fictional events (12 MDX files): Season Opening, Summer Music Festival, Volleyball Tournament
  - Only verified content remains; events listing shows "coming soon"

- [ ] **6.9 D1 Binding in CF Pages**
  - Scope: User must add D1 binding in CF Pages dashboard (Settings → Bindings → DB → znjan-community)
  - Release note: Google OAuth production also needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and callback URL `https://znjan.com/api/auth/callback`
  - Then redeploy for community pages to connect to database

- [ ] **6.10 Email Provider (Future)**
  - Currently no email — auth uses instant magic link (no email needed)
  - Admin notifications logged to console
  - Scope: Plug in Brevo/SendGrid/etc. when needed for notification emails

---

## Phase 7: Contact Form
**Goal:** Let users send messages
**Priority:** LOW — requires email backend

- [ ] **7.1 Contact Form Backend**
  - Scope: Cloudflare Worker that receives form POST and sends email
  - Verify: Form submits; email arrives; error cases handled

- [ ] **7.2 Contact Form Frontend**
  - Scope: Update contact page with working form (name, email, message)
  - Verify: Form validates inputs; submits to Worker; shows success/error state

---

## Phase 8: Business Expansion
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

## Phase 9: Public Sports Reservations
**Goal:** Keep Znjan's sports-field information public, honest, and easy to trust while preserving the future path toward an official reservation system
**Priority:** HIGH — strong community utility and a natural extension of the existing community platform

**Current state note:** public sports pages now live under `/[lang]/community/sports/*`, the old `/[lang]/community/reservations/*` routes redirect there, and reservation writes are disabled until a real public reservation system exists.

- [ ] **9.1 Resource Inventory and Booking Rules**
  - Scope: Confirm exact reservable resources in the sports zone and publish slot, fairness, cancellation, and no-show rules
  - User-confirmed inventory to plan around: 3 beach volleyball courts, basketball courts, cage football pitches, 1 tennis court, skate park
  - Initial booking assumption: fixed courts/pitches book directly; skate park uses scheduled sessions unless policy says otherwise
  - Progress: public booking rules and pilot-scope page added on 2026-04-17 and now published at `/[lang]/community/sports/rules/`
  - Verify: policy written, inventory confirmed, roadmap assumptions validated

- [x] **9.2 Public Availability Model and API** (2026-04-16)
  - Scope: Add D1 schema + SSR/API layer for sports resources, slot availability, blackouts, and audit history
  - Done: Added `src/lib/sports-reservations.ts`, `migrations/0004_sports_reservations.sql`, and `/api/reservations` GET/POST + DELETE by id
  - Verify: public availability endpoint returns slot states per resource/date; `npx astro check`, `check-i18n`, `check-refs`, and `build` all pass

- [x] **9.3 Public Schedule UI** (2026-04-16)
  - Scope: Build multilingual daily/weekly reservation pages that anyone can browse without login
  - Done: Added the public sports-access page and later moved the canonical route to `src/pages/[lang]/community/sports/index.astro`, with legacy `/community/reservations/` redirects preserved for compatibility
  - Verify: mobile and desktop views clearly show available, reserved, closed, and past slots; CTA added from the sports-zone page

- [x] **9.4 Booking and Cancellation MVP** (2026-04-16)
  - Scope: Reuse community auth so logged-in users can reserve and cancel free slots with anti-abuse limits
  - Done: Reused community auth for booking and cancellation; enforced one-hour slots, 7-day window, duplicate prevention, same-time conflict prevention, and per-user booking caps
  - Verify: no overlaps, no duplicates, per-user caps enforced, public calendar updates immediately on reload

- [x] **9.5 Transparency Dashboard and Activity Pilot** (2026-04-17)
  - Scope: Publish usage stats and pilot one activity-slot workflow beyond fixed fields
  - Progress: admin blackout controls and closure-management APIs added on 2026-04-16 so operators can publish temporary court closures without hiding them from the public schedule
  - Progress: public transparency dashboard added on 2026-04-17 and now published at `/[lang]/community/sports/dashboard/`
  - Progress: collision reporting added on 2026-04-18 through admin logging and ambassador logging, with the old user-side reservation follow-up path later disabled as the public product shifted back to first-come-first-served access
  - Done: live skate park session pilot added on 2026-04-17 with shared-capacity beginner, open, and sunset sessions
  - Next candidates: volleyball clinics, SUP, or kayak slots if operator flow is clear
  - Verify: dashboard is public; one non-court pilot is live

Reference: `docs/roadmap-sports-reservations.md`

---

## Phase 10: Mobile Apps + App-Grade Backend
**Goal:** Reuse the current Znjan backend for native iOS and Android apps instead of building a second system
**Priority:** HIGH — the app can extend the public-service mission if the backend contract is made explicit early

- [x] **10.1 Mobile Product + Backend Roadmap** (2026-04-17)
  - Scope: define the recommended mobile stack, beta scope, backend phases, and delivery sequence
  - Done: added `docs/mobile-app-roadmap.md`
  - Verify: roadmap exists in-repo and reflects the current Astro + D1 architecture

- [x] **10.2 Versioned Public Mobile API Scaffold** (2026-04-17)
  - Scope: create a stable `/api/mobile/v1/*` namespace for app clients starting with public content and endpoint discovery
  - Done: added `src/lib/mobile-api.ts`, `/api/mobile/v1/bootstrap`, and `/api/mobile/v1/discover`
  - Verify: mobile endpoints return localized JSON envelopes for beach areas, activities, places, and FAQs

- [x] **10.3 Native Auth Contract** (2026-04-17)
  - Scope: design token/session exchange for iOS and Android so native clients are not forced through browser-cookie assumptions
  - Done: added `docs/mobile-auth-contract.md` and `/api/mobile/v1/auth/session`
  - Verify: written contract exists and the session-inspection endpoint exposes current auth status plus native-auth readiness

- [x] **10.4 Reservation API Contract for Mobile** (2026-04-17)
  - Scope: formalize reservation read/write payloads, policy metadata, and user-facing error states for app UX
  - Done: added `docs/mobile-reservations-api-contract.md`, `/api/mobile/v1/reservations`, and `/api/mobile/v1/reservations/:id`
  - Verify: mobile client can render availability and booking outcomes without relying on website-specific assumptions

- [x] **10.5 Community Feed Contract for Mobile** (2026-04-17)
  - Scope: normalize feed/detail payloads, pagination, moderation states, and write capabilities for app consumption
  - Done: added `docs/mobile-community-api-contract.md`, shared community read helpers, `/api/mobile/v1/community/feed`, and `/api/mobile/v1/community/posts/:id`
  - Verify: app can ship a stable read-first community experience before native post creation is added

- [x] **10.6 Expo App Shell for Internal Beta** (2026-04-17)
  - Scope: scaffold a real native client workspace that consumes the versioned mobile backend without touching the website build pipeline
  - Done: added `apps/mobile` with a typed Expo shell for discover, reservations, community, and auth-status tabs
  - Verify: `cd apps/mobile && npm run typecheck` passes, `npx expo export --platform web` bundles successfully, and the app targets `EXPO_PUBLIC_API_BASE_URL`

- [ ] **10.7 Native Session Exchange + Device Sessions**
  - Scope: add D1-backed mobile device sessions and the first native auth endpoints under `/api/mobile/v1/auth/native/*`
  - Verify: app can exchange a native sign-in result for a device session and refresh it without website cookies

- [ ] **10.8 Complete Public-Info Surface for Mobile**
  - Scope: add legal/about/contact payloads and any remaining public content needed for a standalone app beta
  - Verify: app can ship the public-information experience without falling back to website page scraping

Reference: `docs/mobile-app-roadmap.md`

---

## Phase 11: Founder 15-Day Flagship Sprint
**Goal:** Compress the larger flagship ambition into one realistic founder-led push that proves public utility in the real world
**Priority:** HIGHEST — this is the operating lens for the next 15 days

- [ ] **11.1 Production Trust Gate**
  - Scope: verify Cloudflare runtime, auth, reservation pages, admin protections, and public trust docs on production
  - Progress: local web trust surfaces shipped on 2026-04-17 across `/[lang]/community/reservations/`, `/[lang]/community/reservations/rules/`, `/[lang]/community/reservations/dashboard/`, `/[lang]/community/login/`, `/[lang]/privacy/`, and `/[lang]/contact/`
  - Progress: reservation pages now explicitly explain the pilot honesty model, public visibility expectations, privacy path, and issue-reporting path before broader promotion
  - Progress: collision logging is now wired locally on 2026-04-18 across reservation follow-up, admin operations, and the public transparency dashboard
  - Verify: production smoke test passes and trust-critical blockers are closed before public push

- [ ] **11.2 Permission-Light Legitimacy Pilot**
  - Scope: deploy QR stickers, flyers, partner-venue handouts, and a simple on-site founder/Ambassador coverage plan
  - Progress: added a multilingual on-site entry route on 2026-04-18 at `/[lang]/play/` for QR stickers, flyers, and pavilion handouts, with direct paths into the live schedule, rules, dashboard, and sign-in
  - Progress: linked the new quick-start route from the sports-zone detail page and the reservation-rules page so web entry points now support the permission-light physical pilot
  - Progress: added a print-ready pilot-materials route on 2026-04-18 at `/[lang]/play/materials/` with a generated QR, flyer/poster/sticker copy, and founder pre-distribution checks
  - Progress: admin reservations now include a founder/ambassador distribution log on 2026-04-18 so real sticker, flyer, poster, table-card, and handout placements can be tracked by date, location, and quantity
  - Progress: added an admin pilot-ops route on 2026-04-18 at `/[lang]/community/admin/pilot/` so the founder sprint now has one web surface for daily checks, quick links, recent collisions, closures, and distribution activity
  - Progress: added a D1-backed founder/helper coverage planner on 2026-04-18 inside `/[lang]/community/admin/pilot/` plus `/api/admin/reservations/coverage/` so actual named field blocks can be scheduled, measured, and removed instead of living only in private notes
  - Verify: materials exist physically, are distributed, and support the reservation honesty model

- [ ] **11.3 Seed Community and First Meetups**
  - Scope: invite the first locals, use provisional trust where needed, and schedule the first 3 meetups
  - Progress: added an admin seed-community route on 2026-04-18 at `/[lang]/community/admin/seed/` with invite checklists, helper guidance, and 3 starter meetup templates
  - Progress: the community create flow now accepts safe query-string prefills so founder templates can open directly into a prefilled meetup draft instead of making the user retype everything
  - Progress: added a public onboarding route on 2026-04-18 at `/[lang]/community/start/` so invites, QR scans, and social links can point locals into one clear “start here” flow for schedule, meetups, and feedback
  - Progress: added a public support-signal intake on 2026-04-18 via `/[lang]/community/help/` and `/api/pilot-support-signals/`, with recent signals now visible inside `/[lang]/community/admin/seed/` so founder follow-up can move out of scattered DMs and into D1-backed workflow
  - Progress: added a triage queue on 2026-04-18 inside `/[lang]/community/admin/seed/` plus `/api/admin/pilot-support-signals/[id]/` so support signals can move through `new`, `followed up`, and `handled` states and be archived once the founder has acted
  - Progress: added founder follow-up notes on 2026-04-18 inside `/[lang]/community/admin/seed/` so each support signal can carry concrete next-step context instead of relying on memory between local intros, venue leads, and helper follow-ups
  - Verify: community feed is no longer empty-in-theory and moderation can support real usage

- [ ] **11.4 Commercial Validation Before Product Sprawl**
  - Scope: walk the 11 pavilion venues, use a lightweight sell sheet, and collect 3-5 real buying signals before building heavy provider tooling
  - Progress: added an admin venue-validation route on 2026-04-18 at `/[lang]/community/admin/venues/` with a founder walk list covering 7 confirmed venues plus 4 still-unconfirmed pavilion spaces
  - Progress: added D1-backed venue-signal logging on 2026-04-18 via `/api/admin/venues/signals/` so real buying signals can be recorded by venue, offer focus, and outcome instead of living only in notes
  - Progress: the founder toolkit now explicitly separates sellable-now web inventory from not-yet-sellable app/channel surfaces so Summer 2026 commercial conversations stay aligned with the project's sell-before-build rule
  - Progress: added an admin sell-sheet route on 2026-04-18 at `/[lang]/community/admin/venues/sell-sheet/` so Phase 11.4 now has a shareable, founder-ready commercial one-pager grounded in live public surfaces and current content proof points
  - Progress: added a printable one-page sell-sheet route on 2026-04-18 at `/[lang]/community/admin/venues/sell-sheet/print/` so real venue walks now have a QR-backed leave-behind instead of only an on-screen admin page
  - Verify: Summer 2026 sellable inventory is frozen around actual demand, not assumptions

- [ ] **11.5 Baseline Narrative and Social Cadence**
  - Scope: standardize owned channels and publish the first explanatory/project-legitimacy content burst
  - Progress: added a public pilot-update route on 2026-04-18 at `/[lang]/community/pilot/` so social shares, venue follow-ups, and early supporters now have one honest public explanation of what is live, what is not promised yet, and how to help this week
  - Progress: added an admin comms-kit route on 2026-04-18 at `/[lang]/community/admin/comms/` so the founder now has reusable one-line positioning, bios, outreach starters, post scripts, and public-language guardrails for early sharing
  - Progress: added a founder-sprint OG card endpoint on 2026-04-18 at `/api/og/founder-sprint.svg` and wired `/[lang]/play/`, `/[lang]/community/start/`, and `/[lang]/community/pilot/` to share with dedicated social cards instead of the generic site image
  - Progress: expanded the admin comms kit on 2026-04-18 with a first-week publishing cadence and route-specific public/social-card URLs so the founder now has a usable posting pack instead of just static copy blocks
  - Progress: added a public support route on 2026-04-18 at `/[lang]/community/help/` so supporters, helpers, and locals now have one clear page for concrete ways to help this week
  - Verify: the project has a simple public narrative and a minimum viable publishing rhythm

Reference: `docs/founder-15-day-execution-roadmap.md`

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

### 2026-03-05 — Cluster Strengthening: 4 New Articles (16 MDX files)
- Targeted thin content clusters to build topical authority
- **4 new articles created**, each in all 4 languages (EN, HR, DE, IT):
  1. **Water Sports & Beach Activities** (activities-sports cluster): SUP, kayaking, beach volleyball, jet ski, pedal boats, skate park, upcoming aquapark/diving/windsurfing
  2. **What to Pack for Žnjan Beach** (getting-started cluster): Comprehensive packing list by category — sun protection, comfort, tech, families, active visitors, seasonal adjustments
  3. **Beach Rules & Etiquette** (getting-started cluster): Official rules, sunbed protocol, tipping, photography, noise, swimming zones, environmental etiquette, Croatian customs
  4. **Where to Eat: Restaurant Guide** (food-drink cluster): Meal-by-meal dining guide (breakfast to dinner), all 7 venues, Croatian specialties, dietary options, budget guide
- Cluster improvements: activities-sports 2→3, getting-started 1→3, food-drink 3→4
- Build: 297 pages (up from 281), 142 i18n keys x 4 langs, all checks pass
- Pagefind: 21,621 indexed words (up from 19,646)

### 2026-03-08 — Community Platform: Full Implementation + Deploy
- **Phase 6 complete** (items 6.1–6.8 all done)
- Built full community platform: D1 database, magic link auth, posts/comments, gamification, admin
- ~35 new files: 4 lib modules, middleware, 18 API endpoints, 7 SSR pages, 6 components
- 252 i18n keys per language (110 new), all 4 languages in parity
- Removed Resend dependency — auth uses instant magic link (no email provider needed)
- Removed 3 fictional events (12 MDX files) — only verified content remains
- Created D1 database `znjan-community` via wrangler, ran schema migration (7 tables, 13 indexes)
- **Remaining:** User needs to add D1 binding in CF Pages dashboard (Settings → Bindings → DB)
- GitGuardian false positive investigated — triggered by "noPassword" i18n keys, no real secrets exposed
- Build: 285 pages (297 static - 12 events), 21,353 indexed words, all checks pass
- Commits: `bd0e1e2` (community platform, 44 files) + `21be143` (remove fictional events, 12 files)

### 2026-03-03 — Phase 1 Complete: Site is LIVE
- Created `WORKBOARD.md` as self-maintaining project board
- Committed and pushed P3 content + A++ upgrade (40 files) + workboard (2 files)
- User connected CF Pages + custom domain
- Smoke test: 16/16 checks pass — znjan.com is live with HTTPS, 4 languages, structured data
- **Phase 1 complete** (items 1.1–1.4 all done)
- Build status: PASS (261 pages, check-i18n OK, check-refs OK)

### 2026-04-16 — Review Hardening: Community, i18n, and OAuth fixes
- Ran two review/fix cycles across the community platform, localized routing, and the new Google OAuth auth flow
- **Community XSS hardening:** escaped untrusted content across the board, post detail, admin queue, profile, edit form, and leaderboard client renders
- **Post visibility fix:** `GET /api/posts/:id` now blocks pending/rejected posts for non-owners/non-admins and only increments views for approved posts
- **Localized routing fix:** footer legal links now resolve from localized page slugs; language switcher alternates are passed through page/detail layouts so translated-slug pages no longer switch to 404s
- **Meetup integrity fix:** join flow is now duplicate-safe and capacity-safe; organizer bonus only awards once on the threshold crossing
- **DB constraints added:** `migrations/0003_community_constraints.sql` adds unique join and reward indexes after deduping existing rows
- **Static page typing fix:** `[lang]/[...page].astro` now uses typed `CollectionEntry<'pages'>`, restoring a clean `npx astro check`
- **OAuth hardening:** normalized `lang` against supported locales in Google auth state/callback to prevent open redirects
- **Dev auth fix:** session and OAuth state cookies now set `Secure` only on HTTPS so local `http://localhost` auth works in development
- **Passive badge triggers fixed:** owners are re-checked for `organizer`, `connector`, and `popular` when joins, comments, and views cross those thresholds
- **Admin preview fix:** admins can now open pending posts in the normal community detail UI
- Verification: `npx astro check` PASS, `npm run build` PASS, `npm run check-i18n` PASS, `npm run check-refs` PASS

### 2026-04-16 — Sports Reservations Roadmap Added
- Created `docs/roadmap-sports-reservations.md` with a short-term public-service roadmap for sports field reservations at Znjan
- Scoped the fixed-field MVP around the verified sports zone resources: beach volleyball courts, basketball courts, and cage football pitches
- Defined product principles for the feature: public readability, free reservations, fairness, privacy-respecting transparency, and multilingual mobile-first UX
- Added `Phase 9: Public Sports Reservations` to the workboard with five implementation tracks:
  - resource inventory and rules
  - public availability model and API
  - public schedule UI
  - booking and cancellation MVP
  - transparency dashboard and activity pilot

### 2026-04-16 — Sports Inventory Clarified for Reservation Planning
- Updated the roadmap and Phase 9 planning assumptions after user clarification on the actual sports-zone resources
- Added the newly confirmed inventory to the reservation plan:
  - 3 beach volleyball courts
  - tennis court
  - skate park
- Kept skate park in the roadmap as a session-based candidate rather than assuming full exclusive booking by default

### 2026-04-16 — Sports Reservations MVP Slice Implemented
- Updated the public sports content to match the clarified inventory:
  - `sports-zone.yaml` now mentions 3 beach volleyball courts and a tennis court
  - added `tennis` as a public activity page
  - updated facilities FAQ and shared labels
- Added the first working reservation slice on top of the existing community stack:
  - `src/lib/sports-reservations.ts`
  - `migrations/0004_sports_reservations.sql`
  - `/api/reservations` endpoints
  - `/[lang]/community/reservations/` public schedule + booking page
- Added a direct CTA from the Sports Zone detail page into the reservation flow
- Booking policy currently enforced in code:
  - 7-day booking window
  - 60-minute slots
  - max 2 reservations per day
  - max 5 upcoming reservations total
- Current implementation assumption: one bookable basketball surface and one cage-football surface until exact on-site counts are confirmed; skate park remains scheduled for a later session-based pilot
- Verification: `npx astro check` PASS, `npm run check-i18n` PASS, `npm run check-refs` PASS, `npm run build` PASS

### 2026-04-16 — Sports Reservations Local Preview Fix Verified
- Fixed a local/runtime bootstrap issue in `src/lib/sports-reservations.ts` by replacing the multi-statement D1 `exec()` schema initializer with explicit schema statements plus a cached initializer promise
- Rebuilt the site and verified the reservation flow in a real local Cloudflare Pages runtime instead of checking only static build output
- Confirmed local preview works with:
  - `npx wrangler pages dev dist --port 8788 --compatibility-flag nodejs_compat --kv SESSION`
- Manual browser verification:
  - `/en/community/reservations/` renders the public schedule correctly
  - today's view shows past slots at the end of the day
  - `/en/community/reservations/?date=2026-04-17` shows 84 open public slots across 6 resources

### 2026-04-16 — Reservation Closure Controls Added
- Confirmed the old passive-badge review finding remains fixed in the current community code:
  - post owners are re-checked for passive badge thresholds from join, comment, and 100-view crossing paths
- Added admin reservation-closure tooling for the sports booking system:
  - `src/pages/[lang]/community/admin/reservations/index.astro`
  - `src/pages/api/admin/reservations.ts`
  - `src/pages/api/admin/reservations/[id].ts`
  - shared blackout helpers in `src/lib/sports-reservations.ts`
- Operators can now:
  - create temporary closures for one resource or all sports resources
  - remove active closures
  - view scheduled closures in a dedicated admin screen
- Safety rule in this first admin slice:
  - closures cannot overlap existing active reservations, so we do not silently mask confirmed bookings
- Added navigation links from the admin dashboard and the public reservations page for admin users
- Added i18n coverage for the new admin reservation controls in all 4 languages
- Verification: `npx astro check` PASS, `npm run check-i18n` PASS, `npm run check-refs` PASS, `npm run build` PASS

### 2026-04-17 — Release Readiness Cleanup + Public Reservation Rules
- Cleaned local worktree noise by ignoring generated runtime artifacts:
  - `.playwright-cli/`
  - `.wrangler/`
  - `output/`
- Added `MEMORY.md` so the repo now matches the workboard session protocol
- Added `docs/release-readiness.md` with:
  - local verification steps
  - Cloudflare Pages binding/env requirements
  - dynamic-route smoke test checklist
- Added `npm run preview:runtime` for local Cloudflare Pages runtime checks after build
- Started Phase 9.1 in the product itself:
  - added `/[lang]/community/reservations/rules/`
  - published the current pilot inventory
  - published fairness, cancellation, and no-show policy copy
  - linked the rules page from the live reservations schedule

### 2026-04-17 — Public Reservation Transparency Dashboard Added
- Confirmed again that the repeated passive-badge review finding remains fixed in the current community code:
  - join, comment, and 100-view paths all re-check the post owner for passive badge thresholds
- Implemented a public transparency dashboard for sports reservations:
  - added `getSportsTransparencySnapshot()` to `src/lib/sports-reservations.ts`
  - added `/[lang]/community/reservations/dashboard/`
  - linked the dashboard from the public reservations page, rules page, and community landing page
- Dashboard currently publishes:
  - 7-day slot totals
  - open / reserved / closed slot counts
  - active closure count
  - cancellation rate for the current public booking window
  - busiest upcoming start time
  - daily and per-resource occupancy breakdowns
- Runtime verification:
  - rebuilt successfully
  - local Cloudflare-style preview returned `200` for `/en/community/reservations/dashboard/`
  - community landing page renders the dashboard CTA correctly

### 2026-04-17 — Skate Park Session Pilot Added
- Extended the sports reservation model to support shared-capacity session resources instead of only one-user exclusive slots
- Added 3 live skate park pilot resources:
  - beginner session at `09:00` with capacity `8`
  - open session at `17:00` with capacity `12`
  - sunset session at `19:00` with capacity `12`
- Public schedule now renders shared-session availability as remaining spots instead of treating every slot like a private court booking
- Updated the rules page and roadmap docs so the skate pilot is documented as live rather than merely planned
- Added `migrations/0005_activity_session_pilot.sql` to drop the one-seat-only resource slot index and seed the new session resources

### 2026-04-17 — Mobile Roadmap + App API Scaffold Added
- Mapped the current backend for native app work and documented the recommended path in `docs/mobile-app-roadmap.md`
- Added `Phase 10: Mobile Apps + App-Grade Backend` so mobile work now has explicit project ownership in the workboard
- Added a versioned read-only mobile API scaffold:
  - `src/lib/mobile-api.ts`
  - `/api/mobile/v1/bootstrap`
  - `/api/mobile/v1/discover`
- The first mobile endpoints now expose:
  - site metadata and capability flags
  - endpoint discovery for app clients
  - localized beach areas, activities, places, and FAQ content
- Kept the first mobile slice intentionally public and read-only so app work can begin without blocking on native auth design

### 2026-04-17 — Mobile Contracts Expanded: Auth, Reservations, and Community
- Added mobile backend contract docs:
  - `docs/mobile-auth-contract.md`
  - `docs/mobile-reservations-api-contract.md`
  - `docs/mobile-community-api-contract.md`
- Expanded the versioned mobile API namespace with app-oriented wrappers:
  - `/api/mobile/v1/auth/session`
  - `/api/mobile/v1/reservations`
  - `/api/mobile/v1/reservations/:id`
  - `/api/mobile/v1/community/feed`
  - `/api/mobile/v1/community/posts/:id`
- Centralized community read behavior in `src/lib/community-api.ts` so the website and mobile surfaces share the same moderation and view-count rules
- Reservation mobile endpoints now return policy metadata, viewer state, schedule data, and versioned error codes in one app-shaped contract
- Community mobile endpoints now return explicit pagination, normalized author data, viewer state, and detail capabilities

### 2026-04-17 — Expo App Shell Added For Mobile Beta Work
- Generated a dedicated Expo workspace in `apps/mobile`
- Replaced the blank starter with a typed Znjan app shell that now renders:
  - discover content
  - reservation availability
  - community feed
  - auth/session readiness
- Added app-side API helpers, localized UI labels, `.env.example`, and a mobile README
- Added `npm run typecheck` for the mobile workspace and confirmed it passes
- Installed the missing Expo web runtime packages and confirmed `npx expo export --platform web` now bundles the app shell successfully
- Excluded `apps/mobile` from the root Astro TypeScript config so website diagnostics stay clean
- Re-ran local mobile runtime checks for:
  - `/api/mobile/v1/bootstrap`
  - `/api/mobile/v1/auth/session`
  - `/api/mobile/v1/reservations`
  - `/api/mobile/v1/community/feed`

### 2026-04-17 — App Factory Handoff Bundles Created
- Created a docs-only transfer bundle for the external app team under `deliverables/`
- Created a second code-and-docs transfer bundle with:
  - the Expo mobile shell
  - mobile API endpoint source
  - relevant backend support libraries
  - D1 migrations for community, auth, and reservations
- Added `README-FIRST.md` files inside the handoff folders so the receiving team has a clean reading order

### 2026-04-17 — Whole-Project Dossier Added
- Added `docs/project-dossier.md` as a current-state documentation artifact for the whole project
- The dossier covers:
  - mission and positioning
  - website and backend status
  - community platform
  - sports reservations
  - mobile/apps
  - social/media layer
  - operational readiness
  - recommended deep-research tracks for roadmap generation

### 2026-04-17 — Founder 15-Day Execution Roadmap Added
- Added `docs/founder-15-day-execution-roadmap.md` as a compressed, founder-executable version of the broader flagship ambition
- The new roadmap is intentionally 15-day and outcome-driven:
  - production trust gate
  - permission-light legitimacy pilot
  - seed community and first meetups
  - commercial validation before product sprawl
  - baseline narrative and social cadence
- Added `Phase 11: Founder 15-Day Flagship Sprint` so the workboard now reflects the immediate operating mode instead of only the broader product phases
- Updated `MEMORY.md` with the new planning stance:
  - trust before promotion
  - permission-light physical rollout
  - sell-before-build for commercial work
  - later-stage ideas stay out of the immediate execution path

### 2026-04-17 — Web Trust Gate Surfaces Updated
- Added `src/components/community/ReservationTrustPanel.astro` and wired it into the public sports-access, rules, and transparency pages
- Added a privacy/session note to `/[lang]/community/login/` so Google sign-in is paired with an explicit policy link before auth
- Expanded `src/content/pages/privacy.yaml` and `src/content/pages/contact.yaml` so the public legal/support pages reflect real community, auth, and reservation behavior
- Updated reservation and auth translation keys across all 4 locale files for the new trust and reporting copy
- Updated `docs/release-readiness.md` and `MEMORY.md` to capture the trust-gate work as part of Phase 11
- Local verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`
  - local runtime returned `200` for reservation, rules, dashboard, login, privacy, and contact pages

### 2026-04-18 — Collision Reporting Added To Reservations
- Added a real collision-reporting data model with `migrations/0006_collision_reporting.sql` and matching runtime schema support in `src/lib/sports-reservations.ts`
- Reservation users can now submit post-slot collision follow-up from `/[lang]/community/reservations/` for recent finished reservations
- Admins can now log direct admin or ambassador conflict reports from `/[lang]/community/admin/reservations/`
- The public transparency dashboard now reports:
  - collision report count
  - completed reservations in the reporting window
  - collision rate
  - per-day collision counts
  - per-resource collision counts
  - source breakdown between user follow-up, ambassador, and admin logging
- Updated `docs/release-readiness.md`, `docs/roadmap-sports-reservations.md`, and `MEMORY.md` so collision logging is treated as part of launch readiness rather than a future idea
- Verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`

### 2026-04-18 — Permission-Light QR Quick Start Added
- Added `/[lang]/play/` as the public on-site entry route for QR stickers, flyers, and pavilion handouts during the founder-led legitimacy pilot
- The new page pulls live reservation data so people arriving from physical materials can immediately see:
  - how many resources are active
  - how many spots remain open today
  - the current booking-window size
- The quick-start flow now points directly to:
  - the public sports-access page
  - the public rules page
  - the transparency dashboard
  - Google sign-in for booking
- Linked the quick-start route from the sports-zone detail page and the reservation rules page so the physical pilot now has a web surface integrated into the existing product
- Verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`
  - local runtime returned `200` for `/en/play/`, `/en/beach-areas/sports-zone/`, and `/en/community/reservations/rules/`, with `/en/play/` links rendering as expected

### 2026-04-18 — Print-Ready Pilot Materials Added
- Added `/[lang]/play/materials/` as a print-friendly founder/ambassador materials page for the permission-light sports pilot
- The new materials route now includes:
  - a generated QR code pointing to the public quick-start page
  - sticker, flyer, and partner-poster copy blocks
  - founder pre-distribution checks so physical rollout stays tied to a working live system
- Added access points from:
  - `/[lang]/play/`
  - the community admin dashboard
- Added local QR generation support through the `qrcode` dependency and `src/lib/qr.ts`
- Verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`
  - local runtime returned `200` for `/en/play/materials/` and `/en/play/`, with the print action copy, production quick-start URL, inline QR SVG, and materials link all rendering as expected

### 2026-04-18 — Distribution Logging Added For Physical Pilot
- Added a D1-backed founder/ambassador distribution log for the permission-light pilot via `migrations/0007_distribution_logs.sql`
- Admin reservations now support logging real material placements through `/api/admin/reservations/distribution-logs/`
- The admin UI at `/[lang]/community/admin/reservations/` now captures:
  - distribution date
  - location type and location name
  - material type
  - quantity
  - optional field notes
- Added a recent-log view plus sidebar summary counts for:
  - distribution points
  - total materials placed
- Added full EN/HR/DE/IT translation coverage for the new admin controls
- Updated `MEMORY.md` and `docs/release-readiness.md` so physical-pilot operations and smoke tests include distribution logging
- Verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`

### 2026-04-18 — Founder Pilot Ops Page Added
- Added `/[lang]/community/admin/pilot/` as the founder-facing daily operating surface for the permission-light pilot
- The new admin page brings together:
  - today's reservation snapshot
  - active closures
  - recent collision reports
  - recent distribution placements
  - quick links to the public pilot surfaces and reservation admin
  - a reusable short script for explaining the pilot honestly on site
- Added direct access links from:
  - `/[lang]/community/admin/`
  - `/[lang]/community/admin/reservations/`
- Added full EN/HR/DE/IT translation coverage for the new admin pilot-ops route
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder sprint now explicitly includes the pilot-ops page in daily operations and smoke tests
- Verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`

### 2026-04-18 — Seed Community Toolkit Added
- Added `/[lang]/community/admin/seed/` as the founder-facing web toolkit for Phase 11.3
- The new seed page now includes:
  - a first-50-locals invite checklist
  - 3 starter meetup templates
  - lightweight helper / ambassador guidance
  - quick links back into the live community and pilot surfaces
- Updated `/[lang]/community/create/` so safe query-string defaults can prefill:
  - post type
  - category
  - title
  - body
  - location
  - event date and time
  - max participants
- This lets founder templates open directly as meetup drafts instead of only documenting ideas in text
- Added admin navigation links from the main admin dashboard and the pilot-ops page
- Added full EN/HR/DE/IT translation coverage for the new seed-community route and template copy
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder sprint now treats the seed-community toolkit as part of the daily web operations surface
- Verification passed:
  - `npm run check-i18n`
  - `npm run check-refs`
  - `npx astro check`
  - `npm run build`

### 2026-04-18 — Public Community Start Page Added
- Added `/[lang]/community/start/` as the public-facing onboarding layer for the founder sprint
- The new page turns invites, QR scans, and social links into one clear next-step flow:
  - check the public sports-access page
  - browse meetups
  - send one useful feedback signal
- It also explains:
  - who the first wave is for
  - how the first meetup rhythm should work
  - why one small useful action is enough for the pilot
- Linked the new route from:
  - `/[lang]/community/`
  - `/[lang]/play/`
  - `/[lang]/community/admin/seed/`
- Added full EN/HR/DE/IT translation coverage for the public start page
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder sprint now treats public onboarding as part of the production smoke path

### 2026-04-18 — Public Pilot Update Page Added
- Added `/[lang]/community/pilot/` as the shareable public status/narrative page for the founder sprint
- The new page explains:
  - what is live right now
  - what the pilot is not pretending to be
  - how locals and supporters can help this week
- It uses the live reservation transparency snapshot so the page reflects current resources, open slots, and collision rate instead of only static copy
- Linked the new route from:
  - `/[lang]/play/`
  - `/[lang]/community/start/`
- Added full EN/HR/DE/IT translation coverage for the pilot-update narrative layer
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder sprint now treats the public pilot update as part of the web narrative/smoke path

### 2026-04-18 — Founder Comms Kit Added
- Added `/[lang]/community/admin/comms/` as an admin-only founder communications surface for Phase 11.5
- The new page gives the founder:
  - one-line project framing
  - reusable bios
  - direct outreach starters
  - first-post scripts
  - messaging guardrails tied back to live public routes
- Linked the new route from `/[lang]/community/admin/`
- Added full EN/HR/DE/IT translation coverage for the comms-kit route
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder sprint now treats the comms kit as part of the internal narrative/smoke path

### 2026-04-18 — Founder Sprint Social Cards Added
- Added `/api/og/founder-sprint.svg` as a share-card endpoint for the founder sprint
- Wired `/[lang]/play/`, `/[lang]/community/start/`, and `/[lang]/community/pilot/` to dedicated OG/Twitter cards so first posts and WhatsApp shares stop using the generic site image
- Extended the layout metadata layer with `og:image:alt` and `twitter:image:alt` support
- Updated `WORKBOARD.md`, `MEMORY.md`, and `docs/release-readiness.md` so social-sharing readiness is now part of the Phase 11.5 web surface

### 2026-04-18 — Founder Publishing Pack Expanded
- Expanded `/[lang]/community/admin/comms/` so the founder now has a first-week publishing cadence in addition to message copy
- Added route-specific public URLs and social-card URLs for the pilot update page, start page, and quick-start page
- Kept the change inside the existing comms-kit surface instead of creating another admin route
- Updated `WORKBOARD.md`, `MEMORY.md`, and `docs/release-readiness.md` so the publishing pack is now treated as part of the Phase 11.5 web toolset

### 2026-04-18 — Public Support Page Added
- Added `/[lang]/community/help/` as the public founder-sprint support/action page
- The new route turns scattered “how to help” copy into one clear public destination for:
  - locals
  - helpers
  - venue staff
  - early supporters
- Added direct links into the new page from:
  - `/[lang]/community/`
  - `/[lang]/play/`
  - `/[lang]/community/start/`
  - `/[lang]/community/pilot/`
  - `/[lang]/community/admin/comms/`
- Extended the founder-sprint social-card system so `/[lang]/community/help/` also has a dedicated OG image surface

### 2026-04-18 — Pilot Coverage Planner Added
- Added a D1-backed coverage planner to `/[lang]/community/admin/pilot/` so founder, ambassador, and helper presence can be scheduled as real named blocks
- Added `/api/admin/reservations/coverage/` plus delete support for `/api/admin/reservations/coverage/[id]` so coverage blocks can be created and removed without falling back to private notes
- Added `migrations/0009_pilot_coverage_blocks.sql` and new reservation-library helpers so coverage scheduling is part of the shared pilot data model
- Pilot Ops now shows:
  - coverage blocks scheduled for today
  - total coverage hours across the next 7 days
  - upcoming named field blocks with focus-area notes
- Updated `WORKBOARD.md`, `MEMORY.md`, and `docs/release-readiness.md` so Phase 11.2 documentation now treats on-site coverage planning as a first-class web operating surface

### 2026-04-18 — Venue Validation Toolkit Added
- Added `/[lang]/community/admin/venues/` as the founder-facing Phase 11.4 surface for commercial validation before product sprawl
- The new admin page now provides:
  - a walk list for the 7 confirmed public venues plus 4 still-unconfirmed pavilion spaces
  - a sell-now / do-not-pitch split so commercial conversations stay grounded in real web surfaces
  - founder conversation prompts for validating demand before building heavier provider tooling
- Added D1-backed venue-signal logging through `/api/admin/venues/signals/`
- Added `migrations/0008_venue_validation_logs.sql` and `src/lib/venue-validation.ts` so buying signals can be stored and reviewed in the product instead of living only in founder notes
- Linked the new route from the main admin dashboard and the founder comms kit
- Added full EN/HR/DE/IT translation coverage for the Phase 11.4 toolkit

### 2026-04-18 — Founder Sell Sheet Added
- Added `/[lang]/community/admin/venues/sell-sheet/` as the lightweight founder sell sheet for Summer 2026 venue conversations
- The new route now packages the live proof points already present in the web product:
  - multilingual public site
  - current place and editorial footprint
  - live pilot and transparency links
  - a narrow sell-now offer set aligned with the sell-before-build rule
- Kept the route admin-only so commercial messaging can be refined before being shared more broadly
- Linked the sell sheet from the venue-validation toolkit so Phase 11.4 now has both a logging surface and a founder-ready one-pager

### 2026-04-18 — Printable Venue One-Pager Added
- Added `/[lang]/community/admin/venues/sell-sheet/print/` as the print-friendly version of the founder sell sheet
- The new route now gives venue walks a cleaner field format:
  - one-page framing for honest Summer 2026 conversations
  - QR codes into the public pilot update and venue directory
  - live proof-point counts pulled from the current site content
  - blank note space for decision-maker and follow-up details during the conversation
- Linked the print route from both the venue-validation toolkit and the main sell-sheet page so it fits the real founder walk flow

### 2026-04-18 — Public Support Signals Added And Tested
- Added a public D1-backed support-signal intake through `/[lang]/community/help/` and `/api/pilot-support-signals/`
- The help page now includes:
  - a structured support form for local intros, on-site help, venue connections, and grounded pilot feedback
  - inline success/error feedback instead of bouncing people to generic contact
  - direct card-level routing into the form for the “Send one real signal” path
- Added `migrations/0010_pilot_support_signals.sql` and `src/lib/pilot-support.ts` so support signals are stored, validated, and listed from product code instead of founder notes
- Extended `/[lang]/community/admin/seed/` so the founder can review recent support signals, contact details, and timing context inside the existing Phase 11.3 toolkit
- Ran a real local browser test on 2026-04-18:
  - submitted a support signal through `/en/community/help/`
  - verified the success state on the public form
  - verified the same signal appeared in `/en/community/admin/seed/`
- Updated `MEMORY.md` and `docs/release-readiness.md` so the support-intake path is now part of the founder-sprint web contract and smoke-test list

### 2026-04-18 — Support Signal Triage Queue Added And Verified
- Extended `src/lib/pilot-support.ts` with founder-triage support:
  - `new`
  - `followed up`
  - `handled`
  - archived
- Added `migrations/0011_pilot_support_triage.sql` so older local support-signal tables can be upgraded with triage columns and indexes
- Added `/api/admin/pilot-support-signals/[id]/` for admin-only status changes and archive actions
- Extended `/[lang]/community/admin/seed/` so support signals now show:
  - status badges
  - last-updated timestamps
  - summary counts by triage state
  - card-level actions for mark new, mark followed up, mark handled, and archive
- Ran a real local admin smoke test on 2026-04-18:
  - submitted 2 fresh support signals through `/api/pilot-support-signals/`
  - verified the schema auto-upgraded the local D1 table with triage columns
  - loaded `/en/community/admin/seed/` with the local admin session and confirmed both signals rendered in the founder queue
  - changed one signal to `followed up`
  - changed one signal to `handled`
  - archived the handled signal through the admin API
  - confirmed the archived signal disappeared from the seed page
- archived the temporary local test rows afterward
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder queue behavior is now part of the documented Phase 11.3 web contract

### 2026-04-18 — Support Signal Follow-up Notes Added And Verified
- Extended `src/lib/pilot-support.ts` and `migrations/0012_pilot_support_follow_up_notes.sql` so support signals can store an internal founder follow-up note without leaving the D1-backed queue model
- Extended `/api/admin/pilot-support-signals/[id]/` so admin PATCH requests can now save a follow-up note as well as a status change
- Extended `/[lang]/community/admin/seed/` so every support-signal card now includes:
  - an admin-only follow-up-note textarea
  - a save-note action
  - persisted note rendering after reload
- Ran a real local admin smoke test on 2026-04-18:
  - submitted a fresh support signal through `/api/pilot-support-signals/`
  - saved a founder follow-up note through `/api/admin/pilot-support-signals/[id]/`
  - verified the note persisted in the local D1 table
  - verified the note rendered back on `/en/community/admin/seed/`
  - archived the temporary local test row afterward
- Updated `MEMORY.md` and `docs/release-readiness.md` so the founder queue now treats follow-up notes as part of the Phase 11.3 operating contract

### 2026-04-29 — Public Sports Access Messaging Standardized Across All Languages
- Removed public-facing wording that implied volleyball courts, tennis, skate sessions, kayaking, SUP, or other sports areas could currently be rented or reserved through the site
- Standardized the live public message across EN / HR / DE / IT:
  - all sports activities are free
  - there is no current reservation system
  - sports areas are open to the public on a first-come, first-served basis
- Rewrote the public sports-access pages, activity pages, FAQ answers, sports-zone copy, and the older evergreen guides/articles so they all match the same real-world rule set
- Updated internal project docs (`MEMORY.md`, `docs/project-dossier.md`, `docs/release-readiness.md`) so the current documented product position matches the live public messaging

### 2026-05-02 — Disabled Reservation Writes And Tightened Sports Access Language
- Continued the website review and found two remaining consistency problems:
  - stale reservation-era wording was still present in shared EN / HR / DE / IT translation keys and a few admin surfaces
  - the reservation create/cancel APIs were still active even though the public product position is “no current reservation system”
- Disabled reservation write behavior on:
  - `/api/reservations/`
  - `/api/reservations/[id]/`
  - `/api/mobile/v1/reservations/`
  - `/api/mobile/v1/reservations/[id]/`
- Added a shared public-access status message so disabled API responses now explicitly state:
  - all sports activities are free
  - there is no current reservation system
  - sports areas are first-come, first-served
- Updated the admin pilot and admin access-controls surfaces so they speak in terms of:
  - sports access
  - closures
  - field conflicts
  - distribution logs
  rather than leftover reservation wording
- Tightened the remaining public-access translations in EN / HR / DE / IT so future UI reuse does not accidentally leak booking language back into the live site
- Follow-up cleanup:
  - disabled the old user-side reservation collision-report endpoint because it still depended on reservation IDs
  - removed write-action URLs from the mobile reservations read payload so the API contract no longer advertises disabled booking behavior
  - updated the Expo reference client and `apps/mobile/README.md` so the app now presents the same public sports-access model instead of stale booking-oriented tab names, policy tiles, and copy
  - corrected `MEMORY.md` so the mobile direction notes no longer claim reservation writes are currently available

### 2026-05-04 — Canonical Public Sports Routes Replaced Legacy Reservation URLs
- Continued the website review and fixed the last major public information-architecture mismatch:
  - the live copy already said there is no current reservation system
  - but the main public sports pages still lived under `/community/reservations/*`
- Added new canonical public routes:
  - `/[lang]/community/sports/`
  - `/[lang]/community/sports/rules/`
  - `/[lang]/community/sports/dashboard/`
- Converted the old public routes under `/[lang]/community/reservations/*` into redirects so older links still resolve without keeping reservation-shaped URLs as the main public path
- Repointed the public entry surfaces and founder/admin helper surfaces to the new canonical paths:
  - `/play/`
  - `/community/start/`
  - `/community/pilot/`
  - `/community/help/`
  - founder pilot/comms/seed/sell-sheet links
- Updated the high-signal project docs (`MEMORY.md`, `docs/release-readiness.md`, `docs/project-dossier.md`, and roadmap notes) so current route references and smoke-test expectations now match the live sports-access model
