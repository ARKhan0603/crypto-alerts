import json
import logging
from decimal import Decimal

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class CoinGeckoError(Exception):
    """Raised when prices cannot be fetched from CoinGecko."""


def fetch_prices(coingecko_ids):
    """Return {coingecko_id: Decimal price in USD} for the given ids."""
    url = f"{settings.COINGECKO_API_URL}/simple/price"
    params = {"ids": ",".join(coingecko_ids), "vs_currencies": "usd"}

    try:
        response = requests.get(url, params=params, timeout=settings.COINGECKO_TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise CoinGeckoError(f"CoinGecko request failed: {exc}") from exc

    try:
        # parse_float=Decimal keeps exact values; floats would add rounding errors
        data = json.loads(response.text, parse_float=Decimal)
        return {
            coin_id: Decimal(str(values["usd"]))
            for coin_id, values in data.items()
            if "usd" in values
        }
    except (ValueError, TypeError, AttributeError) as exc:
        raise CoinGeckoError(f"Unexpected CoinGecko response: {exc}") from exc
