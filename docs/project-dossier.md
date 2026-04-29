# Znjan.com Project Dossier

Last updated: 2026-04-17

## Purpose

This document is the current high-level documentation for the whole `znjan.com` project so far:
- website
- backend
- community platform
- sports access
- mobile/apps
- social/media layer
- release readiness

It is written as a living product and technical dossier so it can support:
- roadmap planning
- investor or partner conversations
- app-factory handoff
- deep research prompts
- future product decisions

## Executive Summary

`znjan.com` is evolving into a public-service platform for Znjan Beach in Split, Croatia.

The project started as a multilingual, SEO-driven beach portal. It now includes a meaningful dynamic layer:
- community board
- moderation
- user profiles
- gamification
- public sports-access information
- admin closure controls
- a versioned mobile API
- a first mobile app shell for reference and integration planning

The project is already useful as a public website and is no longer a concept. The main shift now is from "build pages and features" toward "build trusted civic-style infrastructure" around information, public access clarity, participation, and future native apps.

## Mission

The project goal is not just to be a tourism microsite.

The intended role is:
- the source of truth for Znjan-related information
- a transparent digital service layer for the local community
- a public interface for sports access and local participation
- a trusted media and discovery surface for visitors and residents

Core principles:
- verified information over filler
- transparency over gatekeeping
- multilingual access by default
- community service over hype
- quality over speed

## Current Product Surface

| Surface | Status | Notes |
|---|---|---|
| Public website | Live | `https://znjan.com` is deployed on Cloudflare Pages |
| Multilingual content | Strong | EN, HR, DE, IT |
| Search | Live | Pagefind-backed site search |
| Maps | Live | Leaflet + OpenStreetMap |
| Community platform | Implemented, production-ready pending runtime verification | Auth, posts, moderation, profile, leaderboard, badges |
| Sports access information | Live | Public rules, access note, dashboard-style public updates, and clear first-come-first-served messaging |
| Mobile API | Live at contract level | `/api/mobile/v1/*` exists and is locally/runtime verified |
| Mobile app | Reference shell only | Expo app exists as a reference client; native apps are the real target |
| Social/media integration | Partial | Instagram embed support exists; full owned social ops system does not yet exist |
| Contact backend | Not complete | Email/contact workflow still incomplete |

## Website

### Public Website Role

The website is currently the most complete part of the project.

It already functions as:
- public visitor guide
- local area directory
- beach information hub
- SEO content platform
- base platform for dynamic community/reservation features

### Website Stack

- Astro 5
- Tailwind CSS
- Astro content collections
- Zod validation
- Cloudflare Pages
- Pagefind search
- Leaflet map components
- TypeScript strict mode

### Current Content Footprint

Current repo-level content shape:
- 5 beach areas
- 7 activities
- 12 places
- 32 FAQ items
- 3 static pages
- 6 guides
- 32 articles
- 0 real events content files
- 0 real news content files

Important implication:
- the informational site is already materially populated
- events/news are still open content lanes, not mature editorial systems yet

### Public Website Features Already in Place

- multilingual routes in 4 languages
- hreflang and structured SEO
- custom 404 flow
- search dialog
- map sections
- business/place detail pages
- guide/article architecture
- embedded Instagram section on the homepage
- legal pages
- sitemap and robots support
- Cloudflare Web Analytics

### Website Strengths

- strong information architecture
- multilingual breadth
- high SEO leverage
- content-driven trust building
- solid public browsing experience

### Website Gaps

- photo pipeline is still incomplete
- events/news editorial cadence is not yet operating
- contact-form backend is not fully delivered
- production runtime validation still matters for the dynamic layer

## Dynamic Backend

### Runtime Model

This project does not use a separate traditional application server.

The current backend model is:
- Astro server routes
- Cloudflare runtime
- Cloudflare D1 as the main dynamic database
- cookie/session-based web auth

### Data Storage Model

There are two main storage patterns:

1. Static verified content in repo files
- `src/content/*`
- beach areas, activities, places, pages, FAQ, guides, articles

2. Dynamic state in Cloudflare D1
- users
- sessions
- posts
- responses/comments/joins
- points and badges
- sports resources
- reservations
- blackouts
- audit-style operational records

### Why This Matters

This is important for roadmap work because the project is not "just a site" anymore.

It already has a reusable backend foundation for:
- native mobile apps
- admin tools
- public transparency dashboards
- future notification systems

## Community Platform

### Current Community Scope

The community layer is already meaningfully built.

Core implemented capabilities:
- Google OAuth sign-in
- session-backed auth
- community board
- post creation/editing
- post detail pages
- comments
- meetup joins
- admin approval workflow
- user profiles
- points, levels, badges
- leaderboard

### Community Post Types

