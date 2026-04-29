# Mobile Auth Contract

## Purpose

Define how the future iOS and Android apps will authenticate against `znjan.com` without depending on browser cookies as the primary native mechanism.

## Current State

Today the website uses:
- Google OAuth
- server-created D1-backed sessions
- `HttpOnly` cookies for the web client

This is correct for the website, but it is not the ideal long-term contract for a native mobile app.

## Current Mobile-Safe Read Surface

The app can already read public data without native login through:
- `/api/mobile/v1/bootstrap`
- `/api/mobile/v1/discover`
- `/api/mobile/v1/community/feed`
- `/api/mobile/v1/community/posts/:id`
- `/api/mobile/v1/reservations`

Session introspection is available at:
- `/api/mobile/v1/auth/session`

`/api/mobile/v1/auth/session` is intentionally descriptive right now. It tells the app:
- whether a web session exists
- that native auth is not yet implemented
- which web login/logout URLs exist

## Target Native Auth Flow

Recommended flow:
1. The app starts Google sign-in through the system browser using OAuth Authorization Code + PKCE.
2. After Google consent, the backend exchanges the authorization code.
3. The backend creates a native app session.
4. The app receives native session credentials that are independent from website cookies.
5. The app refreshes or renews that session without forcing a full login every time.

## Recommended Backend Model

Use opaque backend-issued tokens instead of putting identity claims directly in the app.

Recommended token model:
- short-lived access token for API calls
- rotating refresh token for session renewal
- both backed by server-side D1 records

Why:
- aligns with the existing server-session pattern
- easier revocation
- avoids making the app trust client-side claims as the source of truth
- fits the project’s public-service and moderation needs better than purely stateless auth

## Proposed Native Endpoints

Planned namespace:
- `POST /api/mobile/v1/auth/native/start`
- `POST /api/mobile/v1/auth/native/exchange`
- `POST /api/mobile/v1/auth/native/refresh`
- `POST /api/mobile/v1/auth/native/logout`
- `GET /api/mobile/v1/auth/session`

Expected responsibilities:
- `start`: returns provider configuration and server nonce/state for native login
- `exchange`: verifies OAuth result and returns native session credentials
- `refresh`: rotates access credentials safely
- `logout`: revokes the current native session
- `session`: returns current auth/session state for the client

## Session Rules

The native contract should follow these rules:
- access tokens must expire quickly
- refresh tokens must rotate on use
- revoked or reused refresh tokens must invalidate the session chain
- device sessions should be tracked separately from website cookie sessions
- logout from the app should revoke only the relevant device session unless the user explicitly requests global logout

## D1 Data Model Direction

Planned additions:
- `app_sessions`
- `app_refresh_tokens`
- optional `auth_audit_log`

Minimum fields:
- id
- user_id
- client_type
- platform
- device_label
- created_at
- last_seen_at
- expires_at
- revoked_at

Refresh-token rows should be stored hashed, not in plaintext.

## Security Rules

Native auth must:
- use PKCE
- use a system browser or secure browser session
- never embed Google client secrets in the app
- never expose long-lived bearer secrets in logs or URLs
- treat refresh token reuse as suspicious
- support remote revocation from the server side

## Compatibility Rule

The website cookie session model should remain valid for the web app.

The mobile auth implementation should be additive:
- web keeps cookies
- mobile gets native session tokens
- both resolve to the same user model in D1

## Immediate Implementation Status

Documented but not yet implemented:
- native session exchange
- refresh endpoint
- logout endpoint for native sessions
- D1 tables for device-specific mobile sessions

Already implemented:
- `/api/mobile/v1/auth/session`
- explicit backend roadmap in `docs/mobile-app-roadmap.md`
