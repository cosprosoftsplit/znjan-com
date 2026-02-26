# Swarm Tickets — znjan.com

> **Version:** 1.0
> **Date:** 2026-02-26
> **Format:** P[priority] / T[ticket] — Title

---

## P0 — Must Have (Launch Blockers)

### P0/T001 — Initialize Astro project with full stack
**Description:** Create Astro 5.x project with TypeScript strict, Tailwind CSS 4, Cloudflare Pages adapter. Configure `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`.
**Acceptance:** `npm run dev` starts successfully, `npm run build` produces static output.
**Estimate:** S

### P0/T002 — Define all Zod content collection schemas
**Description:** Create `src/content/config.ts` with Zod schemas for all 11 content collections: beach-areas, activities, places, guides, articles, events, news, faq, pages, global, redirects.
**Acceptance:** All schemas validate sample content. TypeScript types generated correctly.
**Estimate:** M

### P0/T003 — Implement i18n system (4 languages)
**Description:** Build i18n infrastructure: route generation for EN/HR/DE/IT, localized slug mapping, language detection, UI string files (`src/i18n/*.json`), hreflang tag generation, language switcher component.
**Acceptance:** `npm run check-i18n` passes. All routes resolve for all 4 languages.
**Estimate:** L

### P0/T004 — Base layout with SEO meta tags
**Description:** Create `Base.astro` layout with HTML shell, meta tags (title, description, OG, Twitter), hreflang tags, structured data injection slot, Tailwind directives, font loading.
**Acceptance:** All pages render valid HTML with correct meta tags per language.
**Estimate:** M

### P0/T005 — Mediterranean design system
**Description:** Define design tokens in Tailwind config and `global.css`: Mediterranean color palette (ocean blues: `#0077B6`, `#00B4D8`, `#90E0EF`; sand: `#F4E8C1`, `#DEB887`; coral: `#FF6B6B`; white: `#FAFAFA`), typography scale, spacing, component patterns.
**Acceptance:** Design tokens documented and applied to base layout.
**Estimate:** S

### P0/T006 — Header, Footer, MobileMenu components
**Description:** Build responsive navigation with language switcher, mobile hamburger menu, footer with site links and language selector.
**Acceptance:** Navigation works on mobile and desktop. Language switcher routes to correct localized URLs.
**Estimate:** M

### P0/T007 — Home page (all 4 languages)
**Description:** Build home page with hero section (beach imagery), quick links to beach areas/activities/places, featured guides section, FAQ section.
**Acceptance:** Home page renders at `/en/`, `/hr/`, `/de/`, `/it/` with correct translations.
**Estimate:** L

### P0/T008 — Guide/Article page templates
**Description:** Create `Guide.astro` and article page layouts with TOC, breadcrumbs, author info, related content, affiliate block slots, structured data (Article schema).
**Acceptance:** Sample guide renders correctly with all components.
**Estimate:** M

### P0/T009 — Place detail page template
**Description:** Create `Place.astro` layout with business info, map embed, hours, contact, photos, reviews placeholder, structured data (Restaurant/BarOrPub schema).
**Acceptance:** Sample place renders with correct schema.org markup.
**Estimate:** M

### P0/T010 — Sitemap.xml (multilingual)
**Description:** Generate sitemap.xml with all pages in all 4 languages, including hreflang annotations per URL.
**Acceptance:** Sitemap validates, includes all language variants.
**Estimate:** S

### P0/T011 — robots.txt + llms.txt
**Description:** Create robots.txt allowing all crawlers, referencing sitemap. Create llms.txt with AI-friendly site summary.
**Acceptance:** Both files accessible at root URLs.
**Estimate:** S

### P0/T012 — Seed content — Visitor Essentials cluster
**Description:** Create initial content for Cluster 1: "Complete Guide to Znjan Beach Split (2026)" pillar + 3 cluster articles ("How to Get to Znjan Beach", "Znjan Beach Parking Guide", "Best Time to Visit Znjan"). All in EN, HR stubs.
**Acceptance:** Content renders on all page templates. Internal links work.
**Estimate:** L

### P0/T013 — Seed content — 5 starter places
**Description:** Create 5 place entries (mix of restaurants, bars, cafes near Znjan) with full multilingual data.
**Acceptance:** Places render on list and detail pages with correct structured data.
**Estimate:** M

### P0/T014 — Seed content — Beach areas
**Description:** Define initial beach zones: Main Beach, Kids Area, Sports Zone, Promenade, Amphitheater Area.
**Acceptance:** Beach area pages render with descriptions and facility info.
**Estimate:** M

### P0/T015 — Build validation scripts
**Description:** Create `scripts/check-i18n.ts` (translation parity) and `scripts/check-refs.ts` (entity cross-references). Wire into `package.json` scripts.
**Acceptance:** Scripts catch missing translations and broken references.
**Estimate:** M

### P0/T016 — Cloudflare Pages deployment pipeline
**Description:** Configure `wrangler.toml` or CF Pages direct integration. Set up build command, output directory, environment variables.
**Acceptance:** `git push` triggers build and deploy to CF Pages. Site accessible via CF domain.
**Estimate:** S

---

## P1 — Should Have (Launch Quality)

### P1/T017 — Pagefind search integration
**Description:** Add Pagefind for static site search. Index all content pages in all 4 languages. Add search component to header.
**Acceptance:** Search returns relevant results across all languages.
**Estimate:** M

### P1/T018 — Interactive beach map (Leaflet)
**Description:** Create client-side Leaflet map component showing beach zones, places, and facilities as markers/polygons. Load as Astro island.
**Acceptance:** Map renders on beach areas overview and home page. Markers link to entity pages.
**Estimate:** L

