# Mobile Reservations API Contract

## Goal

Provide a stable reservation contract for iOS and Android so the app can show availability and manage bookings without depending on website-specific UI assumptions.

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
- returns policy metadata, date options, resource schedule, and viewer summary
- if authenticated, also returns the viewer’s upcoming reservations and marks owned slots

### `POST /api/mobile/v1/reservations`

Requires authentication.

Expected JSON body:
```json
{
  "resourceSlug": "tennis-court-1",
  "reservationDate": "2026-04-18",
  "slotStart": "10:00"
}
```

Behavior:
- creates one reservation if policy checks pass
- returns reservation id and echo fields
- uses the same D1-backed business rules as the website

### `DELETE /api/mobile/v1/reservations/:id`

Requires authentication.

Behavior:
- cancels the user’s own reservation if still cancellable under platform rules

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

## Reservation Policy Guarantees

The mobile contract always includes current platform policy:
- booking window
- slot duration
- opening hours
- per-day reservation cap
- total upcoming reservation cap

This means the app should render policy from API data, not from hardcoded values.

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
- show booking CTA
- show cancel CTA
- route the user into login

## Compatibility Note

The new mobile endpoints intentionally wrap the existing reservation logic rather than replacing it. The website and the app now share the same reservation rules.
