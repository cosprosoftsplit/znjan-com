# Cloudflare Migration — Canonicalization Runbook

> Portfolio-wide ops note (not znjan-specific — kept here as the active repo; move to your ops vault if you prefer).
> Purpose: as Vercel projects migrate to **Cloudflare Pages / Workers**, set each one up **apex-canonical + HTTPS** correctly from day one.
> Reference implementations already done right: **znjan.com**, **ivanboban.com** (CF Pages).
> Source: portfolio canonicalization audit + fixes, 2026-06-02. See memory `cloudflare-account.md`.

## Why this exists

A 34-zone audit found canonicalization had never been standardized:
- **14 zones** served the site on **both apex *and* www with no redirect** (duplicate hosts → split SEO signals).
- **Almost all of those also had "Always Use HTTPS" OFF** (so `http://` and `http://www.` leaked too).
- These 14 are now fixed **at the Cloudflare edge** (zone-level redirect rule + Always-Use-HTTPS) → **migration-proof**: the fixes run before any origin, so they keep working when the origin moves from Vercel to CF.
- **5 zones are live Vercel apps** currently `www`-canonical (`apex→www` set in Vercel). **Do NOT fix these on Vercel** — it's throwaway work; bake the apex setup into the migration instead.

---

## The standard — apply to EVERY project at migration

1. **Apex = the primary custom domain** on the Pages/Workers project. Add `www` as a secondary domain (not primary).
2. **`www → apex` 301** via a **Redirect Rule** (dashboard template *"Redirect from WWW to root"*, or the API JSON below).
   - ⚠️ It **cannot** live in `public/_redirects` (path-only, can't match hostname) or a `functions/` dir (ignored once `@astrojs/cloudflare` emits `_worker.js`). This was the znjan gotcha.
3. **Always Use HTTPS = ON** — SSL/TLS → Edge Certificates. **Verify explicitly; do not assume** (it was off on nearly every zone).
4. **HSTS** header via `public/_headers`: `Strict-Transport-Security: max-age=31536000; includeSubDomains` (znjan already does this).
5. **`site: 'https://<apex>'`** in `astro.config.mjs` so canonical tags + sitemap emit the apex only.
6. **Verify** with curl — all three must 301 to a single `200` on the apex:
   ```bash
   for u in "http://APEX/" "http://www.APEX/" "https://www.APEX/"; do curl -sIL "$u" | grep -iE "^HTTP|^location"; echo; done
   # expect: each ends at HTTP 200 on https://APEX/...
   ```

## App-specific caution (auth / payments / API)

For functional apps — **mojtermin** (booking), **mojauplatnica** (payments), **fiskalapi** (fiscal API), **mojatvrtka** — the canonical host is wired into product surfaces. **Before** flipping canonical from `www` to apex, also update:
- **Cookie domain** (sessions scoped to `www.` won't carry to apex → users logged out).
- **OAuth / SSO redirect URIs** registered for `www.`.
- **Webhook / payment callback URLs** registered for `www.`.

Flip the DNS/canonical and these together, or sessions/integrations break.

---

## Per-project status (2026-06-02)

| Domain | Host now | Canonical now | Action at migration |
|---|---|---|---|
| znjan.com | CF Pages | ✅ apex + HTTPS | reference — done |
| ivanboban.com | CF Pages | ✅ apex + HTTPS | reference — done (also needs the *content* SEO pass — same stack as znjan) |
| cosmicproduction.hr, djmatthewbee.com, infodanas.com.hr, meridianchapters.com, mojahrvatska.com.hr, mojaprognoza.com.hr, mojhoroskop.com.hr, mojradnik.com.hr, mojrecept.com.hr, nomemeu.com, partyrentalcroatia.com, receitaminha.com | mixed | ✅ apex + HTTPS (CF edge rule) | **none** — rule is edge-level, survives migration |
| **mojtermin.com.hr** | Vercel `mojtermin` | www (307 in Vercel) | at migration: apex primary on CF + www→apex rule; update app auth/cookies |
| **mojauplatnica.com.hr** | Vercel `mojauplatnica` **+ CF Worker** | www (301) | untangle Worker vs Vercel first; then apex on CF; payments app → check callbacks |
| **fiskalapi.hr** | Vercel (project TBD — not in `ivan-bobans-projects` team's 3 fiskalapi projects) | www (307) | locate project/team first; then apex on CF |
| **mojatvrtka.com.hr** | Vercel (**not in `ivan-bobans-projects` team** → other team) | www (307) | locate team first; then apex on CF |
| fiskalapi.com.hr | redirects to www.fiskalapi.hr (cross-domain) | — | fold into fiskalapi.hr apex when that migrates |
| aidaboban.com | — | **HTTP 500 on apex+www** | site is broken — fix the app, separate from canonicalization |
| masterclass.hr, meinrechner.eu, mojkalkulator.com.hr, neurosystempsy.com, radionicesplit.com | various | ✅ already www→apex | none |
| bobanops.eu, coldinbox.eu, edukacijai.com, hnl.com.hr, horoscopomeu.com, horoscopulmeu.com, kalkulo.eu, vanbee.eu | various | no `www` configured | only act if you want `www` to resolve |

> Note: you also appear to have a **second Vercel team** (fiskalapi.hr + mojatvrtka.com.hr aren't in `ivan-bobans-projects`) and possibly more domains under a different login — audit those the same way when convenient.

---

## Reusable Cloudflare API snippets

Run from the **dash.cloudflare.com** page context (browser console or automation) while logged in. Same-origin `fetch` with `credentials:'include'` works for GET **and** writes — no separate CSRF token needed.

**Enable Always Use HTTPS:**
```js
await fetch(`/api/v4/zones/${zoneId}/settings/always_use_https`, {
  method:'PATCH', credentials:'include',
  headers:{'content-type':'application/json'}, body: JSON.stringify({ value:'on' })
});
```

**Add the `www → apex` 301 redirect rule** (PUT replaces the phase entrypoint — only safe when the zone has no other dynamic-redirect rules; otherwise GET, append, PUT):
```js
await fetch(`/api/v4/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
  method:'PUT', credentials:'include', headers:{'content-type':'application/json'},
  body: JSON.stringify({ rules: [{
    action:'redirect',
    expression:'(http.request.full_uri wildcard r"https://www.*")',
    description:'Redirect from WWW to root',
    enabled:true,
    action_parameters:{ from_value:{
      preserve_query_string:false, status_code:301,
      target_url:{ expression:'wildcard_replace(http.request.full_uri, r"https://www.*", r"https://${1}")' }
    }}
  }] })
});
```
List all zones: `GET /api/v4/zones?per_page=200` → `result[].{id,name}`. (This account: 1 account, 34 active zones.)

---

## Already done (do NOT redo)

14 zones are apex-canonical + Always-Use-HTTPS as of 2026-06-02 (znjan.com via the dashboard template; the other 13 via the API above). All verified at the edge. Because these are **edge-level zone rules**, they persist through the Vercel→CF migration unchanged.