### P1/T019 — Activity pages and hub
**Description:** Build activities hub (`/[lang]/activities/`) and detail pages. Seed 5-8 initial activities (water sports, volleyball, cycling, etc.).
**Acceptance:** Activity pages render with correct structured data.
**Estimate:** M

### P1/T020 — Contact form via Cloudflare Workers
**Description:** Build contact form page and CF Worker endpoint for form submission. Include honeypot spam protection, rate limiting.
**Acceptance:** Form submits successfully, emails delivered, spam blocked.
**Estimate:** M

### P1/T021 — Breadcrumb component with Schema.org
**Description:** Build breadcrumb component that generates correct breadcrumbs per page type and language, with BreadcrumbList structured data.
**Acceptance:** Breadcrumbs render on all pages with valid schema.org markup.
**Estimate:** S

### P1/T022 — FAQ component with Schema.org
**Description:** Build FAQ accordion component that renders FAQPage structured data. Use on home page and relevant guide pages.
**Acceptance:** FAQ validates via Google Rich Results Test.
**Estimate:** S

### P1/T023 — Image optimization pipeline
**Description:** Configure Astro Image for automatic WebP/AVIF generation, responsive srcset, lazy loading. Create image component wrapper.
**Acceptance:** All images serve optimized formats with correct responsive attributes.
**Estimate:** M

### P1/T024 — Structured data validation
**Description:** Add build-time validation for all Schema.org structured data. Test key pages via Google Rich Results Test.
**Acceptance:** All structured data validates. No errors in Google Search Console.
**Estimate:** M

### P1/T025 — Seed content — Activities & Sports cluster
**Description:** Create Cluster 2 pillar guide "Things to Do at Znjan Beach" + 2-3 cluster articles.
**Acceptance:** Content renders correctly with internal linking to activities and beach areas.
**Estimate:** L

### P1/T026 — Seed content — Food & Drink cluster
**Description:** Create Cluster 3 pillar guide "Where to Eat & Drink at Znjan Beach" + 2 cluster articles.
**Acceptance:** Content renders correctly with internal linking to places.
**Estimate:** L

### P1/T027 — Events hub and detail pages
**Description:** Build events listing page and event detail template. Include event schema.org markup.
**Acceptance:** Events render with correct structured data.
**Estimate:** M

### P1/T028 — 404 page (multilingual)
**Description:** Create custom 404 page with language detection, helpful links, and beach-themed design.
**Acceptance:** 404 page renders in correct language with navigation back to key pages.
**Estimate:** S

---

## P2 — Nice to Have (Post-Launch Enhancements)

### P2/T029 — Affiliate block components
**Description:** Create reusable affiliate components for Booking.com, GetYourGuide, Viator. Use in guides and activity pages.
**Acceptance:** Affiliate blocks render with correct tracking parameters and `rel="sponsored"`.
**Estimate:** M

### P2/T030 — Business listing tiers
**Description:** Implement `listing_tier` field in places collection (free/featured/premium). Featured places get prominent placement.
**Acceptance:** Premium places appear first in directory listings with visual distinction.
**Estimate:** S

### P2/T031 — Newsletter signup component
**Description:** Build newsletter signup form (email only) with CF Worker backend. Double opt-in flow.
**Acceptance:** Signups work, confirmation emails sent, GDPR compliant.
**Estimate:** M

### P2/T032 — Weather widget
**Description:** Client-side weather widget showing current conditions at Znjan beach. Use free weather API.
**Acceptance:** Widget loads as Astro island, shows temperature and conditions.
**Estimate:** M

### P2/T033 — Seed content — Split Beaches cluster
**Description:** Create Cluster 4 pillar "Best Beaches in Split" + comparison articles (Znjan vs Bacvice, etc.).
**Acceptance:** Content renders with correct internal linking.
**Estimate:** L

### P2/T034 — Seed content — Transformation cluster
**Description:** Create Cluster 5 pillar "The €45M Transformation of Znjan Beach" + history articles.
**Acceptance:** Content renders with before/after imagery.
**Estimate:** L

### P2/T035 — News section
**Description:** Build news hub and article template for seasonal updates and beach development news.
**Acceptance:** News pages render with correct date ordering and structured data.
**Estimate:** M

### P2/T036 — Performance optimization audit
**Description:** Audit all pages for Core Web Vitals. Optimize LCP, FID, CLS. Target Lighthouse >90 across all metrics.
**Acceptance:** All key pages score >90 Performance, >95 Accessibility, >95 SEO.
**Estimate:** M

### P2/T037 — Ad slot placeholders
**Description:** Add reserved `<div>` slots in article and guide templates for future display ads. Include lazy-loading skeleton.
**Acceptance:** Ad slots present in DOM, don't affect layout without ad content.
**Estimate:** S

### P2/T038 — Social sharing meta tags
**Description:** Add OpenGraph and Twitter Card meta tags with beach-themed default images per page type.
**Acceptance:** Shared links show correct preview images and text on social platforms.
**Estimate:** S

### P2/T039 — RSS feed (per language)
**Description:** Generate RSS feeds for guides, articles, events, and news — one per language.
**Acceptance:** RSS validates and includes all published content.
**Estimate:** S

### P2/T040 — Accessibility audit
**Description:** Full accessibility audit: keyboard navigation, screen reader testing, color contrast, ARIA labels.
**Acceptance:** WCAG 2.1 AA compliance. Lighthouse Accessibility >95.
**Estimate:** M

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| P0 | 16 | Foundation — must complete for launch |
| P1 | 12 | Quality — should complete for credible launch |
| P2 | 12 | Enhancement — post-launch or stretch goals |
| **Total** | **40** | |
