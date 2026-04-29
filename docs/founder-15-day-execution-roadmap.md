# Znjan.com Founder 15-Day Execution Roadmap

Last updated: 2026-04-17

## Purpose

This document compresses the larger flagship roadmap into a founder-executable 15-day sprint.

It is not the full vision document. It is the near-term operating plan for one volunteer founder who is trying to:
- ship a credible public reservation pilot
- seed the first real community usage
- validate venue demand before building heavy commercial tooling
- create enough trust and momentum that the bigger roadmap becomes believable

Use this as the decision document for the next 15 days.

## North Star

At the end of this sprint, Znjan.com should feel like a real civic utility in public, not just a promising codebase.

That means:
- the dynamic site works in production
- the public reservation pilot is visible and understandable
- people on-site can discover it through QR/flyer distribution
- a first local seed community exists
- the first venue demand signals are real
- the project has a simple story it can tell publicly

## What Success Looks Like By Day 15

These are the only outcomes that matter in this sprint:

1. Production runtime is verified on `znjan.com` for community auth and reservations.
2. The public reservation pilot is live, honest, and measurable:
   - schedule page
   - rules page
   - transparency dashboard
   - collision logging
3. A permission-light physical layer is active:
   - QR stickers
   - flyers
   - partner-venue handouts
4. The first seed community exists:
   - 50 invited locals
   - 3-5 Ambassadors or equivalent helpers
   - 3 scheduled meetups
5. Commercial demand is validated before product sprawl:
   - all 11 pavilion venues walked
   - sell sheet ready
   - 3-5 real signals of demand collected
6. Social/media is no longer "to be figured out later":
   - handles standardized
   - first 7-day publishing cadence started

If these six things are true, the next 90 days become execution. If they are false, the larger roadmap is still mostly theory.

## Non-Goals For This Sprint

Do not let these consume the next 15 days:

- App Store or Play Store launch
- native auth implementation
- provider self-serve dashboard beyond a lightweight mock or manual ops
- paid promo inventory beyond what venues already say they want
- Znjan Radio
- B2B dashboard
- white-label Place-OS
- AR features
- deep gamification expansion
- polished event platform beyond basic useful event publishing

Those are later-stage accelerants. The next 15 days are about trust, legitimacy, and proof.

## The Four Hard Gates

### Gate 1: Trust and Production Readiness

Before public push, verify:
- Cloudflare D1 binding is correct
- Google OAuth production env vars are correct
- signed-out and signed-in community flows work
- reservation pages load publicly in production
- admin reservation controls are protected
- privacy, consent, and retention choices are defined enough for public use

If this gate fails, do not spend energy on promotion.

### Gate 2: Legitimacy Pilot

Before claiming there is a "system," verify:
- reservation honesty framing is visible
- collision logging is active
- QR/flyer materials exist in the real world
- at least some partner venues or handout points exist
- one founder or Ambassador coverage block is scheduled

If this gate fails, the reservations pilot is still only digital.

### Gate 3: Community Seed

Before opening wide, verify:
- 50 locals are invited directly
- first 3 meetups are scheduled
- moderation workflow is usable
- provisional local trust path exists

If this gate fails, the community layer will look empty.

### Gate 4: Commercial Validation

Before building dashboards and self-serve billing, verify:
- all 11 pavilions are mapped
- a simple sell sheet exists
- 3-5 venues give a real buying signal
- the launch inventory list is frozen to what is actually sellable now

If this gate fails, commercial product work should stay manual.

## Day-by-Day Plan

## Days 1-3: Production and Public Trust

### Day 1

- Confirm Cloudflare production bindings and OAuth configuration
- Run a full production smoke test on:
  - `/en/community/`
  - `/en/community/reservations/`
  - `/en/community/reservations/rules/`
  - `/en/community/reservations/dashboard/`
  - Google sign-in
- Create a short failure list and fix only blocking issues

### Day 2

- Publish or tighten the public-facing trust docs:
  - reservation rules
  - honesty framing
  - privacy/data note
  - moderation expectations
