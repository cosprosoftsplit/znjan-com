# Znjan Mobile

Native app shell for `znjan.com`, built with Expo and wired to the versioned mobile backend under `/api/mobile/v1/*`.

## Current Scope

- localized public discover feed
- public sports reservations availability
- public community read feed
- auth/session readiness surface

The app is intentionally read-first right now. Native sign-in and write flows are the next backend milestone.

## Setup

```bash
cd apps/mobile
copy .env.example .env
npm install
npm run start
```

Optional API target override:

```bash
set EXPO_PUBLIC_API_BASE_URL=http://YOUR-LAN-IP:8788
```

Use a LAN-reachable host for real devices. `127.0.0.1` only works for emulators running on the same machine.

## Verification

```bash
npm run typecheck
npx expo export --platform web
```

## Useful Pairing With The Website Repo

To test against the local Cloudflare-style runtime:

```bash
cd ..
npm run build
npm run preview:runtime
```

Then point `EXPO_PUBLIC_API_BASE_URL` at that runtime host.
