# Crypto Price Alerts

Set a target price for a coin (BTC, ETH, etc.) and get an email when it's reached.
It's two apps in one repo:

- `crypto-alerts/` - the Django API. Handles login, alerts, and the Celery jobs that fetch prices and send emails.
- `frontend/` - the React dashboard.
- `nginx/` - config that puts both behind one address.

Each folder has its own README with setup steps.
