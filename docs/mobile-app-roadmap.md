# Mobile App Roadmap

## Purpose

Build a real iOS and Android app for `znjan.com` without forking the product into two separate backends.

The mobile apps should extend the current public-service mission of the project:
- make Znjan easier to navigate
- make sports reservations easier to trust and use
- surface verified local information quickly
- support community participation without sacrificing transparency

## Current Backend Reality

The project already has a usable backend foundation:
- static content lives in Astro content collections under `src/content/`
- dynamic community and reservation data lives in Cloudflare D1
- Astro API routes already expose posts, reservations, auth session state, leaderboard, and admin actions

This means the mobile app should **reuse the existing backend**, not invent a second one.

## Recommended Mobile Stack

Recommended first choice: `Expo / React Native`

Why:
- aligns with the repo's TypeScript-first workflow
- faster to share code and API contracts with the website
- one codebase for iOS and Android
- easier to ship internal builds quickly while the product is still evolving

Alternative:
- `Capacitor` if the goal shifts toward a web-wrapper-first release
- `Flutter` only if we intentionally want a fully separate mobile engineering stack

## Product Scope

### Mobile v1

Ship the app when it can do these well:
- browse beach areas, activities, places, and FAQs
- see sports reservation availability publicly
- sign in and manage free reservations
- read the community board
- view a basic map and location context

### Mobile v1.5

Add:
- create posts and comments
- saved favorites
- deeper reservation history
- push notifications for booking reminders and important closures

### Mobile v2

Add:
- native auth polish
- offline caching for public content
- richer map interactions
- event/news modules
- in-app moderation/admin workflows if they prove necessary

## Backend Roadmap

### Phase A — API Contract

Goal: make the current website backend explicitly app-friendly.

Tasks:
- create versioned mobile endpoints under `/api/mobile/v1/*`
- standardize JSON envelope shape, caching, and language selection
- expose public read-only content through APIs instead of requiring the app to scrape or mirror page logic
- document which existing web APIs are safe to reuse as-is

### Phase B — Native Auth

Goal: replace the current browser-shaped auth assumption for mobile clients.

Tasks:
- keep Google as the identity provider
- introduce native-friendly token/session exchange
- define token refresh, logout, and revoked-session behavior
- make `/api/auth/me` and write endpoints work cleanly for both web and mobile clients

### Phase C — Reservations for Mobile

Goal: make sports booking feel first-class in the app.

Tasks:
- reuse `/api/reservations` for read access where possible
- formalize booking/cancel response codes for native UX
- expose closure reasons and booking policy metadata more explicitly
- add device-ready confirmation payloads for success screens and reminders

### Phase D — Community for Mobile

Goal: turn community features into a stable app surface instead of a browser-only flow.

Tasks:
- tighten post/feed payload shapes
- add pagination contracts suitable for mobile feeds
- make moderation and status states explicit
- plan upload/media support only after the text-first flow is solid

### Phase E — Mobile Operations

Goal: make the app releasable and supportable.

Tasks:
- app config by environment
- analytics and error monitoring
- push notifications
- app privacy copy and store metadata
- release checklist for TestFlight and Play internal testing

## First App-Facing API Surface

The first scaffolded mobile endpoints are:
- `/api/mobile/v1/bootstrap`
- `/api/mobile/v1/discover`
- `/api/mobile/v1/auth/session`
- `/api/mobile/v1/reservations`
- `/api/mobile/v1/reservations/:id`
- `/api/mobile/v1/community/feed`
- `/api/mobile/v1/community/posts/:id`

Purpose:
- `bootstrap` gives the app a stable entry point with site info, capability flags, and endpoint discovery
- `discover` gives the app localized public content for beach areas, activities, places, and FAQs
- `auth/session` exposes current session state plus the native-auth implementation status
- `reservations` exposes app-shaped schedule and booking contracts
- `community/*` exposes app-shaped feed and detail contracts

The initial mobile surface is mostly read-first, with reservation write support already exposed through the versioned mobile namespace. Native auth is still documented but not yet implemented.

## Current App Workspace

The first native client workspace now exists at:
- `apps/mobile`

Current app shell capabilities:
- choose EN / HR / DE / IT inside the app shell
- load `/api/mobile/v1/bootstrap` and `/api/mobile/v1/discover`
- browse reservation availability through `/api/mobile/v1/reservations`
- read the public community feed through `/api/mobile/v1/community/feed`
- inspect auth/session readiness through `/api/mobile/v1/auth/session`

Implementation notes:
- the app uses `Expo / React Native`
- the backend host is configured through `EXPO_PUBLIC_API_BASE_URL`
- the app is intentionally read-first until native auth is implemented

## Delivery Sequence

### Step 1

Build the app against public content and reservation-read APIs first.

Status:
- backend contracts are live
- Expo shell is now scaffolded in `apps/mobile`
- local typecheck is part of the app workflow

### Step 2

Implement native auth and reservation write support.

### Step 3

Add community write flows, push notifications, and offline polish.

## Definition of Done for Mobile Beta

We should call the mobile app beta-ready when:
- content browsing is stable in 4 languages
- reservation availability is trustworthy
- login works natively on iOS and Android
- reservation creation/cancellation works end to end
- the app can be distributed to internal testers on both platforms

## Immediate Next Tasks

1. Implement native app session storage plus the first `/api/mobile/v1/auth/native/*` endpoints.
2. Add legal/about/contact payloads so the app can ship a complete public-information surface without web fallback.
3. Add community write contracts for post creation and comments after native auth is available.
4. Prepare internal beta delivery details for `apps/mobile`, including environment notes and the first EAS/TestFlight/Play checklist.
