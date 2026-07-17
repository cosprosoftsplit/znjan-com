# Znjan.com Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use explicit acceptance criteria and are tracked in the progress snapshot below.

**Goal:** Restore production reliability, close the audited security and UX defects, establish deployment safety gates, and improve Znjan.com without regressing its multilingual coverage or performance.

**Architecture:** Deliver the program as independently deployable release batches. Protect behavior with Vitest, Cloudflare D1 fixtures, built-output checks, and Playwright before changing runtime, UX, privacy, SEO, editorial, or mobile behavior; validate each batch in Cloudflare preview and production.

**Tech Stack:** Astro 5, TypeScript strict mode, Tailwind CSS 3.4, MDX/YAML content collections, Vitest, Playwright, Cloudflare Pages, D1, KV, Pagefind, and GitHub Actions.

## Global constraints

- Preserve the production D1 backup and migration history; never mutate historical migration files.
- Use test-first development for every behavior change and reproduce confirmed defects before fixing them.
- Keep all eight languages structurally complete and use `src/lib/translations.ts` for new UI strings.
- Do not publish legal-compliance claims without qualified legal review or factual/event/image claims without verified sources and rights.
- Preserve the measured homepage LCP/CLS baseline and the expected generated-page inventory unless a change is documented.
- Deploy through an isolated branch, verify a Cloudflare-style preview, then merge and smoke-test production.

> **Status:** In progress. Phase 0 engineering and the production D1 reconciliation are complete; Phase 0 application safeguards await deployment.
> **Source audit:** `docs/audits/2026-07-15-comprehensive-website-audit.md`
> **Execution rule:** Work in the order below. Each task begins with a failing automated check where feasible and ends with production/staging evidence.

## Progress snapshot — 2026-07-17

| Release batch | Scope | Status |
|---|---|---|
| 0 | Tasks 0.1–0.6: D1 recovery, schema ordering, readiness, safe errors, honest feed UI | Complete locally; production D1 repaired; application deployment pending |
| 1 | Tasks 1.1–1.4: automated safety net, CI, preview and smoke gates | Next |
| 2 | Phase 2: dependencies, identity, validation, request security, observability | Pending |
| 3 | Phases 3–4: universal UX, accessibility, privacy and CSP | Pending |
| 4 | Phases 5–6: search/SEO, docs, provenance and editorial freshness | Pending; source/legal gates apply |
| 5 | Phases 7–8: architecture/mobile debt and final rollout controls | Pending |

## Objective

Restore production reliability, establish a regression/deployment safety net, close the highest-risk security/privacy gaps, repair universal UX and localized-link defects, and then improve editorial freshness, SEO/search precision, maintainability, documentation, and the mobile companion without regressing the site’s excellent performance.

## Operating principles

1. **Incident before enhancements.** The broken production community feed is Phase 0.
2. **Tests before implementation.** Capture each confirmed defect as a failing test/check first.
3. **One risk domain per change set.** Do not mix the framework major upgrade, Tailwind migration, content rewrite, and feature fixes.
4. **Back up before D1 changes.** Never apply a production migration without a verified backup/export and a rollback/forward-fix plan.
5. **Staging before production.** Auth, D1, CSRF, CSP, third-party embed, and dependency-major changes require a Cloudflare-style staging runtime.
6. **Preserve measured performance.** Homepage LCP and CLS are release gates.
7. **Eight languages are the product.** New UI/content changes require all-language parity and localized URL validation.
8. **Truth has ownership.** Volatile claims and events must have a source, verification date, owner, and review deadline.

## Proposed delivery sequence

| Phase | Outcome | Dependency |
|---|---|---|
| 0 | Community feed restored; health check detects schema drift | None |
| 1 | Tests, link crawler, CI, staging smoke gates | Phase 0 stabilized |
| 2 | Vulnerable runtime upgraded and auth/API boundaries hardened | Phase 1 safety net |
| 3 | Mobile search, map, localized links, Instagram, and accessibility fixed | Phase 1; security sequencing as noted |
| 4 | Privacy/CSP/third-party loading corrected | Phases 1–3 |
| 5 | SEO/search and AI-facing documentation made precise | Phases 1 and 3 |
| 6 | Events/freshness/source governance launched | Editorial owner identified |
| 7 | Architecture/docs/mobile debt reduced | Earlier behavior locked by tests |
| 8 | Production rollout, monitoring, and recurring audits | All release candidates pass |