- meetup
- event idea
- partner search
- discussion

### Moderation Model

Current model emphasizes trust and review:
- posts require approval before broad visibility
- admins have moderation access
- approval state is respected in API access rules

### Gamification

The gamification layer exists and is not only decorative.

Implemented:
- point actions
- level ladder
- badge system
- passive badge triggers for joins/comments/views
- leaderboard

### Community Status

Current state:
- functionally implemented
- locally verified
- still dependent on correct production D1/binding/env setup for clean public release

## Sports Access

### Current Public Position

The public website now treats the sports areas as open public spaces.

The current public message is intentionally simple and consistent:
- all sports activities are free
- there is no current reservation system
- the sports areas are open to the public on a first-come, first-served basis

This is strategically important because the project still needs to be the clearest and most trustworthy public explanation of how sports access at Žnjan actually works today.

### Current Public Surface

Implemented now:
- public sports-access page
- published access rules
- public update/dashboard page
- QR/flyer quick-start materials
- clear multilingual first-come-first-served guidance

### Current Resource Model

Current public sports resources:
- 3 beach volleyball courts
- 1 tennis court
- 1 basketball court
- 1 cage football pitch
- 1 skate park

### Public Sports-Access Surfaces

Current public pages:
- `/[lang]/community/reservations/`
- `/[lang]/community/reservations/rules/`
- `/[lang]/community/reservations/dashboard/`

### Public Transparency Features

The public pages now focus on:
- the current public rules
- what exists on site
- the fact that sports use is free
- the fact that there is no current reservation system
- the expectation that spaces are shared on a first-come, first-served basis

### Operational Risks / Open Inputs

Still externally dependent:
- exact final basketball count
- exact final cage-football count
- real-world operating rules and public adoption behavior

## Mobile / Apps

### Mobile Direction

The future app strategy is:
- reuse the existing backend
- avoid building a second system
- support real iOS and Android apps

The intended app backend is already taking shape through `/api/mobile/v1/*`.

### Current Mobile API Surface

Implemented endpoints:
- `/api/mobile/v1/bootstrap`
- `/api/mobile/v1/discover`
- `/api/mobile/v1/auth/session`
- `/api/mobile/v1/reservations`
- `/api/mobile/v1/reservations/:id`
- `/api/mobile/v1/community/feed`
- `/api/mobile/v1/community/posts/:id`

These are important because they formalize a stable app-facing contract instead of forcing mobile clients to depend on website page logic.

### Current Mobile State

What exists now:
- documented mobile roadmap
- documented auth contract
- documented reservations contract
- documented community contract
- typed mobile API helpers in the backend
- reference Expo app shell in `apps/mobile`
- app-factory handoff zips in `deliverables/`

### Native Apps Reality

The real app plan is now native iOS and Android, not Expo as the final delivery target.

Important clarification:
- the Expo app is a reference implementation only
- the real contract is the HTTP API + documentation
- native auth is not fully implemented yet

### Biggest Mobile Gap

The main missing backend piece for first-class native apps is:
- native session exchange and device-session management

Current auth is still shaped around:
- Google OAuth
- browser callback
- cookie-backed web sessions

That is acceptable for the website, but not the finished native-app contract.

## Social Media / Media Layer

### What Exists Now

The project has a real but limited social/media layer today.

Implemented in the site:
- Instagram embed components
- Instagram homepage section
- social-aware content topics like photo spots and nightlife/social articles
- business/place fields for Instagram and other links

Current homepage Instagram feed source:
- configured in `src/content/global/site-config.yaml`
- currently built from embedded Instagram posts, especially venue-related content

### Social Channels Referenced In Research

The project research already tracks official external channels around Znjan and Split events, including:
- Facebook: `znjandoosplit`
- Facebook: `splitemoj.st`
- Instagram: `@splitemoj_`
- YouTube channel for official operator content
- research also references `@znjancitybeach`

Important nuance:
- these are researched or referenced external channels
- they are not yet a fully documented owned-channel operating system for `znjan.com`

### Social / Media Status

Current reality:
- media embedding exists
- social discovery content exists
- there is not yet a formal social content strategy, publishing workflow, calendar, channel ownership model, or growth system for the project itself

### Social Opportunity

This is a major strategic expansion lane.

Possible future role:
- make the site and social channels reinforce each other
- turn verified website content into repeatable short-form social distribution
- use social to feed traffic back into reservations, local discovery, and community use

## Research and Content Layer

### Verified Research Base

A major project strength is that the repo already contains substantial research documentation.

Important research artifacts include:
- official Znjan operator data
- factual verification docs
- business ground-truth docs
- broader comprehensive research

This means roadmap planning can be grounded in evidence, not pure speculation.

### Editorial Positioning

