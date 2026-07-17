# Znjan.com Comprehensive Website Audit

**Audit date:** 2026-07-15
**Repository:** `C:\Users\ivanb\znjan.com`
**Production site:** <https://znjan.com>
**Scope:** End-to-end review of the public website, community/runtime APIs, content system, eight-language implementation, SEO/search, accessibility, performance, security/privacy, Cloudflare deployment, maintainability, documentation, and the Expo companion app.

## Executive assessment

Znjan.com has a strong public-facing foundation: the visual system is cohesive, the site is responsive, the static build is fast, Core Web Vitals are excellent, eight-language parity is enforced, the editorial footprint is large, and the technical SEO baseline is materially better than most local destination sites.

The site is not yet operating as a dependable “source of truth,” however. A production D1 schema mismatch currently breaks the public community feed, and the UI masks the server failure as a legitimate empty state. The build and health checks both pass despite that outage. There are also universal mobile-search defects, a markerless homepage map, nine confirmed localized 404 links, an empty events product, stale AI-facing and project documentation, material dependency vulnerabilities, an OAuth token-validation flaw, incomplete API validation/CSRF coverage, and a privacy notice that does not describe all actual processing and third parties.

The correct remediation order is:

1. Restore and verify the production community data path.
2. Add regression coverage, deployment gates, and application-aware health checks.
3. Patch the production dependency chain and harden authentication/API boundaries.
4. Repair universal UX, accessibility, map, Instagram, and localized-link defects.
5. Establish an editorial freshness/events/source-governance system.
6. Improve search/SEO precision, architecture, documentation, and the mobile companion.

No behavior-changing fixes were made during this audit.

## Overall scorecard

| Area | Assessment | Summary |
|---|---:|---|
| Visual design and responsiveness | Strong | Polished identity, clear hierarchy, coherent tokens, good desktop/mobile rendering. |
| Functional reliability | At risk | Community feed is broken in production; mobile search and homepage map are defective. |
| Performance | Excellent | Very good lab and field LCP/CLS; static assets are optimized and cached. |
| Accessibility | Good with material gaps | Lighthouse 93; contrast, names, third-party iframe titles, and duplicate IDs need work. |
| Technical SEO | Strong baseline | SEO audit 100, full canonicals/hreflang, parseable JSON-LD; metadata and sitemap precision need work. |
| Search | Functional foundation | Pagefind indexes 577 pages, but scopes entire pages and has a broken mobile entry point. |
| Content depth | Strong | 48 guide files and 256 article files across eight languages, with substantial word counts. |
| Content freshness/trust | At risk | Events are empty, freshness ownership is undefined, and time-sensitive claims lack a durable evidence model. |
| Internationalization | Strong parity, uneven implementation | 818 UI keys pass in all eight languages; some components and content architecture retain four-language assumptions. |
| Security | High-priority remediation required | Vulnerable runtime chain, unverified Google ID tokens, incomplete CSRF/update validation, and error leakage. |
| Privacy/legal | Incomplete | Notice omits actual third-party embeds and required processing details; legal review is needed. |
| Testing/operations | Weak | No automated test files or CI workflow; current health check produces false confidence. |
| Architecture/maintainability | Mixed | Good type/content foundations, but very large modules, runtime schema mutation, and documentation drift. |
| Mobile companion | Prototype-quality | Typecheck/export pass, but community feed is unavailable and dependency/security work remains. |

## Severity model

- **P0 — Critical:** Production outage, data/security condition, or monitoring failure requiring immediate action.
- **P1 — High:** Broad user impact, meaningful security/privacy exposure, or source-of-truth trust failure.
- **P2 — Medium:** Important quality, accessibility, SEO, performance, or maintainability issue.
- **P3 — Low:** Cleanup, minor optimization, or future-proofing item.

## Findings register

### P0 — Critical

#### A-001: The production community feed is down, while health monitoring reports success

**Evidence**

