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

- [ ] **1.1 Push to GitHub**
  - Scope: Stage all tracked changes, commit, push to `main`
  - Verify: `git log --oneline -1` shows commit on `main`; GitHub repo reflects changes
  - Depends on: User approval
  - Notes: Large staged diff (P3 content + A++ upgrade). May need to split commits.

- [ ] **1.2 Cloudflare Pages Setup**
  - Scope: Connect GitHub repo → CF Pages, configure build settings
  - Build command: `npm run build`
  - Output dir: `dist`
  - Node version: Check `.node-version` file
  - Verify: Site loads at configured domain; all 4 languages render; nav works
  - Depends on: 1.1 + user's CF account access

- [ ] **1.3 Custom Domain**
  - Scope: Point `znjan.com` DNS to CF Pages
  - Verify: `curl -I https://znjan.com` returns 200; HTTPS works
  - Depends on: 1.2 + user's DNS access

- [ ] **1.4 Post-Deploy Smoke Test**
  - Scope: Verify all critical pages load in production
  - Check: Homepage (4 langs), places listing, article pages, 404 page, hreflang tags, OG meta, structured data
  - Verify: No broken links, no missing assets, no console errors
  - Depends on: 1.3

---

## Phase 2: Search (Pagefind UI)
**Goal:** Users can search the site
**Priority:** HIGH — content exists but isn't discoverable

- [ ] **2.1 Pagefind Search Component**
  - Scope: Create `src/components/Search.astro` with Pagefind UI
  - Requirements: Multilingual (search in current language), keyboard accessible, responsive
  - Verify: Build succeeds; search input appears; typing returns results from indexed content
  - Reference: Pagefind docs for Astro integration

- [ ] **2.2 Search in Navigation**
  - Scope: Add search icon/button to Header that opens search overlay or navigates to search page
  - Verify: Search accessible from every page; works on mobile

- [ ] **2.3 Search i18n**
  - Scope: Add translation keys for search placeholder, no-results message, etc.
  - Verify: `npm run check-i18n` passes; search UI shows correct language strings

---

## Phase 3: Maps (Leaflet + OpenStreetMap)
**Goal:** Interactive map showing beach zones, businesses, parking, etc.
**Priority:** MEDIUM — high user value but not blocking

- [ ] **3.1 Leaflet Component**
  - Scope: Create `src/components/BeachMap.astro` with client-side Leaflet
  - Requirements: Show Znjan Beach area, custom markers for places/zones, popup with name + link
  - Verify: Map renders; markers are clickable; doesn't break SSG build

- [ ] **3.2 Coordinates Audit**
  - Scope: Verify/add GPS coordinates to all places, beach-areas, activities YAML
  - Verify: `npm run check-refs` passes; all coordinate fields populated

- [ ] **3.3 Map on Key Pages**
  - Scope: Embed map on: homepage (overview), places listing (all venues), individual place pages (single marker)
  - Verify: Maps render on all target pages; responsive on mobile

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

- [ ] **5.1 Cloudflare Web Analytics**
  - Scope: Add CF Analytics beacon to `Base.astro`; configure in `site-config.yaml`
  - Verify: Analytics appear in CF dashboard after deploy

- [ ] **5.2 robots.txt & Sitemap Verification**
  - Scope: Confirm robots.txt allows crawling; sitemap.xml lists all 261 pages; submit to Google Search Console
  - Verify: GSC shows sitemap accepted; pages indexing

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

### 2026-03-03 — Workboard Created
- Created `WORKBOARD.md` as self-maintaining project board
- Audited all remaining work across 7 phases
- Established session protocol and verification standards
- Items completed: 0 (setup session)
- Build status: PASS (261 pages, check-i18n OK, check-refs OK)