## Phase 0 — Production incident: restore community data

### Task 0.1: Capture the outage as a reproducible contract failure

**Files**

- Create: `tests/integration/community-schema.test.ts`
- Create: `tests/integration/health-contract.test.ts`
- Reference: `src/lib/community-schema.ts`
- Reference: `src/lib/community-api.ts`
- Reference: `src/pages/api/posts/index.ts`
- Reference: `src/pages/api/mobile/v1/community/feed.ts`
- Reference: `src/pages/api/health.ts`

**Steps**

1. Build a D1-compatible test fixture representing the pre-0002 schema: `users` exists without `google_id`.
2. Add a failing test showing `ensureCommunitySchema()` attempts to create the `google_id` index before adding the column.
3. Add API contract checks asserting:
   - `/api/posts/` returns a JSON feed envelope with 200 when schema-compatible.
   - mobile feed returns 200 with the versioned envelope.
   - health returns non-200/readiness failure when required columns/migrations are absent.
4. Record the current production responses in the incident note; do not use production as the test runner.

**Acceptance**

- Tests fail for the current ordering/readiness logic and pass only after Tasks 0.3–0.5.

### Task 0.2: Back up and inspect the remote D1 database

**Files**

- Create: `docs/operations/d1-migrations.md`
- Update later: `wrangler.toml`
- Reference: `migrations/0001_initial.sql` through `migrations/0012_pilot_support_follow_up_notes.sql`

**Steps**

1. Confirm the production database ID and active Cloudflare account/project.
2. Export/backup the production D1 database and verify the artifact is readable.
3. Run read-only schema inspection:
   - `PRAGMA table_info(users);`
   - `PRAGMA index_list(users);`
   - inspect all tables/columns required by migrations 0001–0012.
4. Determine which migrations are absent; do not assume only 0002 is missing.
5. Record the observed production schema and backup/restore commands in the runbook.

**Acceptance**

- A verified backup exists outside the repository.
- The exact remote migration gap is documented.
- A forward-fix and restore decision is written before applying DDL.

### Task 0.3: Apply the missing production migration(s)

**Files**

- Use existing SQL under `migrations/`; add an idempotent forward migration only if inspection proves one is needed.
- Do not edit historical applied migrations in place.

**Steps**

1. Test the migration against a copied/staging database representing the observed production state.
2. Validate user/session/post counts and indexes before and after.
3. Apply to production during a controlled window.
4. Immediately check `/api/posts/`, mobile feed, auth/me, leaderboard, and reservations.
5. Preserve the backup until post-deployment verification completes.

**Acceptance**

- `/api/posts/` returns 200 without exposing `detail`.
- `/api/mobile/v1/community/feed/` returns 200.
- No existing user/session/community data is lost.

### Task 0.4: Correct schema initialization ordering

**Files**

- Modify: `src/lib/community-schema.ts`
- Test: `tests/integration/community-schema.test.ts`

**Steps**

1. Make the failing pre-0002-schema test the starting point.
2. Ensure required columns exist before indexes referencing them are created.
3. Remove destructive duplicate-cleanup statements from the request-time initialization path; move any required cleanup to an explicit migration.
4. Preserve safe behavior for a genuinely empty local development database.
5. Test concurrent initialization calls and retry behavior after a failure.

**Acceptance**

- Empty, current, and pre-0002 schema fixtures all behave deterministically.
- Request-time code does not delete production data.

### Task 0.5: Make health checks application-aware

**Files**

- Modify: `src/pages/api/health.ts`
- Create: `src/lib/readiness.ts`
- Test: `tests/integration/health-contract.test.ts`

**Steps**

1. Define a required schema/version contract for users, posts, sessions, and sports tables.
2. Check critical tables/columns without mutating them.
3. Return 503 for missing bindings, database failures, or incompatible schema.
4. Return a safe public response; do not expose raw D1 errors or binding secrets.
5. Add a distinct liveness/readiness interpretation to the operations runbook.