- `GET https://znjan.com/api/posts/` returns HTTP 500 with `D1_ERROR: no such column: google_id`.
- `GET https://znjan.com/api/mobile/v1/community/feed/` returns HTTP 503 with `community-feed-unavailable`.
- The public `/en/community/` page converts the 500 response into “No posts yet,” hiding the outage from visitors.
- `GET https://znjan.com/api/health/` returns HTTP 200 with `db_binding: ok` and `db_query: ok` because it only runs `SELECT 1`.
- `migrations/0002_google_oauth.sql` adds `users.google_id`, but the production database has not received the required schema state.
- `src/lib/community-schema.ts` attempts to create `idx_users_google_id` before its fallback adds the missing column. On an old `users` table, the index statement fails first, so the repair path is unreachable.

**Impact**

- The public community product and native community feed are unavailable.
- The UI communicates a false empty state instead of an error.
- Operational monitoring cannot distinguish a connected database from an application-compatible schema.
- Runtime schema mutation can fail repeatedly on new worker isolates.

**Recommendation**

Treat this as an incident: back up and inspect the remote D1 schema, apply the missing migration, correct schema initialization ordering, move to an explicit versioned migration process, add schema-aware health checks, and make the UI display a retryable error state for non-2xx responses.

### P1 — High

#### A-002: The production dependency chain contains material known vulnerabilities

**Evidence**

- Root `npm audit --omit=dev` reports **19 vulnerabilities: 11 high, 5 moderate, 3 low**.
- The affected production tree includes Astro and `@astrojs/cloudflare`, plus transitive `undici`, `ws`, Vite, Wrangler, and serialization/parser packages.
- The installed Astro version is 5.18.0; the repository uses many inline `define:vars` scripts, making Astro’s affected XSS surface relevant enough to prioritize.
- The Expo app’s production tree independently reports **19 vulnerabilities: 1 critical, 3 high, 14 moderate, 1 low**. Most are in Expo/build tooling, but they still require triage and upgrades.

**Impact**

Known vulnerabilities remain in deployed/runtime dependency graphs. Applicability varies by package and execution path, so this is not proof of exploitation, but the current posture is unacceptable for an authenticated community product.

**Recommendation**

Upgrade the Astro/Cloudflare/MDX stack as a coordinated, tested unit to versions that clear applicable advisories. Apply safe transitive fixes first; perform major upgrades in a separate compatibility branch. Keep the Tailwind 3→4 migration out of this security change to reduce risk.

#### A-003: Google ID tokens are decoded but not cryptographically verified

**Evidence**

`src/pages/api/auth/callback.ts` decodes the JWT payload with `atob()` and explicitly states that verification is unnecessary because the token came from Google over HTTPS. It does not verify the signature, `aud`, `iss`, `exp`, or require an appropriate `email_verified` state.

Google’s backend-auth guidance requires verifying the ID-token signature and the audience, issuer, and expiry claims before using its identity assertions: <https://developers.google.com/identity/sign-in/web/backend-auth>.

**Impact**

The authentication boundary relies on an unverified identity assertion. Even though the code exchanges an authorization code directly with Google, relying on decoded claims without validation contradicts the provider’s required verification model and weakens defense in depth.

**Recommendation**

Verify the ID token against Google’s JWKS with a Worker-compatible JOSE implementation or supported library. Validate `aud`, `iss`, `exp`, `sub`, and email authority/verification before creating or linking a user.

#### A-004: There is no automated test suite or CI gate

**Evidence**

- No tracked `*.test.*` or `*.spec.*` files were found.
- `package.json` has build/type/content checks but no unit, integration, end-to-end, link, accessibility, or API-contract test scripts.
- There is no `.github/workflows` directory.
- The current production outage, markerless map, mobile-search failure, and localized 404s all pass the existing build and content-reference checks.

**Impact**

The project has strong build-time schemas but no behavioral safety net. Regressions reach production even when every existing command passes.

**Recommendation**

Add unit/integration coverage for i18n helpers, API schemas, migration checks, and security boundaries; Playwright flows for public/mobile navigation, search, map, community error states, and language switching; a built-output link crawler; and a CI workflow that gates deployment.

#### A-005: Mobile search is broken on every page

**Evidence**