The content strategy already points toward:
- tourist intent capture
- local practical intent capture
- discovery and planning use cases
- infrastructure and civic-utility use cases

This is stronger than a typical beach site because it mixes:
- travel SEO
- local service utility
- civic transparency

## Technical Architecture

### Frontend

- Astro for routing and rendering
- Tailwind for design system styling
- content collections for structured content
- Leaflet for maps
- Pagefind for search

### Backend

- Astro server routes for APIs
- Cloudflare runtime for deployment
- D1 for application state
- cookie-backed sessions for the website

### Validation and Type Safety

- Zod content validation
- strict TypeScript
- i18n parity checks
- reference integrity checks
- Astro diagnostics

### Architecture Strength

The architecture is pragmatic and well-matched to the project:
- static where possible
- dynamic where useful
- multilingual by design
- good fit for edge deployment

## Operations and Release Readiness

### What Is Already Real

- website is deployed on production domain
- static informational surface is live
- mobile API contracts exist
- dynamic features are locally verified

### What Still Needs Ongoing Attention

- Cloudflare runtime bindings and environment correctness
- production verification for dynamic routes
- photo assets
- native mobile auth backend
- long-term operator/admin workflows

### Current Release-Readiness Watchouts

- D1 binding named `DB` must be correctly configured in Pages
- OAuth env vars must be configured
- dynamic production smoke tests still matter after binding changes
- events/news content lanes remain underdeveloped

## Current Strengths

- strong mission and differentiation
- live production website
- multilingual content foundation
- serious SEO footprint
- working backend, not just static pages
- public-service sports reservation vision already in motion
- mobile API contract already started before app fragmentation happens
- enough documentation to support external collaboration

## Current Gaps

- no complete native auth/device-session backend yet
- incomplete photo/media pipeline
- incomplete contact/email backend
- no full social operations system yet
- exact sports inventory still needs on-site confirmation
- events/news verticals still thin
- production dynamic release discipline still matters

## What The Project Is Becoming

If execution continues well, this project is becoming a combined:
- destination guide
- civic beach portal
- local activity platform
- reservations utility
- community participation layer
- future mobile service app

That is much bigger than a content site, and roadmap decisions should reflect that.

## Recommended Research Tracks

If you are going to run deep research prompts, these are the most valuable areas to investigate next.

### 1. Digital Public-Service Benchmarking

Research comparable products that combine:
- local information
- civic transparency
- community participation
- public booking or access systems

Goal:
- understand the strongest product model for a public-serving Znjan platform

### 2. Sports Reservation Governance

Research:
- fairness rules for free public court booking
- no-show policies
- anti-abuse design
- community reservation transparency patterns
- skate park session governance

Goal:
- define a durable policy and operating model, not just a booking UI

### 3. Mobile Product Strategy

Research:
- best information architecture for a beach/community/civic hybrid app
- whether maps, reservations, and community should sit in one app or be role-prioritized
- native auth best practices for public-service apps

Goal:
- avoid building a generic local-guide app that misses the utility core

### 4. Social Media System Design

Research:
- which channels matter most for Split locals vs visitors
- content engine options:
  - Instagram
  - TikTok
  - YouTube Shorts
  - Facebook for local/city/event audiences
- how to turn verified site content into recurring media formats

Goal:
- design a social/media arm that feeds the platform instead of distracting from it

### 5. Content Expansion Priorities

Research:
- highest-value missing content lanes
- seasonal content
- events/news strategy
- user-generated vs editorial content balance

Goal:
- determine which content investments most increase trust, discoverability, and repeat visits

### 6. Monetization and Sustainability Without Losing Trust

Research:
- sponsorships
- premium business listings
- city/operator partnerships
- responsible affiliate models
- grant/civic-support models

Goal:
- define a sustainable model that does not undermine the project's public-service credibility

## Key Strategic Questions

These are the most important unresolved questions for the next roadmap.

1. Is `znjan.com` primarily a content brand, a civic utility, or a hybrid platform?
2. What is the long-term owner/operator model for reservations and moderation?
3. Which sports and activities should become first-class reservable resources?
4. What should the native apps optimize for first: reservations, discovery, or community?
5. Which social channels should be treated as distribution priorities?
6. What does success look like after the first real public beta of reservations and mobile?

## Suggested Use Of This Dossier

Use this document as the base context for:
- deep research prompts
- strategy workshops
- app-factory alignment
- roadmap drafting
- fundraising or partner conversations

Then combine it with:
- `docs/mobile-app-roadmap.md`
- `docs/mobile-auth-contract.md`
- `docs/mobile-reservations-api-contract.md`
- `docs/mobile-community-api-contract.md`
- `docs/roadmap-sports-reservations.md`
- `docs/release-readiness.md`