- Make sure collision logging is recorded through:
  - reservation follow-up state
  - admin log
  - Ambassador/founder manual report

### Day 3

- Run the same smoke test again after fixes
- Lock the launch baseline:
  - what works now
  - what is not promised yet
- Write a one-page founder operating note for daily checks during the sprint

## Days 4-6: Physical Legitimacy Layer

### Day 4

- Design the permission-light pilot kit:
  - QR sticker
  - reservation explainer flyer
  - small table or handout card
  - partner-venue poster
- Keep all messaging honest:
  - "community coordination"
  - not legal authority

### Day 5

- Print the first batch
- Place/distribute materials yourself:
  - with the 11 bars/restaurants where possible
  - on-person for beach handouts
  - at any tolerated on-site touchpoints
- Log where each material type was distributed

### Day 6

- Test whether people actually understand the materials
- Simplify copy if anyone is confused
- Schedule the first founder or Ambassador on-site block

## Days 7-9: Seed Community and Meetups

### Day 7

- Recruit 3-5 initial Ambassadors or equivalent trusted helpers
- If formal Ambassadors are not ready, use a lighter helper model for the pilot
- Set exact coverage windows for the next 2 weekends

### Day 8

- Invite the first 50 locals manually
- Use a provisional local trust path for people you already know are real locals
- Make sure every invite has a clear action:
  - create account
  - browse schedule
  - join a meetup
  - give feedback

### Day 9

- Schedule 3 meetups
- Publish them clearly
- Make moderation and posting feel alive:
  - no empty feed
  - no confusing dead ends

## Days 10-12: Commercial Validation, Not Commercial Sprawl

### Day 10

- Walk every pavilion venue
- Document:
  - venue name
  - decision-maker if known
  - digital presence
  - likely fit
  - current gaps

### Day 11

- Prepare one printed sell sheet and one lightweight mock of analytics/value
- Keep the initial offer simple:
  - featured listing
  - homepage visibility
  - event promotion
  - maybe web popup
- Do not pitch app inventory or sponsor reach that does not exist yet

### Day 12

- Conduct the first serious venue conversations
- Collect concrete signals:
  - yes
  - maybe with conditions
  - not now
- Freeze the Summer 2026 launch inventory around what venues actually respond to

## Days 13-15: Narrative, Review, and Public Momentum

### Day 13

- Standardize owned social handles and bios
- Publish the first 3-5 posts from a simple content set:
  - what Znjan.com is
  - how reservations work
  - what is happening this week
  - first community or meetup post

### Day 14

- Publish a short transparency-style update:
  - what is now live
  - what the pilot is
  - what it is not
  - how people can help
- Keep it calm and civic, not hype-driven

### Day 15

- Review the sprint against the six success outcomes
- Decide what the next 30 days are really about:
  - deeper legitimacy
  - stronger community
  - venue conversion
  - mobile/backend work
- Cut anything that did not prove itself

## Daily Scoreboard

Track these every day during the sprint:

- production status: green or blocked
- reservation pilot status: live and understandable, yes or no
- number of QR/flyer distribution points
- number of invited locals
- number of active trusted helpers
- number of scheduled meetups
- number of pavilion conversations completed
- number of real commercial signals collected

Do not over-instrument this sprint. The point is control, not dashboards.

## Drop Order If Time Collapses

If the sprint gets overloaded, drop work in this order:

1. fancy product polish
2. deeper gamification
3. social perfectionism
4. heavy provider tooling
5. mobile feature work

Do not drop:
- production trust
- reservation honesty
- physical pilot materials
- first community seed
- venue validation

## Founder Rule

This is a founder-led civic sprint, not a startup pretending to be fully staffed.

The right standard is not "look bigger than you are." The right standard is:
- honest
- useful
- visible
- repeatable

If a smaller, manual version gets real-world adoption faster than a polished but unproven system, choose the smaller manual version.

## Companion Docs

- `docs/project-dossier.md`
- `docs/release-readiness.md`
- `docs/roadmap-sports-reservations.md`
- `docs/mobile-app-roadmap.md`