- `Header.astro` renders `SearchDialog.astro` twice—once for desktop and once inside the mobile menu.
- Both instances emit identical IDs (`search-trigger`, `search-dialog`, `search-input`, and related IDs).
- The component script uses global `document.getElementById()`, which binds only the first instance.
- Browser verification found two triggers and two dialogs; clicking the second/mobile trigger opened neither dialog.
- The static scan found duplicate search IDs on all 577 generated HTML pages.

**Impact**

The primary site-search entry point is inert on mobile. Duplicate IDs also invalidate document semantics and contribute to browser/accessibility inspector issues.

**Recommendation**

Render a single shared dialog, use scoped element references or unique IDs, and give both desktop/mobile controls explicit coverage in Playwright.

#### A-006: The homepage “interactive map” intentionally receives no markers

**Evidence**

`src/pages/[lang]/index.astro` constructs `mapMarkers` but renders:

```astro
<BeachMap lang={lang} markers={[]} zoom={15} fullWidth={true} />
```

The production homepage therefore downloads Leaflet and OpenStreetMap tiles but shows no places or beach-area markers.

**Impact**

A prominent homepage feature is functionally empty while still incurring third-party transfer, privacy, and main-thread cost.

**Recommendation**

Pass the prepared markers, validate popup links in all eight languages, and add a no-JavaScript fallback list/link.

#### A-007: Nine localized editorial links lead to confirmed production 404s

**Evidence**

The built-output crawl checked 26,427 internal href references and found nine unique missing static targets. They are hard-coded English slugs inside FR/ES/IT/NL/PL content for the parking guide and airport-transfer article. Production checks confirmed HTTP 404s, including:

- `/fr/articles/znjan-beach-parking-guide/`
- `/es/articles/split-airport-to-znjan-beach/`

`check-refs` does not parse MDX links, so the current validation suite misses them.

**Impact**

Users and crawlers hit 404s from high-intent transport/accommodation content. Internal authority and localized journey quality are weakened.

**Recommendation**

Generate cross-content links through localized URL helpers or resolve entity IDs during build. Add an output-level internal-link check to CI.

#### A-008: The events product is empty despite being a primary navigation promise

**Evidence**

- No `src/content/events` directory exists; the `news` collection is empty.
- The build emits repeated empty-loader warnings.
- All eight event hub pages are indexed and linked in the main navigation but only say “Events coming soon.”
- The official Visit Split calendar documented a three-day Žnjan first-anniversary program on 19–21 June 2026, yet the site has no event history or entry: <https://visitsplit.com/en/8042/lets-open-summer-together-celebration-of-the-1st-anniversary-of-the-znjan-plateau>.

**Impact**

The portal claims event coverage but has no functioning editorial pipeline. This is a direct source-of-truth and user-trust gap, not merely missing optional content.

**Recommendation**

Either temporarily remove/de-emphasize Events from primary navigation or launch a real pipeline with owner, sources, publication SLA, expiry/archive behavior, and structured-data validation.

#### A-009: The privacy notice does not describe the site’s actual processing and third parties

**Evidence**

- The policy names Google OAuth, OpenStreetMap, and Cloudflare Analytics, but not Instagram embeds, Meta/CDN requests, Google Fonts, Unpkg/Leaflet delivery, support-signal storage, or all community/admin data flows.
- Lighthouse observed an Instagram `csrftoken` third-party cookie on the homepage.
- The policy does not identify the controller, legal bases, retention periods, recipient/processor categories, international transfers, complaint authority, withdrawal/objection rights, or an effective/updated date.
- The public site accepts support contact data through `pilot-support-signals` but gives no field-level collection notice or retention statement.

European Commission guidance says a collection notice should state the controller, purposes/categories, legal basis, retention, recipients, non-EU transfers, rights, and complaint route: <https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr/what-information-must-be-given-individuals-whose-data-collected_en>.

**Impact**

Visitors do not receive a complete account of the processing that actually occurs. Third-party embeds may create consent/ePrivacy obligations that need qualified legal review.

**Recommendation**

