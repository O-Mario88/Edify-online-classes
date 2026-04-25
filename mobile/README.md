# Maple Mobile

Native iOS + Android app for Maple Online School. Built with Expo 50 +
Expo Router 3 + React Native 0.73 + NativeWind 4 + Zustand + React Query.

This is a separate app beside `frontend-web/` and `edify_backend/`. It
hits the same Django REST API; no business logic lives in the mobile
codebase.

## Status

**Phase 1 walking skeleton** — auth + role-routing + Today hero +
Student home with the new `/api/v1/mobile/student-home/` aggregator.

## Setup

```bash
cd mobile/
npm install
npx expo start
```

By default the app talks to `http://127.0.0.1:8000`. To point at a
different backend, edit `app.json` → `expo.extra.apiBaseUrl` or
override per-build via `eas.json`.

### Run on a device

- **iOS Simulator** — press `i` in the Expo CLI.
- **Android Emulator** — press `a`.
- **Physical phone** — install the Expo Go app, scan the QR code.

The dev backend at `127.0.0.1:8000` is only reachable from the
simulator. To test on a physical phone, replace `127.0.0.1` with your
machine's LAN IP (e.g. `192.168.1.42`) in `app.json`.

### Sign in

Use any seeded pilot account (see `docs/PILOT_KIT.md`):

| Email                         | Password     |
|-------------------------------|--------------|
| `student.a@pilot.maple`       | `PilotPass!` |
| `teacher.a@pilot.maple`       | `PilotPass!` |
| `parent.a@pilot.maple`        | `PilotPass!` |

After login the role guard sends every account to `/(student)` for
now — Phase 3+ will route teachers / parents / institution admins to
their own home stacks.

## Architecture

```
mobile/
├── app/                    # Expo Router file-system routes
│   ├── _layout.tsx         # AuthProvider + RouteGuard + Stack
│   ├── index.tsx           # Bounce to (auth) or role home
│   ├── (auth)/             # welcome, login, …
│   └── (student)/          # student tabs (Phase 1: home only)
├── src/
│   ├── api/                # Typed clients hitting Django
│   │   ├── client.ts       # fetch wrapper with token refresh
│   │   ├── auth.api.ts
│   │   └── student.api.ts
│   ├── auth/
│   │   ├── tokenStorage.ts # SecureStore (Keychain / EncryptedSharedPrefs)
│   │   ├── authStore.ts    # Zustand — in-memory access token + user
│   │   ├── AuthProvider.tsx
│   │   ├── useAuth.ts
│   │   └── roleRouting.ts
│   ├── components/         # AppScreen, AppCard, PrimaryButton, TodayHero, …
│   ├── config/env.ts       # apiBaseUrl from app.json extras
│   ├── hooks/useApiQuery.ts
│   └── theme/              # colors, spacing, typography tokens
└── tailwind.config.js      # NativeWind v4 — same Maple brand palette as web
```

### Auth strategy

- Refresh token persisted to `expo-secure-store` (iOS Keychain /
  Android EncryptedSharedPreferences).
- Access token kept **in memory only** — never written to disk.
- On boot, `AuthProvider` reads the refresh token, mints a new access
  token via `/auth/token/refresh/`, hydrates the cached user record,
  and flips the auth status.
- `api/client.ts` retries once on 401 by minting a fresh access token,
  then replays the original request. If refresh fails, the session is
  wiped and the route guard sends the user back to `/(auth)/welcome`.
- Logout clears SecureStore and resets the in-memory store.

### Role routing

`src/auth/roleRouting.ts` maps a backend role string to a mobile home
route. In Phase 1 every authenticated role lands on `/(student)`;
later phases add `/(parent)`, `/(teacher)`, and `/(institution)`.

## Backend contract

This app is a thin presentation layer. The new mobile-aggregator
endpoints under `/api/v1/mobile/` are deliberately the only mobile-
specific code on the server:

| Endpoint | Why mobile-specific? |
|---|---|
| `GET /mobile/app-config/` | Public; serves version + force-update flag + feature flags |
| `GET /mobile/student-home/` | Aggregates today/kpis/next-live/access into one payload — saves 5 round-trips on cold start |

Everything else (auth, content, assessments, …) reuses the existing
web endpoints.

## What's deliberately NOT in Phase 1

- Push notifications (Phase 7)
- Camera + audio uploads (Phase 7)
- Offline mode (Phase 7)
- Parent / Teacher / Institution dashboards (Phases 3 / 4)
- Live video SDK — links out to Google Meet for now
- iOS in-app purchase / Google Play billing — Phase 6 with payments

## Testing

`npm run typecheck` runs `tsc --noEmit` against the strict tsconfig.

When `npx expo start` is running you can:
- Press `j` to open the React Native debugger
- Press `m` for the developer menu
- Shake the device to reload

## Next steps

The next milestone is **Phase 2 (Student MVP)**:

1. Add bottom-tab navigation: Home / Learn / Live / Support / Profile.
2. Build the Lesson viewer (text + PDF + video).
3. Build the Assignments list + Assessment player with photo upload.
4. Add the Today's Learning Plan list inside Home.

Backend prep before Phase 2 ships:
- `/mobile/parent-home/`, `/mobile/teacher-home/`, `/mobile/institution-home/`.
- `POST /mobile/device-token/` for push (Phase 7 setup begins early).
- `drf-spectacular` schema export → `openapi-typescript` codegen.
