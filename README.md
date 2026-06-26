# Drovery Mobile

> Consumer drone-delivery mobile app (React Native + Expo Router) for requesting package flights, real-time tracking, and delivery workflow management.

Drovery Mobile is the customer-facing app of the Drovery platform: request a drone delivery, pay, then watch the drone fly your package to its destination in real time and confirm handoff with a QR code. Built with Expo SDK 54 and `expo-router`, it talks to the Drovery backend over REST + WebSocket and ships with a fully offline **mock** mode so you can explore the flows without standing up the API.

### Part of the Drovery system

Drovery is a portfolio/demo of an autonomous drone-delivery platform (personal project by Sena Fathoni), split across three repos:

- **[Drovery_Backend](https://github.com/senafathoni2998/Drovery-Backend)** — NestJS + Prisma + Postgres + Redis/BullMQ API; the brain that runs the drone simulation.
- **Drovery_Mobile** (this repo) — Expo / React Native customer app.
- **[Drovery_Admin](https://github.com/senafathoni2998/Drovery-Admin-Frontend)** — Vite + React + MUI operator/support console.

Live demo: API `https://droverybackend.senafathoni.dev` · Admin `https://droverydashboard.senafathoni.dev`

---

## Features

- **Auth** — login / signup / password reset / email verification, with token refresh and secure token storage (`expo-secure-store`).
- **Delivery request workflow** — address input → price estimation → payment → handoff-code generation.
- **Real-time tracking** — live map visualization (`react-native-maps`) driven by a WebSocket location feed.
- **QR handoffs** — generate and scan QR codes to confirm pickup/delivery.
- **Proof of delivery** — capture photo + geo-location + notes.
- **Status lifecycle** — `SCHEDULED → PENDING → CONFIRMED → DRONE_ASSIGNED → PICKUP_IN_PROGRESS → IN_TRANSIT → AWAITING_HANDOFF → DELIVERED`, plus exception states (`RETURNING`, `DELIVERY_FAILED`, `RETURNED_TO_BASE`).
- **Orders** — history and filtering (current / scheduled / completed / canceled).
- **Saved addresses** and **favorite delivery locations**.
- **Recurring deliveries** scheduling.
- **Payments** — payment-method management + native Stripe card entry (PaymentSheet).
- **Wallet / credits** — apply wallet balance to charges.
- **Promo codes** — validation and application.
- **Referrals** — invite friends and track bonuses.
- **Support** — create tickets with threaded messages and an FAQ fallback.
- **Push notifications** with opt-in settings.
- **Profile** — edit name, email, phone, bio, and avatar.
- **Home dashboard** — quick stats and upcoming deliveries.

## Tech stack

| Area | Library / version |
| --- | --- |
| Runtime | Expo SDK 54, React Native 0.81.5, React 19.1.0 |
| Routing | expo-router 6.0.23, @react-navigation/bottom-tabs 7.4.0 |
| Language | TypeScript 5.9.2 |
| Maps | react-native-maps 1.20.1 |
| Payments | @stripe/stripe-react-native 0.50.3 |
| QR | react-native-qrcode-svg 6.3.21 |
| Animation | react-native-reanimated 4.1.1 |
| Forms | react-hook-form 7.71.2 |
| Storage | expo-secure-store |
| Testing | Jest 29.7.0 (jest-expo), @testing-library/react-native 13.3.3 |

The [New Architecture](https://reactnative.dev/architecture/landing-page) is enabled (`newArchEnabled: true` in `app.json`).

## Quick start

### Prerequisites

- Node.js 20+ and npm 10+ (Expo SDK 54; the Drovery backend pins 22.12)
- The **Expo Go** app (iOS/Android) or an Android/iOS emulator
- Expo CLI (global, or just use `npx expo@latest`)
- A Drovery backend reachable at your configured `EXPO_PUBLIC_API_URL` — only needed for `api` auth mode (see the backend README for setup)

### Install & configure

```bash
npm install
cp .env.example .env
```

Edit `.env` (only `EXPO_PUBLIC_*` vars are inlined into the bundle):

- **`EXPO_PUBLIC_API_URL`** — backend base URL including the `/api/v1` prefix. This is **bundle-time-inlined**, so restart Expo after changing it. Pick the value for your target:
  - iOS simulator: `http://localhost:3000/api/v1`
  - Android emulator: `http://10.0.2.2:3000/api/v1`
  - Physical device (Expo Go): `http://<your-LAN-IP>:3000/api/v1`
  - Hosted demo: `https://droverybackend.senafathoni.dev/api/v1`
- **`EXPO_PUBLIC_AUTH_MODE`** — `mock` for an offline demo (hardcoded `demo@drovery.com` / `demo123`), or `api` to integrate with a running backend.
- **`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`** — optional `pk_test_...` to enable the native PaymentSheet. Leave empty for the manual card form.

### Run

```bash
# (optional) start the backend in a sibling repo
cd ../Drovery_Backend && npm run start:dev

# then, in this repo:
npm start          # Expo dev server — pick Expo Go, emulator, or web
npm run android    # open in Android emulator
npm run ios        # open in iOS simulator
npm run web        # Expo web build
```

Log in with the seeded demo account **`demo@drovery.com` / `demo123`** (shared across mobile, admin, and backend).

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `EXPO_PUBLIC_AUTH_MODE` | `mock` (offline demo, hardcoded creds) or `api` (backend integration). | `mock` |
| `EXPO_PUBLIC_API_URL` | Backend base URL incl. `/api/v1`. Varies by platform (see Quick start). | `http://localhost:3000/api/v1` |
| `EXPO_PUBLIC_API_TIMEOUT` | HTTP request timeout in milliseconds. | `10000` |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional `pk_test_...`; enables native PaymentSheet (requires a dev build). Empty → manual card form. | _(empty)_ |

> Only `EXPO_PUBLIC_*`-prefixed variables are visible to React Native at build time. Plain `.env` vars (e.g. `API_URL`) are ignored.

## Project structure

```
app/         Expo Router routes — thin wrappers re-exporting feature screens
             (auth, create/track/confirm/workflow/proof delivery, orders, home,
              notifications, profile, wallet, favorites, recurring, referrals,
              addresses, support, qr-scanner, track-on-map)
features/    Feature-sliced modules (13): auth, delivery, orders, home,
             notifications, profile, wallet, addresses, favorites, recurring,
             referrals, promo, support
services/    Cross-feature utilities
             ├─ api/   apiClient.ts (token refresh + envelope unwrapping),
             │         tokenStorage.ts (expo-secure-store), types.ts (DTOs),
             │         trackingSocket.ts (WebSocket location updates)
             ├─ notifications/  Expo push handlers
             └─ deliveryStatus.ts
contexts/    AuthContext.tsx — global auth state (login/signup/logout/profile)
config/      env.ts — single source of truth for runtime env config
styles/      common.ts — design tokens (colors, spacing, typography)
__tests__/   Jest tests (mirrors features/services/contexts/config)
__mocks__/   Mock implementations for testing
assets/      App icons, splash screen, favicon
.github/     workflows/android-build.yml — EAS CI/CD for Play Store builds
eas.json     EAS build profiles: development / preview (APK) / production (AAB)
```

## Testing

Jest + `@testing-library/react-native` on the `jest-expo` preset (handles React Native transforms). Tests are co-located under `__tests__/`, mirroring `features/`, `services/`, `contexts/`, and `config/`.

```bash
npm test            # run the suite
npm run test:watch  # watch mode
npm run test:coverage
```

## Deployment

Production Android App Bundles (`.aab`) are built on **EAS** (Expo's cloud builder) via GitHub Actions: **Actions → Android AAB (EAS) → Run workflow → `production`** (`.github/workflows/android-build.yml`). The workflow produces a Play-ready, signed bundle as a downloadable artifact; the version code auto-increments per production build (tracked server-side by EAS). App ID: `com.drovery.mobile`.

One-time setup:

1. Create an Expo account, then `npm i -g eas-cli`, `eas login`, `eas init` (writes `extra.eas.projectId` to `app.json` — commit it).
2. Create an Expo access token (Account Settings → Access tokens) and add it as the GitHub secret `EXPO_TOKEN`.
3. EAS generates and stores the Android upload keystore — no signing secrets live in the repo.

Auto-submission to a Play track (`eas submit`) is deferred — see [`PLAY-AUTO-SUBMIT-TODO.md`](./PLAY-AUTO-SUBMIT-TODO.md) for the turnkey plan (needs a Google Cloud service account + Play Developer API access).

> **Before any device/release build:** replace the `YOUR_GOOGLE_MAPS_API_KEY` placeholder in `app.json`, or the map screens won't render.

## Caveats

- **Google Maps key** in `app.json` is a placeholder — must be set before device builds or maps stay blank.
- **Stripe PaymentSheet** (native card entry) needs a dev build (`eas build -p <platform> --profile development|production`), not Expo Go. The manual card form works in Expo Go when `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is empty.
- **`api` auth mode** requires a running backend; `mock` mode uses the hardcoded demo credentials above.
- Remember: changing `EXPO_PUBLIC_*` values requires restarting the Expo dev server (they are inlined at bundle time).

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Launch the Expo dev server (Expo Go or emulator) |
| `npm run android` | Start in an Android emulator |
| `npm run ios` | Start in an iOS simulator |
| `npm run web` | Start the Expo web build |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Generate a coverage report |
| `npm run lint` | Run Expo lint (ESLint) |
| `npm run reset-project` | Reset the project to a clean state (`./scripts/reset-project.js`) |