# Mobile Reservations API Contract

## Goal

Provide a stable sports-access contract for iOS and Android so the app can show the current public sports-access information without depending on website-specific UI assumptions.

## Current Public Reality

- all sports activities are free
- there is no current reservation system
- the beach sports areas are first-come, first-served
- the existing `/api/mobile/v1/reservations*` namespace remains in place for compatibility, but write behavior is intentionally disabled

## Implemented Mobile Endpoints

- `GET /api/mobile/v1/reservations`
- `POST /api/mobile/v1/reservations`
- `DELETE /api/mobile/v1/reservations/:id`

## Request Rules

### `GET /api/mobile/v1/reservations`

Query params:
- `date=YYYY-MM-DD`
- `lang=en|hr|de|it` optional

Behavior:
- public access allowed
- returns the public-access message, date options, resource schedule, and viewer summary
- returns `reservationsEnabled: false`
- returns `upcomingReservations: []`
- returns `actions.createReservation = null` and `actions.cancelReservation = null`

### `POST /api/mobile/v1/reservations`

Behavior:
- currently disabled
- returns `409`
- returns the shared public sports-access message

### `DELETE /api/mobile/v1/reservations/:id`

Behavior:
- currently disabled
- returns `409`
- returns the shared public sports-access message

## Response Shape

All reservation mobile endpoints return a versioned JSON envelope:

```json
{
  "version": "v1",
  "generatedAt": "2026-04-17T09:00:00.000Z",
  "lang": "en",
  "data": {}
}
```

Error responses use:

```json
{
  "version": "v1",
  "generatedAt": "2026-04-17T09:00:00.000Z",
  "error": {
    "code": "authentication-required",
    "message": "Authentication required",
    "authRequired": true
  }
}
```

## Schedule Payload Guarantees

Each resource includes:
- `id`
- `slug`
- `kind`
- `reservationMode`
- `capacity`
- `titles`
- `slots`

Each slot includes:
- `start`
- `end`
- `status`
- `reservationId`
- `isMine`
- `reservationCount`
- `spotsLeft`
- `capacity`

This allows the app to support both:
- exclusive field reservations
- shared-capacity sessions like the skate pilot

## Access Metadata Guarantees

The mobile contract still includes the current internal policy metadata:
- booking window
- slot duration
- opening hours
- per-day reservation cap
- total upcoming reservation cap

That metadata is currently informational only. The app should not present it as an active public booking policy while writes are off.

## Error Semantics

Mobile clients should treat these codes as stable:
- `authentication-required`
- `outside-booking-window`
- `slot-unavailable`
- `resource-not-found`
- `reservation-not-found`
- `reservation-not-cancellable`
- `daily-limit-reached`
- `upcoming-limit-reached`
- `reservation-error`
- `internal-error`

The existing D1 reservation layer remains the source of truth for those outcomes.

## Viewer Model

Reservation responses include:
- `viewer.isAuthenticated`
- `viewer.user`

The app should use that viewer object to decide whether to:
- route the user into login for community/account features
- show signed-in state
- avoid presenting create/cancel booking CTAs while write actions are disabled

## Compatibility Note

The new mobile endpoints intentionally wrap the existing reservation logic rather than replacing it. The website and the app now share the same reservation rules.
