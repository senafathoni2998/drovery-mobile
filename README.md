# Drovery Mobile 📦🚁

The consumer mobile app for **Drovery**, a drone-delivery platform. Built with **Expo SDK 54** / **React Native 0.81** / **expo-router**. Users request a package flown from A → B, get a price estimate, pay with a saved card, and track the drone through its delivery lifecycle.

This app is the frontend for the **drovery-backend** NestJS API (sibling repo at `../drovery-backend`).

> **Part of the Drovery system** — three repos: [drovery-backend](https://github.com/senafathoni2998/Drovery-Backend) (API · realtime · workers), this mobile app, and [drovery-admin](https://github.com/senafathoni2998/Drovery-Admin-Frontend) (operator & support console). The backend README's [system overview](https://github.com/senafathoni2998/Drovery-Backend#drovery--system-overview) has the big-picture architecture + scale story.

## Get started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Point the app at the backend.** Set `EXPO_PUBLIC_API_URL` in `.env` (copy from `.env.example`).

   > ⚠️ Expo only injects vars prefixed with `EXPO_PUBLIC_`. A plain `API_URL` is ignored.

   | App runs on | `EXPO_PUBLIC_API_URL` |
   |---|---|
   | Physical device (Expo Go) | `http://<your-LAN-IP>:3000/api/v1` |
   | Android emulator | `http://10.0.2.2:3000/api/v1` |
   | iOS simulator / web | `http://localhost:3000/api/v1` |

   Set `EXPO_PUBLIC_AUTH_MODE=api` for the live backend (default), or `mock` for offline/demo.

3. **Start the backend** (in `../drovery-backend`): `npm run start:dev` (serves `:3000/api/v1`). See its README + [`INTEGRATION.md`](../drovery-backend/INTEGRATION.md).

4. **Run the app**

   ```bash
   npm start          # expo start — then open in Expo Go / emulator
   ```

5. **Log in** with the seeded demo account: **`demo@drovery.com` / `demo123`**.

## Project structure

```
app/          # expo-router routes (thin wrappers re-exporting features/*/screens)
features/     # feature-sliced: auth, delivery, orders, home, notifications, profile
services/api/ # apiClient (HTTP + token refresh), tokenStorage (expo-secure-store), types
contexts/     # AuthContext (global auth state)
config/env.ts # runtime config (API_URL, AUTH_MODE) — single source of truth
styles/       # design tokens
```

## How it talks to the backend

`services/api/apiClient.ts` is the single HTTP layer: it injects the `Bearer` access token, transparently unwraps the backend's `{ success, data, timestamp }` envelope, and on a `401` refreshes the token (single-flight) and retries once. The full endpoint map, auth/token lifecycle, and response contract are documented in **[../drovery-backend/INTEGRATION.md](../drovery-backend/INTEGRATION.md)**.

## Testing

```bash
npm test                 # jest + @testing-library/react-native
npm run test:coverage
```

## Learn more

- [Expo documentation](https://docs.expo.dev/) · [expo-router](https://docs.expo.dev/router/introduction) · [Environment variables in Expo](https://docs.expo.dev/guides/environment-variables/)
