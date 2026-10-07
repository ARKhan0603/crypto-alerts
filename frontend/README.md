# Tickr — frontend

React dashboard for the Django [crypto price alert API](../crypto-alerts). Sign in, set target
prices for BTC / ETH / XRP and more, watch live prices, and get notified when a target is hit.

**Stack:** React 19 · Vite · Redux Toolkit + RTK Query · React Router · Tailwind CSS v4 ·
Framer Motion · React Hook Form · Vitest + Testing Library · oxlint + Prettier

## Getting started

```bash
# 1. backend (see ../crypto-alerts/README.md) — Postgres, Redis, Celery worker + beat
python manage.py seed_cryptocurrencies
python manage.py runserver            # http://127.0.0.1:8000

# 2. frontend
cd frontend
npm install
cp .env.example .env                  # optional
npm run dev                           # http://localhost:5173
```

The backend does not enable CORS, so in development Vite proxies `/api` to
`VITE_PROXY_TARGET` (default `http://127.0.0.1:8000`). For a production build served from a
different origin, set `VITE_API_BASE_URL` and enable CORS on the API.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with API proxy |
| `npm run build` | Production build |
| `npm test` | Run the test suite once (`test:watch` to iterate) |
| `npm run lint` / `format:check` | oxlint / Prettier |

## Architecture

```
src/
├── app/            store + listener middleware (side effects)
├── services/api.js RTK Query API: every request goes through here
├── features/
│   ├── auth/           authSlice, login/register pages, protected route
│   ├── alerts/         selectors, alert list/cards, create/edit drawer
│   ├── prices/         selectors, polling hook, price cards
│   ├── notifications/  slice, hit detection, bell panel, toasts
│   ├── dashboard/      page composition
│   └── ui/             uiSlice (drawer, filter, panel state)
├── components/     header and shared UI primitives
└── lib/            pure helpers (threshold rules, formatting, error mapping)
```

### State

| Slice | Holds |
| --- | --- |
| `api` (RTK Query) | cached alerts and prices, request status |
| `auth` | token and username, hydrated from `localStorage` |
| `ui` | alert drawer, filter tab and notification panel state |
| `notifications` | feed + toasts (entity adapter), alerts already announced |

### RTK Query

- **Queries:** `getCryptocurrencies` (live prices) and `getAlerts` are polled every **20 s**
  (`skipPollingIfUnfocused`), and refetch on window focus / reconnect. `getAlerts` walks every
  page of the paginated API so the cache holds one complete list.
- **Mutations:** `createAlert`, `updateAlert`, `deleteAlert` (plus `login`, `register`, `logout`).
  Update and delete are **optimistic** with automatic rollback; tags (`Alert`) keep the cache in
  sync.
- A `401` from any request signs the user out.
- Components read data through **selectors** (`selectAlertsWithStatus`, `selectPricesBySymbol`…)
  that join cached alerts with cached prices.

### Middleware (listener)

`src/app/listenerMiddleware.js` owns the side effects: persisting the session, wiping the cache
on logout, detecting threshold hits whenever prices or alerts refresh, and toasting mutation
results/failures.

### Threshold indicators and notifications

Every alert has a status: **watching**, **hit** (live price crossed the target, shown with a glowing
card and pulsing badge), **triggered** (the backend already fired and deactivated it) or
**paused**. Hits and backend triggers raise one notification per alert (toast + bell feed);
alerts that fired before the session started are not replayed.

## Notes

- Triggered alerts cannot be re-armed (the API treats `triggered_at` as read-only), so they offer
  delete only.
- Alert state changes on the server are picked up on the next 20 s poll.