Use a click-to-load/no-cookie façade for optional embeds, inventory all data/third parties, update the policy in all languages, add just-in-time notices, define retention/deletion procedures, and obtain Croatian/EU privacy counsel review. This audit is technical, not legal advice.

#### A-010: CSRF and write-validation coverage is incomplete

**Evidence**

- `src/middleware.ts` checks only POST, PUT, and DELETE; PATCH is omitted even though admin support-signal mutation uses PATCH.
- The check silently allows requests when either `Origin` or `Host` is absent.
- `src/pages/api/posts/[id]/index.ts` accepts update fields without the validation enforced by post creation, allowing invalid enums, lengths, values, or nullability to reach the database.
- Several 500 responses expose raw `detail` strings, as the production D1 error demonstrated.
- The public pilot-support signal endpoint has no authentication, rate limit, bot defense, or visible retention controls.

**Impact**

State-changing boundaries are inconsistent and easier to misuse. Error responses leak internal implementation details, and public submission paths are vulnerable to spam/abuse.

**Recommendation**

Centralize method-complete CSRF/origin policy, define a deliberate mobile/API auth model, validate create/update with shared Zod schemas, normalize public errors, add request IDs/structured logs, and add rate limiting or Turnstile where appropriate.

#### A-011: AI-facing and contributor documentation materially misstates the product

**Evidence**

- `public/llms.txt` claims four languages, no cookies, static-only architecture, event/news coverage, and Schema.org on all pages. The actual site has eight languages, session/Instagram cookies, hybrid runtime APIs, no event/news content, and 24 static pages without JSON-LD.
- It provides unlinked relative paths, which Lighthouse flags as an `llms.txt` quality failure.
- `README.md` is still the default Astro starter README.
- `AGENTS.md`, `CLAUDE.md`, `ASSUMPTIONS.md`, and `docs/ADR.md` retain four-language, 90-key, 100-page, static-only, and Tailwind 4 assumptions.
- Actual output is 577 HTML pages, 818 UI keys per language, Astro 5/Tailwind 3, Cloudflare runtime APIs, D1, OAuth/community, sports operations, and an Expo app.

**Impact**

Humans and AI agents receive incorrect operating instructions and product claims. This increases implementation mistakes and undermines the explicit AI-discoverability goal.

**Recommendation**

Replace the starter README, update canonical architecture/operations documentation, make `llms.txt` truthful and linked, and add a lightweight docs-drift check for core counts/configuration.

### P2 — Medium

#### A-012: Accessibility score is good, but several WCAG issues remain

Lighthouse scored the homepage **93/100** for accessibility on both mobile and desktop. Strengths include a skip link, semantic navigation/main landmarks, one H1 per static page, keyboard-operable menus, and stable layout.

Confirmed gaps:

- White hero CTA text on coral is approximately 2.87:1.
- The FAQ link is approximately 3.76:1.
- Footer location text is approximately 3.26:1.
- Instagram-generated iframes have no titles.
- The language button’s accessible name (“Select language”) does not contain its visible “EN” label.
- Every static page contains duplicate search IDs and duplicate SVG clip-path ID `zBadgeW`.
- The map uses `role="application"`, which creates a high-interaction semantic contract and should be reconsidered.

Recommendation: target WCAG 2.2 AA, add automated axe checks to representative templates, and verify focus/keyboard behavior for the dialog, mobile menu, language menu, map, and community forms.

#### A-013: Instagram embeds are stale, mislabeled, inaccessible, eager, and privacy-expensive

- The first configured Instagram post is removed/broken in production.
- Visible account/post content and configured captions do not consistently match.
- Four embeds load eagerly on every homepage language, creating a long page (roughly 10–12K px), four untitled iframes, third-party cookies, and the longest network dependency chain.
- Instagram contributes console errors and third-party execution/transfer.

Recommendation: remove stale posts immediately; replace raw eager embeds with local, accessible preview cards and load Meta content only after an explicit interaction/consent choice.

#### A-014: Performance is excellent, but third-party cost is disproportionate

**Measured production results**

