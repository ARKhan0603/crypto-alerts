# Crypto Alerts API

Django REST API for the price alerts app. Prices come from CoinGecko, a Celery worker checks
them every 20 seconds and emails users when an alert's target is hit.

## What you need

- Python 3.12+
- PostgreSQL
- Redis (Celery uses it as the broker)

## Setup

```bash
cd crypto-alerts
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements/dev.txt
cp .env.example .env
```

Create a Postgres database and user, then put the details in `.env` (`DB_NAME`, `DB_USER`,
`DB_PASSWORD`, `DB_HOST`, `DB_PORT`). Also set a real `SECRET_KEY`.

```bash
python manage.py migrate
python manage.py seed_cryptocurrencies   # adds BTC, ETH, XRP, ADA, SOL, DOGE
python manage.py createsuperuser         # optional, for /admin
```

## Running it

You need three terminals:

```bash
python manage.py runserver               # API on http://127.0.0.1:8000
celery -A config worker -l info          # runs the tasks
celery -A config beat -l info            # schedules them
```

By default emails are printed to the worker's console instead of being sent. To send real ones,
change the `EMAIL_*` values in `.env`.

## Endpoints

All under `/api/v1/`.

| Method | Path | What it does |
| --- | --- | --- |
| POST | `auth/register/` | create an account |
| POST | `auth/login/` | get a token |
| POST | `auth/logout/` | delete the token |
| GET | `cryptocurrencies/` | coins with their latest price |
| GET, POST | `alerts/` | list your alerts / create one |
| GET, PUT, PATCH, DELETE | `alerts/<id>/` | one alert |

Send the token as `Authorization: Token <token>`.

## Notes

- If you pull changes and `migrate` complains about the alerts app, the migrations were
  squashed into a single `0001_initial`. On a dev database run `python manage.py migrate alerts zero`
  and then `python manage.py migrate`.
