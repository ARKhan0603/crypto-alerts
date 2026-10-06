import logging

from celery import shared_task
from django.utils import timezone

from .models import Cryptocurrency
from .services.coingecko import CoinGeckoError, fetch_prices

logger = logging.getLogger(__name__)


@shared_task
def fetch_crypto_prices():
    """Fetch live prices from CoinGecko and store them on each Cryptocurrency."""
    coins = list(Cryptocurrency.objects.all())
    if not coins:
        logger.warning("Price fetch skipped: no cryptocurrencies in the database")
        return 0

    try:
        prices = fetch_prices([coin.coingecko_id for coin in coins])
    except CoinGeckoError as exc:
        logger.error("Price fetch failed: %s", exc)
        return 0

    now = timezone.now()
    updated = []
    for coin in coins:
        price = prices.get(coin.coingecko_id)
        if price is None:
            logger.warning("No price returned for %s", coin.symbol)
            continue
        coin.last_price = price
        coin.last_price_at = now
        updated.append(coin)

    Cryptocurrency.objects.bulk_update(updated, ["last_price", "last_price_at"])
    logger.info("Prices updated for %d/%d coins", len(updated), len(coins))
    return len(updated)