- Desktop lab LCP: **554 ms**; CLS: **0**.
- Mobile Slow 4G / 4× CPU lab LCP: **776 ms**; CLS: **0**.
- Available CrUX p75 for the tested URL: LCP approximately **988 ms**; CLS **0**.
- Homepage third-party transfer observed: OpenStreetMap ~938 KB, Google Fonts ~226 KB, Unpkg ~209 KB, Instagram scripts ~140 KB plus embed imagery.
- Longest dependency chain was approximately **1.55 s**, driven by Instagram.

The baseline is therefore excellent; optimization should focus on privacy and unnecessary third-party work, not broad micro-optimization. Self-host fonts/Leaflet, lazy-load the map and embeds, and do not regress the current LCP/CLS.

#### A-015: Search indexes too much boilerplate and lacks content scoping

Pagefind successfully indexes **577 pages, 42,996 indexed words, and eight languages**, but no `data-pagefind-body` or exclusion markers are present. It therefore indexes headers, navigation, footers, and repeated page furniture. The UI fetches result data then filters by language client-side, and HR/PL stemming is not supported by the current Pagefind configuration.

Recommendation: scope indexing to the primary content, add metadata/filters for language/type, exclude empty/noindex/admin furniture, and measure first-search latency and relevance on real high-intent queries.

#### A-016: SEO coverage is broad, but metadata quality is inconsistent

Positive output scan results:

- 576 content pages have a title, description, canonical URL, OG image, valid `html lang`, one H1, and nine HTML hreflang entries including `x-default`.
- All emitted JSON-LD blocks parse as JSON.
- Lighthouse SEO score is 100.

Quality gaps:

- 160 titles exceed 65 characters; 16 are under 20.
- 200 descriptions exceed 165 characters; 144 are under 70.
- Overlong metadata is concentrated in translated articles/guides and beach-area pages; very short descriptions are concentrated in activities and places.
- 24 about/contact/privacy pages have no JSON-LD. That is not inherently wrong, but it contradicts documentation claiming schema on every page.
- Sitemap alternates exist for same-path hubs but not detail pages with localized slugs, even though HTML hreflang is correct.
- Empty event pages are included in the sitemap.

Recommendation: introduce metadata-length/uniqueness reports, prioritize high-impression pages using Search Console, add custom sitemap alternate relationships for localized detail slugs, and remove thin/empty sections from indexing until useful.

#### A-017: Content has scale but lacks a durable freshness/evidence model

- Guides: 48 language files, with median body length roughly 926–1,178 words by language.
- Articles: 256 language files, with median body length roughly 740–978 words by language.
- All have substantial bodies; none are thin by the 300-word check.
- Published/updated dates are concentrated on a few batch dates, suggesting campaign/bulk generation rather than continuous maintenance.
- Research ground truth is mostly dated February 2026; the business file contains a June 2026 Hotel Olivier update but still carries a February footer.
- Time-sensitive claims—pricing, lifeguards, seasonal hours, hotel opening, transport, venue status—do not consistently expose source URLs or `verifiedAt` dates in the content model.
- Current official evidence shows the Mövenpick Split project is still recruiting pre-opening leadership, so “opening for the 2026 season” needs revalidation rather than assumption: <https://careers.accor.com/global/en/job/general-manager-moevenpick-resort-split-in-movenpick-split-resort-hotel-split-croatia-jid-42708>.

Recommendation: add source provenance, owner, verification date, expiry/review cadence, and status confidence to volatile entities/claims; create an editorial dashboard/check that flags overdue verification.

#### A-018: Visual content coverage is incomplete and disconnected from the content model

- All five beach areas have photography.
- Six of seven activities have photography; tennis falls back to a gradient/emoji.
- Only five of twelve places have mapped photography. Seven place pages/listing cards use generic gradients.
- The content schemas support `images` and `heroImage`, but all 12 place YAML files currently leave them empty; page-level hard-coded maps provide the five photos instead.

Recommendation: move asset references/credits into validated content data, complete verified/authorized imagery for priority places, and ensure mobile API/Schema.org surfaces the same assets.

#### A-019: Homepage information architecture is polished but overlong and not sufficiently task-first

