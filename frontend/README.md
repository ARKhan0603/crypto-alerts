# Tickr (frontend)

The React dashboard for the [alerts API](../crypto-alerts). You log in, pick a coin, set a target
price, and the page shows live prices and tells you when a target is hit.

Built with React 19, Vite, Redux Toolkit (RTK Query), React Router, Tailwind CSS v4, Framer
Motion and React Hook Form. Linting is oxlint, formatting is Prettier.

## Running it

Start the backend first (see its README), then:

```bash
cd frontend
npm install
npm run dev        # Vite on http://localhost:5175
```

The API doesn't allow CORS, so the app and the API need to be on the same origin. nginx does
that. From the repo root:

```bash
nginx -c "$PWD/nginx/nginx.conf" -e /tmp/tickr-nginx-error.log
```

Then open http://localhost:8095. To stop it, run the same command with `-s stop` on the end.

`nginx/nginx.conf` sends `/api` to Django on port 8000 and everything else to the Vite dev
server. For production, run `npm run build` and serve `frontend/dist` from nginx instead (there's
a commented block in the config for that). If you'd rather host the API on another domain, set
`VITE_API_BASE_URL` and turn on CORS in Django.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | start the Vite dev server |
| `npm run build` | production build |
| `npm run lint` | run oxlint |
| `npm run format:check` | check formatting |

## Project layout

```
src/
  app/            Redux store and the listener middleware
  services/api.js every API request goes through here (RTK Query)
  features/
    auth/           login, register, protected route
    alerts/         alert list, cards, create/edit drawer
    prices/         price cards and the polling hook
    notifications/  toasts, bell panel, hit detection
    dashboard/      the main page
    ui/             small UI state (drawer, filter, panel)
  components/     header and shared buttons/fields
  lib/            helpers and constants
```

## How it works

**Data.** Prices and alerts are fetched with RTK Query and refreshed every 20 seconds (only
while the tab is focused). The alerts query loads every page of the API so the cache always has
the full list. Updating or deleting an alert changes the UI straight away and rolls back if the
request fails. A 401 from any request logs the user out.

**Alert status.** Each alert is one of: watching, hit (the live price passed the target), triggered
(the backend already fired it) or paused. The status is worked out in the browser by comparing
the alert with the latest price.

**Notifications.** The listener middleware (`src/app/listenerMiddleware.js`) watches for new
prices and alerts. When a target is hit it raises one toast and one bell entry per alert.
Alerts that fired before you opened the page are not announced again. The same file saves the
login to `localStorage` and clears the cache on logout.

**Constants.** Shared values (alert types, statuses, colors, poll interval) live in
`src/lib/constants.js`.

## Good to know

- A triggered alert can't be turned back on because the API treats `triggered_at` as read-only.
  You can only delete it.
- Changes made on the server show up on the next 20 second refresh.
