# Release Readiness Checklist

This is the short operational checklist for shipping the dynamic community and sports-reservation layers cleanly.

## Verified Locally

- `npm run build`
- `npx astro check`
- `npm run check-i18n`
- `npm run check-refs`
- `npm run preview:runtime`

## Worktree Hygiene

- Generated local artifacts are ignored:
  - `.playwright-cli/`
  - `.wrangler/`
  - `output/`
- Keep runtime logs and preview state out of commits.
- Update `WORKBOARD.md` and `MEMORY.md` at the end of each implementation session.

## Cloudflare Pages Runtime Checklist

- Add the D1 binding named `DB` and point it to `znjan-community`.
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Cloudflare Pages environment variables.
- Confirm the Google OAuth callback URL is registered as:
  - `https://znjan.com/api/auth/callback`
- Redeploy after any binding or environment-variable changes.

## Smoke Test Before Release

- Public content pages still load in all 4 languages.
- `/en/community/` loads and signed-out state works.
- `/en/play/` loads as the QR/flyer quick-start entry point and links onward to reservations, rules, dashboard, and sign-in.
- `/en/play/materials/` loads as the print-ready pilot-materials page and renders the QR plus print actions.
- `/en/community/start/` loads as the public community onboarding page and gives clear paths into schedule, meetups, and feedback.
- `/en/community/pilot/` loads as the public pilot-update page and clearly explains what is live, what is not promised yet, and how to help this week.
- `/en/community/help/` loads as the public support page and gives helpers, locals, and supporters one clear action path instead of scattered founder-sprint copy.
- `/en/community/help/` can submit a real support signal and show inline success feedback instead of dropping the user into a generic contact flow.
- `/api/og/founder-sprint.svg?lang=en&surface=play` returns `200` and renders a real social card for the quick-start flow.
- `/en/play/`, `/en/community/start/`, `/en/community/pilot/`, and `/en/community/help/` each emit a dedicated founder-sprint `og:image` instead of the generic site image.
- `/en/community/admin/pilot/` opens for admins, stays hidden for non-admins, and shows the founder pilot-ops snapshot plus quick links.
- `/en/community/admin/pilot/` can schedule and remove named founder / ambassador / helper coverage blocks without broken form state.
- `/en/community/admin/seed/` opens for admins, stays hidden for non-admins, and shows the founder seed-community toolkit plus meetup template links.
- `/en/community/admin/seed/` shows recent public support signals after a successful `/en/community/help/` submission so founder follow-up is visible in product.
- `/en/community/admin/seed/` can move support signals between `new`, `followed up`, and `handled`, and can archive completed signals without leaving the founder queue in a broken state.
- `/en/community/admin/seed/` can save and reload internal founder follow-up notes on support-signal cards so the queue keeps actual outreach context, not just status.
- `/en/community/admin/venues/` opens for admins, stays hidden for non-admins, and shows the founder venue-validation toolkit with the 11 walk targets plus D1-backed signal logging.
- `/en/community/admin/venues/sell-sheet/` opens for admins, stays hidden for non-admins, and shows the lightweight founder sell sheet based on live web inventory rather than speculative app/channel promises.
- `/en/community/admin/venues/sell-sheet/print/` opens for admins, stays hidden for non-admins, and renders the printable venue one-pager with QR links into the live public pilot and venue directory.
- `/en/community/admin/comms/` opens for admins, stays hidden for non-admins, and shows the founder comms kit with reusable messaging, a first-week publishing cadence, and live public/social-card URLs tied to the pilot/start/play routes.
- Admin reservations page can log a founder/ambassador distribution placement and refresh the recent-log list.
- Admin venue-validation page can log a real venue conversation and refresh the recent-signal list.
- `/en/community/reservations/` shows the public schedule.
- `/en/community/reservations/rules/` shows the public policy and pilot scope.
- Signed-in users with recent finished reservations can submit collision follow-up from `/en/community/reservations/`.
- Reservation pages show the public trust framing:
  - coordination, not legal control
  - public slot visibility without personal detail exposure
  - a clear path to contact/report issues
- `/en/community/reservations/dashboard/` shows collision counts and collision rate, not just occupancy and cancellations.
- `/en/privacy/` reflects the live dynamic product:
  - Google sign-in
  - session cookies
  - public community content
  - anonymous public reservation availability
- `/en/contact/` clearly invites reservation-pilot issue reports and directory corrections.
- Google sign-in completes successfully.
- Admin reservation-closure page opens for admins and remains hidden for non-admins.
- Admin reservation page can log an admin or ambassador collision report.
- Admin reservation page can log distribution placements for QR stickers, flyers, posters, table cards, and handouts.
- Admin pilot-ops page shows recent collision reports, active closures, and recent distribution placements together.
- Admin pilot-ops page shows scheduled coverage blocks and next-7-days coverage totals so the physical pilot has an explicit human-presence plan.
- Admin seed-community page opens prefilled meetup templates into `/en/community/create/` without broken form state.
- Community and play entry points both link into `/en/community/start/` so invite traffic has a simpler public onboarding path than the raw feed alone.
- Community start and play entry points link into `/en/community/pilot/` so the project has a shareable public status/narrative surface before wider social distribution.
- Community, play, start, and pilot entry points all link into `/en/community/help/` so supporters and helpers have one clear public action page once they understand the pilot.
- Local 2026-04-18 smoke pass completed for support-signal triage:
  - public support-signal creation through `/api/pilot-support-signals/`
  - admin queue visibility on `/en/community/admin/seed/`
  - admin status changes through `/api/admin/pilot-support-signals/:id/`
  - admin archive flow with the signal disappearing from the active founder queue
- Local 2026-04-18 smoke pass also completed for support-signal follow-up notes:
  - admin note save through `/api/admin/pilot-support-signals/:id/`
  - note persistence in local D1
  - note rendering back on `/en/community/admin/seed/`
  - cleanup via admin archive after verification

## Remaining External Inputs

- Confirm final on-site counts for basketball and cage-football resources.
- Validate the live skate-park pilot assumptions on site:
  - beginner / open / sunset session times
  - session capacities
  - whether the pilot should stay daily or shift to selected days only
- Continue the photo pipeline once real image assets are available.

## Recommended Release Order

1. Configure production bindings and OAuth environment variables.
2. Run the smoke test above on the deployed site.
3. Announce the public sports-access pages only after the rules page, dashboard/update page, quick-start page, and printed QR/flyer flow all verify on production.