The homepage has strong visual storytelling and section hierarchy, but it stacks beach areas, transformation, places, activities, map, Instagram, FAQ, and footer into a very long page. High-intent utility—parking, getting there, current sports access, current events/status—does not dominate the first decision area. The empty-marker map and four embeds consume significant vertical and network space.

Recommendation: keep the brand story, but prioritize “Plan your visit” tasks, compress repeated card strips, remove/replace weak sections, and use analytics/search data to determine the final order.

#### A-020: Runtime schema creation and migration side effects are architecturally unsafe

`ensureCommunitySchema()` creates tables/indexes and deletes duplicate records at request time. A module-global promise only coordinates one isolate, not the deployment. This couples request success to DDL/DML, makes cold starts unpredictable, can create races, and obscures migration ownership.

Recommendation: make production migrations an explicit deployment step with a migration ledger and rollback/backup procedure. Runtime code should verify compatibility and fail clearly, not mutate schema/data.

#### A-021: Large modules and hybrid build coupling increase change risk

- `src/lib/sports-reservations.ts`: 2,157 lines.
- `apps/mobile/App.tsx`: 871 lines.
- Admin reservation page: 829 lines; other admin pages range from 562–680 lines.
- Each translation file is 867 lines.
- `dist/_worker.js` is ~10.69 MiB across 723 files, including a 2.48 MiB content-data chunk and 511 KiB translation chunk.

The site is nominally `output: 'static'`, but the Cloudflare adapter creates a hybrid worker containing dynamic endpoints and substantial content/runtime code.

Recommendation: split domain services and UI components, isolate public content from runtime APIs where practical, and define bundle/deployment-size budgets.

#### A-022: Security headers are generally good, but CSP is permissive and noisy

Positive headers include HSTS, `X-Content-Type-Options`, frame denial, a permissions policy, and strict-origin referrer policy.

Gaps:

- CSP requires `unsafe-inline` for scripts/styles.
- External Leaflet/Instagram/Google Font origins enlarge the trust boundary.
- `connect-src 'self'` blocks Leaflet’s source-map request, creating console errors on map pages.
- Popup/search code contains HTML string sinks. Current content is curated/static, but the sinks should not become paths for future user-controlled data.

Recommendation: self-host dependencies, use scoped DOM construction/textContent, remove unnecessary inline scripts or introduce nonces/hashes, and keep CSP regressions in CI/browser checks.

### P3 — Low

#### A-023: Astro diagnostics contain 32 hints

`npm run check` returns 0 errors and 0 warnings but 32 hints, primarily unused imports/variables and inline-script processing notices. Clean these while touching the affected modules, not as a standalone rewrite.

#### A-024: API discovery strings are inconsistent with trailing-slash routing

The mobile bootstrap advertises several web/API paths without trailing slashes while Astro/Cloudflare issues 301 redirects to slash forms. The current mobile app calls versioned endpoints with trailing slashes, so there is no confirmed app failure, but mutation clients should not depend on redirect semantics. Normalize documented/generated endpoints.

#### A-025: Contact is email-only

The contact page is clear and localized but offers no validated form, routing, spam protection, confirmation, or structured issue categories. This may be an intentional operating choice; if source-of-truth corrections are important, a small structured correction form would improve data quality once privacy/retention controls are ready.

## Domain-by-domain observations

### Architecture and code quality

**Strengths**

- Strict TypeScript/Astro checks pass.
- Zod content schemas, shared i18n helpers, localized URL helpers, and prepared SQL are good foundations.
- Static-first delivery is appropriate for destination content.
- Dynamic/admin routes are generally separated and role checks are consistently present on inspected admin APIs.

**Risks**

- Runtime DDL/DML, no tests, large modules, duplicated metadata across per-language MDX files, and static/dynamic bundle coupling.
- The documented “single multilingual file per entity” convention does not match long-form content, which uses one file per language while repeating four or five localized metadata entries in each file.

### Internationalization

**Strengths**