**Acceptance**

- The exact production condition from A-001 would have failed readiness.

### Task 0.6: Stop masking feed failures as empty states

**Files**

- Modify: `src/pages/[lang]/community/index.astro`
- Modify: shared client request helper if extracted
- Test: `tests/e2e/community-feed.spec.ts`
- Update: all eight `src/i18n/*.json` files

**Steps**

1. Add an end-to-end test that intercepts the feed with 500 and expects a localized retry/error state.
2. Reserve “No posts yet” for a successful 200 response with zero posts.
3. Add retry and non-blocking support/contact affordances.
4. Verify leaderboard failure independently so one widget does not hide another.

**Acceptance**

- Empty, loading, success, and error states are distinct in all eight languages.

## Phase 1 — Regression and deployment safety net

### Task 1.1: Establish the test stack

**Files**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/unit/`
- Create: `tests/integration/`
- Create: `tests/e2e/`

**Steps**

1. Add Vitest for pure/domain/API tests and Playwright for browser flows.
2. Add scripts: `test`, `test:unit`, `test:integration`, `test:e2e`, `test:a11y`, and `verify`.
3. Keep fixtures deterministic; do not point mutation tests at production.
4. Seed a local/staging D1 fixture from explicit migrations.

**Acceptance**

- One command runs type/content checks, unit/integration tests, build, and output validation.

### Task 1.2: Add built-output link and SEO integrity checks

**Files**

- Create: `scripts/check-links.ts`
- Create: `scripts/check-output-seo.ts`
- Modify: `package.json`
- Test: `tests/unit/check-links.test.ts`

**Steps**

1. Reproduce the nine current missing localized targets in a fixture.
2. Parse generated HTML hrefs, canonicals, hreflang, titles, descriptions, H1s, robots, and JSON-LD.
3. Support explicit allowlists for runtime routes and intentional external URLs.
4. Fail on internal 404 targets, malformed JSON-LD, missing canonical/lang/H1, and duplicate critical IDs.
5. Report metadata-length quality separately at first; promote agreed thresholds to gates after cleanup.

**Acceptance**

- The current nine broken links and duplicate search IDs fail the check.

### Task 1.3: Add representative Playwright coverage

**Files**

- Create: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/search.spec.ts`
- Create: `tests/e2e/map.spec.ts`
- Create: `tests/e2e/i18n.spec.ts`
- Create: `tests/e2e/community-feed.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`

**Minimum matrix**

- Viewports: desktop and 390px mobile.
- Languages: EN plus one Latin expansion language (FR/ES), HR, and PL; use structural parity checks for the rest.
- Templates: home, guides hub/detail, article detail, places hub/detail, activities, beach areas, events, contact/privacy, 404, community, sports.
- Flows: mobile menu, both search triggers, language switch on detail pages, marker popup, no-result/error states, legacy redirects.

**Acceptance**

- Current mobile-search and homepage-marker defects are captured as failing tests before fixes.

### Task 1.4: Add CI and deployment smoke gates

**Files**

- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/production-smoke.yml` or equivalent Cloudflare post-deploy hook
- Create: `scripts/smoke-production.ts`

**CI order**

1. Clean install using lockfiles.
2. `npm run check-i18n`
3. `npm run check-refs`
4. `npm run check`
5. unit/integration tests
6. `npm run build`
7. link/SEO output checks
8. Playwright smoke/a11y tests
9. dependency audit with an explicit reviewed policy

**Production smoke**

- Root redirect, eight homepages, sitemap/robots/llms, one detail page per template, readiness, posts, mobile feed, reservations, auth/me, custom 404.

**Acceptance**

- A missing D1 column, internal 404, dead mobile search, or empty-marker homepage blocks release or triggers immediate rollback/alert.

## Phase 2 — Runtime dependency and security boundaries

### Task 2.1: Triage and upgrade the Astro/Cloudflare dependency set

**Files**

- Modify: `package.json`
- Modify: `package-lock.json`
- Potentially modify: `astro.config.mjs`, `src/env.d.ts`, adapter-specific runtime types
- Test: entire Phase 1 suite

**Steps**

1. Save the current `npm audit --omit=dev --json` baseline.
2. Apply safe patch/transitive fixes in an isolated change and verify.
3. Create a separate compatibility change for the coordinated Astro, Cloudflare adapter, MDX, sitemap, and check-package upgrade required to clear applicable advisories.
4. Review Astro/adapter migration guides and Node runtime requirements before changing versions.
5. Keep Tailwind 3.4 during this phase.
6. Re-run static generation counts, worker routes, images, Pagefind, redirects, sessions, D1 APIs, and performance traces.

**Acceptance**

- No known high/critical vulnerability remains in an applicable deployed path without a documented exception/mitigation.
- 577-page coverage is intentionally preserved or changed with explanation.

### Task 2.2: Verify Google ID tokens correctly

**Files**

- Modify: `src/pages/api/auth/callback.ts`
- Create: `src/lib/google-id-token.ts`
- Test: `tests/integration/google-auth.test.ts`
- Modify dependencies/lockfile for the selected Worker-compatible verification library

**Tests first**

- Reject invalid signature.
- Reject wrong audience.
- Reject wrong issuer.
- Reject expired token.
- Reject missing/invalid `sub` and inappropriate email state.
- Accept a valid fixture and preserve language/state nonce behavior.

**Implementation**

1. Verify against Google JWKS with caching that respects key rotation.
2. Validate claims before database lookup/session creation.
3. Avoid logging tokens or full provider responses.
4. Retain OAuth state validation and secure cookie behavior.

**Acceptance**

- Only a verified identity assertion can create/link a user or session.

### Task 2.3: Centralize API input validation and public error handling

**Files**

- Create: `src/lib/api/schemas.ts`
- Create: `src/lib/api/responses.ts`
- Modify: `src/pages/api/posts/index.ts`
- Modify: `src/pages/api/posts/[id]/index.ts`
- Modify other public mutation endpoints as inventory requires
- Test: `tests/integration/posts-api.test.ts`

**Steps**

1. Define shared Zod schemas for post create/update, comments, joins, profile updates, support signals, and reservation mutations.
2. Derive partial-update rules deliberately; do not use an unconstrained blanket partial if fields have cross-field rules.
3. Validate enums, string lengths, coordinates, dates/times, participant limits, and language.
4. Return stable error codes/messages without raw exception details.
5. Add server-side response-contract tests.

**Acceptance**

- Create and update enforce the same domain constraints.
- Production errors contain a request ID, not database internals.

### Task 2.4: Complete CSRF/origin and abuse protection

**Files**

- Modify: `src/middleware.ts`
- Create: `src/lib/request-security.ts`
- Modify: `src/pages/api/pilot-support-signals.ts`
- Test: `tests/integration/request-security.test.ts`

**Steps**

1. Inventory every state-changing method, including PATCH.
2. Define browser same-origin enforcement and the future native-app authentication path separately.
3. Reject cross-site browser mutations using required origin/host and/or Fetch Metadata policy.
4. Decide how non-browser clients authenticate; do not weaken browser CSRF to accommodate future native calls.
5. Add per-user/IP/route rate limits and bot defense to public submissions.
6. Add size caps, retention fields, and abuse logging without storing unnecessary personal data.

**Acceptance**

- Cross-origin POST/PUT/PATCH/DELETE tests fail closed.
- Legitimate same-origin and explicitly authenticated native requests remain possible by design.

### Task 2.5: Add security observability

**Files**

- Create: `src/lib/logging.ts`
- Modify: API catch blocks and middleware
- Create/update: `docs/operations/incident-response.md`

**Steps**

1. Generate/request a correlation ID.
2. Log route, status class, safe error code, and correlation ID; redact tokens, cookies, emails, and submitted content.
3. Configure Cloudflare error/latency monitoring for readiness, posts, mobile feed, auth callback, and reservations.
4. Alert on repeated 5xx/503 and schema-readiness failures.

**Acceptance**

- The A-001 outage would alert before a visitor reports it.

## Phase 3 — Universal UX, map, link, Instagram, and accessibility fixes

### Task 3.1: Repair search architecture and mobile interaction

**Files**

- Modify: `src/components/layout/Header.astro`
- Modify: `src/components/widgets/SearchDialog.astro`
- Test: `tests/e2e/search.spec.ts`

**Steps**

1. Start from failing desktop/mobile trigger tests and duplicate-ID output check.
2. Render one dialog per document or use instance-scoped unique IDs/references.
3. Bind events within the component root, not global IDs.
4. Ensure dialog focus trap/return, Escape, backdrop click, result navigation, and screen-reader labeling.
5. Replace `innerHTML` result construction with DOM nodes and `textContent`; safely preserve Pagefind excerpt highlighting only through a reviewed sanitizer/format.
6. Measure first-open and first-query latency.

**Acceptance**

- Both desktop and mobile search triggers work on every representative template.
- No duplicate search IDs remain.

### Task 3.2: Restore meaningful homepage map behavior

**Files**

- Modify: `src/pages/[lang]/index.astro`
- Modify: `src/components/maps/BeachMap.astro`
- Update: all eight translation JSON files for map UI strings
- Test: `tests/e2e/map.spec.ts`

**Steps**

1. Assert markers and localized popup links in a failing test.
2. Pass `mapMarkers` instead of `[]`.
3. Replace four-language ternaries with `translations.ts` keys.
4. Build popup DOM safely; do not concatenate unescaped HTML.
5. Reconsider `role="application"`; provide a clear accessible name and fallback place list/link.
6. Lazy-initialize when near viewport or after interaction.

**Acceptance**

- Homepage markers are visible/clickable in all eight languages and map transfer is deferred until needed.

### Task 3.3: Fix localized editorial links and prevent recurrence

**Files**

- Modify the nine affected MDX references in:
  - `src/content/articles/getting-there-{fr,es,it,nl,pl}.mdx`
  - `src/content/articles/best-accommodation-{fr,es,nl,pl}.mdx`
- Prefer create/use: `src/components/content/LocalizedContentLink.astro` or a build-time remark plugin
- Test: `scripts/check-links.ts`

**Steps**

1. Confirm localized target slugs from the target content entries.
2. Replace English-slug hard-coding.
3. Add IDs/helpers so future internal links resolve from entity identity, not hand-typed URLs.
4. Run full output crawl.

**Acceptance**

- Zero unintended internal 404 targets across generated output.

### Task 3.4: Replace eager Instagram embeds

**Files**

- Modify: `src/content/global/site-config.yaml`
- Locate/modify the Instagram feed component under `src/components/`
- Add local preview assets only with documented permission/license
- Test: `tests/e2e/instagram.spec.ts`

**Steps**

1. Remove the deleted post and correct captions/account mapping.
2. Render accessible local cards/links by default with no Meta iframe/script/cookie.
3. Load the optional embed only after explicit user action/consent if embeds remain necessary.
4. Give every iframe a localized title.
5. Add a lightweight automated URL/status review and editorial expiration date.

**Acceptance**

- Initial homepage load makes no Instagram/Meta embed request.
- No broken posts or untitled iframes are shown.

### Task 3.5: Close confirmed accessibility failures

**Files**

- Modify relevant tokens/classes in `tailwind.config.mjs` and components
- Modify: `src/components/layout/LanguageSwitcher.astro`
- Modify SVG logo clip IDs/components
- Test: `tests/e2e/accessibility.spec.ts`

**Steps**

1. Add axe/Lighthouse assertions for representative pages.
2. Adjust coral CTA, FAQ link, and footer text colors to WCAG AA without changing brand character.
3. Make language accessible names contain the visible language code/name.
4. Remove duplicate `zBadgeW` IDs via unique IDs or inline clip strategy.
5. Verify keyboard focus and reduced-motion behavior.

**Acceptance**

- No confirmed contrast/name/duplicate-ID failures; representative pages meet the agreed WCAG 2.2 AA gate.

## Phase 4 — Privacy, third parties, and CSP

### Task 4.1: Create a data and third-party inventory

**Files**

- Create: `docs/privacy/data-inventory.md`
- Create: `docs/privacy/retention-schedule.md`
- Reference all public/auth/community/admin endpoints and `_headers`

**Inventory fields**

- Data category, source, purpose, legal basis candidate, storage, recipient/processor, transfer location, retention, access role, deletion method, user notice, security control.

**Acceptance**

- Google OAuth, D1 sessions/users/community, support signals, Cloudflare, Instagram/Meta, OpenStreetMap, Google Fonts, Unpkg/Leaflet, email, and any analytics are covered.

### Task 4.2: Rewrite the privacy notice and collection notices

**Files**

- Modify: `src/content/pages/privacy.yaml`
- Modify: support/community/login/profile forms for just-in-time notices
- Modify all eight localized values

**Steps**

1. Draft from the completed data inventory.
2. Add controller/contact, purposes/categories, legal bases, retention, recipients/transfers, rights, complaint authority, and effective/update date.
3. Describe optional embeds/cookies accurately.
4. Add account deletion/export operational path.
5. Obtain qualified legal review before publishing as compliant.

**Acceptance**

- Public behavior and policy match; reviewers can trace each collection point to a notice and retention rule.

### Task 4.3: Reduce CSP trust and console noise

**Files**

- Modify: `public/_headers`
- Modify: map/font/script loading components
- Test: `tests/e2e/csp.spec.ts`

**Steps**

1. Self-host Leaflet assets and production font files where licensing permits.
2. Remove unused external origins.
3. Eliminate the Leaflet source-map CSP error by serving/removing source-map reference, not by broadly opening `connect-src`.
4. Replace avoidable inline scripts; evaluate hashes/nonces for remaining code.
5. Run pages with CSP violation monitoring and zero expected console errors.

**Acceptance**

- No broad CSP relaxation; initial homepage requires fewer third-party origins and emits no expected CSP error.

## Phase 5 — SEO, search, sitemap, and AI-facing truth

### Task 5.1: Scope and improve Pagefind

**Files**

- Modify: `src/layouts/Base.astro` and/or page layouts
- Modify: `src/components/widgets/SearchDialog.astro`
- Test: `tests/e2e/search.spec.ts`

**Steps**

1. Add `data-pagefind-body` to primary content and exclusions to shared chrome.
2. Add metadata/filter attributes for language and content type.
3. Filter at search/index level rather than loading broad results then discarding languages.
4. Exclude empty events and noindex/runtime utility pages.
5. Create a relevance fixture for parking, transport, food, families, accessibility, sports, and venue names.

**Acceptance**

- Top results are language-correct and content-relevant; repeated nav/footer copy does not dominate excerpts.

### Task 5.2: Normalize metadata quality

**Files**

- Modify content frontmatter/YAML and selected `src/i18n/*.json` SEO keys
- Use: `scripts/check-output-seo.ts`

**Priority order**

1. Homepage and high-intent transport/parking/complete guides.
2. FR/ES/NL/PL article titles/descriptions with the highest overlength counts.
3. Beach-area descriptions that are too long.
4. Place/activity descriptions that are too short.
5. Contact/privacy title duplication (`… | Znjan.com`) and concise descriptions.

**Acceptance**

- No high-priority page has obviously truncation-prone or uninformative metadata; thresholds remain language-aware heuristics rather than blind clipping.

### Task 5.3: Emit correct localized sitemap relationships

**Files**

- Modify: `astro.config.mjs` or add a post-build sitemap generator
- Create: `scripts/check-sitemap.ts`

**Steps**

1. Build entity groups from localized slugs.
2. Emit alternate links for detail pages, including `x-default` if supported by the chosen mechanism.
3. Ensure every sitemap URL is canonical, 200, and indexable.
4. Exclude empty/noindex sections.

**Acceptance**

- Detail-page sitemap entries mirror the correct HTML hreflang clusters.

### Task 5.4: Replace stale `llms.txt` and contributor docs

**Files**

- Modify: `public/llms.txt`
- Replace: `README.md`
- Modify: `AGENTS.md`, `CLAUDE.md`, `ASSUMPTIONS.md`, `docs/ADR.md`
- Create: `docs/architecture/current-system.md`

**Steps**

1. Generate factual counts from code/content where practical.
2. State eight languages, hybrid static/runtime behavior, D1/community/auth, actual privacy/cookie behavior, and real content availability.
3. Add absolute Markdown links to key public pages in `llms.txt`.
4. Remove claims that events/news/schema exist everywhere.
5. Document Tailwind 3.4 and defer any Tailwind 4 decision to its own ADR.
6. Add current local/staging/production commands, bindings, migrations, and test gates.

**Acceptance**

- Documentation is internally consistent and a new contributor can reproduce the validated build/runtime workflow.

## Phase 6 — Editorial source-of-truth system

### Task 6.1: Define volatile-content provenance in the schema

**Files**

- Modify: `src/content/config.ts`
- Modify volatile entities in `src/content/places/`, `activities/`, `beach-areas/`, FAQ, guides/articles as appropriate
- Create: `scripts/check-freshness.ts`

**Suggested fields**

- `verifiedAt`
- `reviewAfter`
- `sourceUrls`
- `sourceType`
- `confidence`
- `editorialOwner`
- `status` and optional `statusNote`

**Steps**

1. Apply strict fields first to businesses, prices, opening statuses, transport, facilities, and events.
2. Flag expired reviews at build/CI; do not silently publish “current” claims past their review date.
3. Show “last verified” where it increases user trust.

**Acceptance**

- Every time-sensitive claim has an owner/source/review date or is explicitly labeled uncertain.

### Task 6.2: Launch the events lifecycle

**Files**

- Create: `src/content/events/` entries
- Modify: event schemas/pages as needed
- Create: `docs/editorial/events-runbook.md`
- Test: event structured-data/output checks

**Workflow**

1. Source from official Visit Split, City of Split, Žnjan d.o.o., venue/operator channels, and owner verification.
2. Track draft/published/cancelled/rescheduled/past states.
3. Define timezone, ticket/price source, venue, accessibility, and last-verified fields.
4. Archive past events and preserve useful historical pages; remove expired event schema where appropriate.
5. Publish under a defined SLA during season.

**Acceptance**

- Events is no longer an empty promise; upcoming and past states are useful in all supported languages or the navigation strategy is adjusted transparently.

### Task 6.3: Revalidate current high-risk facts

**Priority**

- Mövenpick Split opening/status and bookability.
- Venue seasonal status/hours and pricing.
- Parking price/availability.
- Lifeguard schedules and facility operation.
- Bus lines/timetables.
- Sports public-access policy.

**Acceptance**

- Each item has primary-source evidence and a future review date; unsupported specificity is removed.

### Task 6.4: Complete imagery and unify it with content data

**Files**

- Modify: place/activity YAML and schemas
- Remove hard-coded page image maps once data-driven rendering is ready
- Update mobile API image serialization and Schema.org output

**Steps**

1. Secure permission/license and credit metadata.
2. Add images for the seven place gaps and tennis, prioritizing real on-site/current media.
3. Store image/alt/credit in validated content data.
4. Verify responsive sizes, LCP/lazy behavior, and mobile API URLs.

**Acceptance**

- Every priority entity has current, authorized, correctly credited imagery or an intentional branded fallback.

### Task 6.5: Native-speaker and editorial quality review

**Steps**

1. Review the top landing pages and highest-intent articles in each language first.
2. Check idiom, Croatian local naming, units/currency/time formats, transport terminology, and claims.
3. Avoid mechanically forcing English metadata-length targets onto all languages.
4. Record reviewer and review date.

**Acceptance**

- Structural parity is supplemented by documented linguistic review for the pages most likely to rank or convert.

## Phase 7 — Architecture, operations documentation, and mobile companion

### Task 7.1: Replace request-time schema mutation with versioned deployment migrations

**Files**

- Modify/remove responsibilities in `src/lib/community-schema.ts`
- Create: migration ledger/check tooling
- Modify: deployment workflow and `docs/operations/d1-migrations.md`

**Steps**

1. Choose a single migration authority and ledger strategy.
2. Make deployment apply/verify migrations before routing traffic.
3. Make runtime readiness verify version only.
4. Add backup, rollback/forward-fix, and local/staging seed commands.

**Acceptance**

- Production requests never run schema DDL or cleanup DML.

### Task 7.2: Decompose large domain and UI modules

**Files**

- Refactor: `src/lib/sports-reservations.ts`
- Refactor admin pages under `src/pages/[lang]/community/admin/`
- Refactor: `apps/mobile/App.tsx`

**Suggested boundaries**

- Sports: policy, resource catalog, slots, availability, reservation commands, collision reports, serialization.
- Admin UI: page shell, filters, tables/cards, forms/dialogs, API client, translations.
- Mobile: navigation/screen state, API hooks, screen components, theme/components.

**Execution**

1. Add characterization tests before moving code.
2. Extract one boundary at a time without behavior changes.
3. Keep page components focused on composition.

**Acceptance**

- Domain modules are independently testable; no single feature file remains an unreviewable change hotspot.

### Task 7.3: Reduce worker/content coupling and set budgets

**Files**

- Inspect/modify Astro content imports and adapter routing
- Create: `scripts/check-budgets.ts`

**Budgets to track**

- Worker uncompressed/compressed size and file count.
- Largest server chunks.
- Homepage CSS/JS/image and third-party transfer.
- Pagefind index size and first-query latency.

**Acceptance**

- Budgets are recorded in CI; material growth requires explicit review.

### Task 7.4: Upgrade and test the mobile companion

**Files**

- Modify: `apps/mobile/package.json`, lockfile, and app modules
- Create mobile tests for `mobileApi`, screen states, and error handling

**Steps**

1. Restore feed via Phase 0.
2. Upgrade Expo/transitive dependencies in a dedicated compatibility change.
3. Add unit/component tests for loading/success/empty/error states.
4. Normalize documented endpoint URLs with trailing slashes.
5. Keep native auth/write disabled until a separate threat model and token/session contract are approved.

**Acceptance**

- Typecheck, native-target build/export checks, tests, and production read-only API smoke checks pass.

## Phase 8 — Rollout and recurring quality controls

### Task 8.1: Staging release candidate

Run:

```bash
npm run check-i18n
npm run check-refs
npm run check
npm run test
npm run build
npm run check-links
npm run check-output-seo
npm run test:e2e
```

Then run the Cloudflare-style runtime with staging D1/KV/OAuth configuration and verify every runtime API and authenticated flow.

### Task 8.2: Production rollout

1. Confirm D1 backup and migration state.
2. Deploy during a monitored window.
3. Run production smoke tests immediately.
4. Compare LCP/CLS, 4xx/5xx rate, worker errors, community/API success, and third-party requests with the baseline.
5. Roll back or forward-fix on any P0/P1 regression.

### Task 8.3: Recurring controls

- Per deploy: CI + production smoke + readiness.
- Weekly in season: events/venue/status review.
- Monthly: broken links, metadata/freshness, dependency audit, key Lighthouse pages.
- Quarterly: accessibility sampling, privacy/processor inventory, native-speaker priority-page review, D1 restore drill.

## Recommended first implementation batch

The first work session should contain only the following, in this order:

1. Task 0.1 — reproduce the D1/community failure in tests.
2. Task 0.2 — back up and inspect production D1.
3. Task 0.3 — apply the verified missing migration(s).
4. Tasks 0.4–0.6 — fix initialization, readiness, and honest UI error states.
5. Tasks 1.1–1.4 — build the safety net before broader changes.

Do not begin the framework upgrade, homepage redesign, content rewrite, or mobile write/auth work until that batch is complete.

## Definition of done for the remediation program

- Production community web and mobile feeds are healthy and monitored.
- Readiness fails on incompatible bindings/schema.
- No high/critical applicable production dependency vulnerability remains without documented mitigation.
- Google identity assertions are fully verified.
- All state-changing endpoints have consistent CSRF/auth, validation, rate/abuse, and safe-error behavior.
- Desktop/mobile search, map markers, localized internal links, Instagram fallback, and confirmed accessibility failures are fixed.
- Initial homepage load does not create optional Instagram cookies/requests.
- Zero unintended internal 404s; canonical/hreflang/sitemap clusters are consistent.
- Events and volatile facts have a maintained source/freshness workflow.
- `llms.txt`, README, architecture, and operations docs describe the actual system.
- CI, staging, production smoke tests, observability, backups, and migration runbooks are operational.
- Current LCP/CLS performance is preserved.
- Mobile read-only flows pass tests and dependency review; native auth/write remains gated behind an approved design.
