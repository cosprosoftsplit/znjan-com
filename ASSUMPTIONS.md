# Assumptions — znjan.com

> **Version:** 1.0
> **Date:** 2026-02-26
> **Review by:** Human stakeholder before Phase 3

---

## Explicit Assumptions (High Confidence)

### A1. Domain & Hosting
- **znjan.com** domain is owned and DNS is configurable
- Cloudflare account exists with Pages access
- Free tier is sufficient for launch traffic

### A2. Content Language
- English is the primary language (default, highest content priority)
- Croatian is the secondary language (local audience, highest translation quality)
- German and Italian are tertiary (tourist markets, AI-assisted translations acceptable at launch)
- All UI strings will be translated into all 4 languages before launch

### A3. Tech Stack
- Astro 5.x is stable and supports all required features
- Tailwind CSS 4 is production-ready
- Cloudflare Pages adapter for Astro is stable
- Pagefind supports multilingual indexing

### A4. Content Strategy
- Static site generation is appropriate (no user-generated content at launch)
- Content will be authored/managed by a small team (1-3 people)
- No CMS needed at launch — file-based content is sufficient
- MDX components (affiliate blocks, maps) will be defined before content authoring begins

### A5. Monetization
- Affiliate programs (Booking.com, GetYourGuide, Viator) accept new publishers
- Business listing tiers will be defined before approaching local businesses
- No paid features at launch — revenue comes after traffic builds

---

## Risky Assumptions (Needs Validation)

### R1. 4-Language i18n Complexity ⚠️
**Assumption:** We can manage 4 languages with localized URL slugs using a single-file multilingual pattern.
**Risk:** This is 2x more complex than any previous project (which used 2 languages). Build-time validation may not catch all translation issues. Localized slug management adds routing complexity.
**Mitigation:** Launch with EN+HR first, add DE+IT progressively. Build validation scripts early.
**Validate by:** End of Phase 3.

### R2. Places Directory Scope ⚠️
**Assumption:** The "places" directory covers businesses within ~500m of Znjan beach.
**Risk:** Too narrow = missing popular spots. Too broad = dilutes beach focus.
**Mitigation:** Start with obvious beach-adjacent businesses, expand based on user feedback.
**Validate by:** Human review of initial places list.

### R3. DE/IT Translation Quality ⚠️
**Assumption:** AI-assisted translations for German and Italian are acceptable for launch.
**Risk:** Poor translations damage credibility with DE/IT tourists. Grammar/cultural nuances may be wrong.
**Mitigation:** Flag AI-translated content, prioritize human review for high-traffic pages (home, top guides).
**Validate by:** Native speaker review of top 5 pages per language.

### R4. Content Volume for Launch ⚠️
**Assumption:** 3-5 pillar guides + 10-15 articles + 10-20 places is sufficient for a credible launch.
**Risk:** Too little content = thin site, poor SEO signals. Too much = delays launch.
**Mitigation:** Prioritize Cluster 1 (Visitor Essentials) — highest search intent, most useful content.
**Validate by:** Pre-launch content audit.

### R5. Znjan Beach Information Availability ⚠️
**Assumption:** Sufficient public information exists about the beach transformation, facilities, and businesses to populate content.
**Risk:** €45M transformation may still be partially in progress; information may be outdated or scarce.
**Mitigation:** Ground-truth with local visits, social media, local news sources.
**Validate by:** Content research phase.

### R6. Search Volume Assumptions ⚠️
**Assumption:** "Znjan beach" and related queries have meaningful search volume to justify the portal.
**Risk:** If search volume is very low, organic traffic won't materialize.
**Mitigation:** Broader "Split beaches" content captures higher-volume queries and funnels to Znjan-specific content.
**Validate by:** Keyword research with actual volume data.

### R7. No Authentication Needed ⚠️
**Assumption:** No user accounts, login, or personalization needed at launch.
**Risk:** Business owners may want to manage their own listings. Event organizers may want to submit events.
**Mitigation:** Contact form + manual curation at launch. Can add auth later if demand exists.
**Validate by:** Post-launch feedback.

---

## Dependencies

| Dependency | Type | Risk |
|-----------|------|------|
| Astro 5.x stable release | Technical | Low — already stable |
| Cloudflare Pages account | Infrastructure | Low — likely exists |
| Domain DNS access | Infrastructure | Low — assumed owned |
| Beach photography | Content | Medium — need quality photos |
| Local business information | Content | Medium — requires research |
| DE/IT translation review | Content | Medium — need native speakers |

---

## Assumption Review Schedule

| Milestone | Review Items |
|-----------|-------------|
| End of Phase 2 (project init) | A1, A3 — stack works as expected |
| End of Phase 3 (foundation) | R1 — i18n complexity manageable |
| Pre-launch content review | R2, R3, R4, R5 — content scope and quality |
| Post-launch (1 month) | R6, R7 — traffic and user needs |