- Eight languages: EN, HR, DE, IT, FR, ES, PL, NL.
- 818 translation keys pass parity checks in every language.
- Localized slugs and full HTML hreflang sets are broadly correct.
- Representative French pages rendered localized navigation and content correctly.

**Gaps**

- `BeachMap.astro` has inline EN/HR/DE/IT ternaries; FR/ES/PL/NL receive English accessibility/loading text.
- Stale comments/docs still describe “core four” languages.
- Translation quality has not been demonstrated through native-speaker review; parity is structural, not linguistic proof.

### Deployment and operations

**Strengths**

- Cloudflare delivery, compression, immutable asset caching, HTTP/3, redirects, and custom 404 behavior work.
- D1 binding is present in production.
- Root and legacy Hotel Fanat/Amphitheater redirects work as tested.

**Gaps**

- Schema migration 0002 is absent in production.
- Health checks do not validate application readiness.
- No CI, deployment smoke suite, observability/error dashboard, or documented migration runbook was found.
- Session configuration warns during build that a `SESSION` KV binding is required; production binding state should be explicitly verified and documented rather than inferred from dashboard configuration.

### Mobile companion

**Strengths**

- `npm run typecheck` passes.
- `npx expo export --platform web` succeeds; the JS bundle is approximately 385 KB.
- The app uses versioned `/api/mobile/v1/*` endpoints and is deliberately read-first.

**Gaps**

- The community feed is unavailable because it shares the D1 failure.
- Native auth/write flows are not ready by design.
- No mobile tests exist.
- The Expo production dependency tree requires vulnerability triage and an upgrade plan.

## Verification record

| Check | Result |
|---|---|
| `npm run check-i18n` | Pass — 818 keys × 8 languages; content checks pass. |
| `npm run check-refs` | Pass — but does not inspect MDX href targets. |
| `npm run check` | Pass — 0 errors, 0 warnings, 32 hints. |
| `npm run build` | Pass — ~26 s; 577 pages indexed by Pagefind. |
| Root production dependency audit | Fail — 19 vulnerabilities (11 high). |
| Tracked test-file scan | No test files found. |
| Internal built-link crawl | Fail — 9 unique missing localized targets. |
| Static SEO/output scan | All core tags present; metadata-quality exceptions documented above. |
| JSON-LD parse scan | Pass for all emitted blocks. |
| Lighthouse mobile/desktop | Accessibility 93, Best Practices 73, SEO 100, Agentic Browsing 67. |
| Desktop performance trace | LCP 554 ms, CLS 0. |
| Mobile throttled trace | LCP 776 ms, CLS 0; CrUX p75 LCP ~988 ms, CLS 0. |
| Production `/api/health/` | HTTP 200, but false-positive for schema readiness. |
| Production `/api/posts/` | HTTP 500 — missing `users.google_id`. |
| Production mobile community feed | HTTP 503 — unavailable. |
| Production reservations/leaderboard/discover APIs | HTTP 200 in read-only checks. |
| Mobile TypeScript check | Pass. |
| Mobile Expo web export | Pass — ~385 KB JS bundle. |
| Mobile production dependency audit | Fail — 19 vulnerabilities (1 critical). |
| Place external-link sample | 10/11 returned 200; Radisson returned 403 to the audit client (likely bot protection, not confirmed broken). |

## Audit limitations

- Authentication was not completed and no mutation endpoints were exercised, so authenticated create/edit/join/admin journeys require follow-up testing in a safe staging environment.
- The remote D1 database was not modified or directly queried; schema conclusions come from production API errors and repository migrations/code.
- Privacy observations are technical and operational, not formal legal advice.
- Translation parity was verified, but native-speaker linguistic accuracy was not.
- Content facts were sampled against repository research and current primary sources; a full line-by-line fact check of 304 long-form localized documents is a separate editorial project.

## Bottom line

The public destination experience is visually credible, fast, and technically SEO-capable. The immediate problem is operational trust: an advertised product is broken, monitoring says it is healthy, and the user interface hides the failure. Once the incident, test/deployment safety net, and security/privacy boundaries are addressed, the remaining work is a tractable quality program rather than a rebuild.
