# Short-Term Roadmap: Public Sports Reservations at Znjan

## Purpose

Build a public, community-first reservation system for the sports resources at Znjan Beach so residents and visitors can see availability in real time and make free reservations without hidden rules, paywalls, or opaque gatekeeping.

This should strengthen the site's role as public infrastructure for Split: useful, fair, multilingual, and transparent.

## Current Status

- Public schedule, booking/cancellation MVP, and admin closure controls are already implemented in the codebase.
- The public reservations flow now includes a published rules and pilot-scope page at `/[lang]/community/reservations/rules/`.
- A public transparency dashboard now exposes the current 7-day booking-window view for occupancy, closures, cancellations, collision rate, and busiest upcoming slot times.
- Collision reporting is now live in the codebase from day one through:
  - reservation follow-up for recent finished bookings
  - admin logging
  - ambassador logging through the admin surface
- A shared-capacity skate park session pilot is now live with daily beginner, open, and sunset sessions.
- The biggest short-term gaps are now exact basketball/cage-football operating counts and the next activity-slot candidate after the skate park pilot.

## Confirmed Resources We Can Plan Around Now

Based on the current content, research in the repo, and your latest on-site clarification, the short-term reservation MVP should focus on the fixed sports resources in the sports zone:

- 3 beach volleyball courts
- Basketball courts
- Cage football pitches
- 1 tennis court

These are the clearest reservable resources already documented or now directly confirmed for the project.

The next layer should include resources that are better handled as scheduled sessions instead of exclusive whole-area bookings:

- Skate park sessions, clinics, or community events
- Paddleboarding and kayaking slots if a public operator workflow exists
- Community-run training sessions, pickup games, or beginner classes

## Product Principles

- Publicly readable: anyone can browse the schedule without logging in.
- Free to reserve: no payments in the MVP.
- Fair by design: prevent one person or group from hoarding prime-time slots.
- Privacy-respecting: show slot status publicly, but keep personal data minimal.
- Multilingual from day one: EN, HR, DE, IT.
- Mobile-first: most people will check or book from their phone while already at the beach.
- Transparent governance: publish the reservation rules, limits, and usage stats openly.

## Short-Term Delivery Plan

### Phase 1: Foundation and Rules
**Target window:** April 16, 2026 to April 30, 2026

Deliverables:

- Confirm the exact inventory of reservable resources:
  - 3 volleyball courts
  - Number of basketball courts
  - Number of cage football pitches
  - 1 tennis court
  - Skate park reservation model: open access only, scheduled sessions, or hybrid
- Define the public booking rules:
  - Booking horizon, for example 7 days ahead
  - Slot length, for example 60 to 90 minutes
  - Daily and weekly limits per user
  - Cancellation cutoff
  - No-show policy
- Decide what is public on the calendar:
  - Minimum: slot status and activity type
  - Recommended: optional public team or organizer label
  - Never public: phone, email, or private notes
- Design the data model in D1 using the existing community stack:
  - `sports_resources`
  - `sports_availability_rules`
  - `sports_reservations`
  - `sports_blackouts`
  - `sports_reservation_audit_log`

Exit criteria:

- The booking policy is written and publishable.
- The system knows exactly what can be reserved and when.

### Phase 2: Public Read-Only Schedule
**Target window:** May 1, 2026 to May 15, 2026

Deliverables:

- Launch a public schedule page for all sports resources.
- Add individual resource views for each court, pitch, and scheduled skate resource.
- Show daily and weekly availability with clear states:
  - Available
  - Reserved
  - Closed
  - Past
- Publish a simple public data feed for transparency:
  - JSON endpoint for slot availability
  - Last updated timestamp
- Add multilingual booking rules and FAQ copy.

Exit criteria:

- Anyone can check availability without an account.
- The availability data is easy to read on mobile and desktop.

### Phase 3: Reservation MVP
**Target window:** May 16, 2026 to May 31, 2026

Deliverables:

- Reuse the existing community auth system for booking.
- Allow logged-in users to:
  - Reserve a free slot
  - Cancel their own reservation
  - See their upcoming reservations
- Enforce fairness and anti-abuse rules:
  - No overlapping reservations
  - Per-user booking caps
  - Duplicate booking prevention
  - Clear expiration and cancellation logic
- Add confirmation states and friendly error handling in all 4 languages.

Recommended MVP boundary:

- Public browsing stays open to everyone.
- Booking requires a lightweight account so abuse control is possible.

Exit criteria:

- A resident can sign in, reserve a court, cancel it, and see the result reflected publicly.

### Phase 4: Transparency, Admin Tools, and Activity Pilot
**Target window:** June 1, 2026 to June 15, 2026

Deliverables:

- Add a lightweight admin view for:
  - Blackout windows
  - Manual cancellations
  - Abuse review
  - Slot-level audit history
- Publish a simple transparency dashboard:
  - Reservations per field
  - Peak usage hours
  - Cancellation rate
  - Collision rate
  - Open vs reserved slot ratio
- Operationalize collision measurement from day one:
  - reservation follow-up tied to completed slots
  - admin/ambassador manual reporting
  - D1-backed incident counts surfaced publicly
- Pilot one activity-slot workflow beyond fixed fields:
  - Skate park community session
  - Beginner volleyball clinic
  - Public SUP or kayak slot if operator coordination exists

Exit criteria:

- The system is not just bookable, but accountable and understandable to the public.

## Recommended MVP Scope

Ship first:

- Beach volleyball courts
- Tennis court
- Basketball courts
- Cage football pitches
- Public schedule
- Logged-in booking and cancellation
- Public rules page
- Basic transparency dashboard

Wait until after MVP:

- Payments or deposits
- Private operator integrations
- Tournament brackets
- Waitlists
- QR check-in
- Automated penalties for no-shows
- Equipment-rental inventory management
- Full exclusive skate-park booking unless the operating rules clearly support it

## Technical Direction

Use the stack that already exists in this project instead of introducing a second system:

- Astro SSR pages for schedule and booking flows
- Cloudflare D1 for resources, reservations, and audit history
- Existing auth and session middleware for protected booking actions
- Existing i18n system for labels, rules, and error states

This keeps the reservation system aligned with the current community platform instead of fragmenting the project.

## Success Criteria for the First Release

- A person can open the site and understand court availability immediately.
- A logged-in user can reserve one of the fixed sports fields in under 2 minutes.
- The public can verify that reservations are being handled fairly.
- The system works in English, Croatian, German, and Italian.
- Admin intervention is possible without making the process opaque.

## Immediate Next Step

Finalize the remaining field-count confirmations and then choose the next shared-activity candidate after skate park:

- beginner volleyball clinics
- public SUP slots
- kayak sessions

That sequence keeps the system honest: the public rules, schedule, transparency metrics, and first activity pilot are already visible, so the next upgrade should extend the same openness to one more operator-backed or community-run activity flow.
