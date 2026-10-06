import logging
import smtplib
from decimal import Decimal

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import Alert, Cryptocurrency
from .services.coingecko import CoinGeckoError, fetch_prices

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Q

from .services.summary import build_summary

logger = logging.getLogger(__name__)


@shared_task
def fetch_crypto_prices():
    """Fetch live prices from CoinGecko, store them, then queue the alert check."""
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

    if updated:
        check_alerts.delay([coin.pk for coin in updated])
    return len(updated)


@shared_task
def check_alerts(coin_ids):
    """Trigger every active alert whose threshold is reached by the coin's latest price."""
    triggered_count = 0
    now = timezone.now()

    for coin in Cryptocurrency.objects.filter(pk__in=coin_ids, last_price__isnull=False):
        with transaction.atomic():
            # Lock matching rows so two overlapping runs can't trigger the same alert twice.
            alerts = list(
                Alert.objects.select_for_update(of=("self",))
                .active()
                .hit_by(coin.last_price)
                .filter(cryptocurrency=coin)
            )
            if not alerts:
                continue

            for alert in alerts:
                alert.is_active = False
                alert.triggered_at = now
            Alert.objects.bulk_update(alerts, ["is_active", "triggered_at"])

            price = str(coin.last_price)
            for alert in alerts:
                logger.info(
                    "Alert triggered: alert_id=%s user_id=%s %s %s %s (price=%s)",
                    alert.pk, alert.user_id, coin.symbol,
                    alert.alert_type, alert.target_price, price,
                )
                # Queue the email only after the transaction commits successfully.
                transaction.on_commit(
                    lambda alert_id=alert.pk: send_alert_email.delay(alert_id, price)
                )
            triggered_count += len(alerts)

    logger.info("Alert check done: %d alert(s) triggered", triggered_count)
    return triggered_count


@shared_task(
    autoretry_for=(smtplib.SMTPException, ConnectionError, TimeoutError),
    retry_backoff=True,
    max_retries=3,
)
def send_alert_email(alert_id, price):
    """Email the user that their alert threshold was reached."""
    try:
        alert = Alert.objects.select_related("user", "cryptocurrency").get(pk=alert_id)
    except Alert.DoesNotExist:
        logger.warning("Email skipped: alert_id=%s no longer exists", alert_id)
        return False

    user = alert.user
    coin = alert.cryptocurrency
    direction = "above" if alert.alert_type == "above" else "below"

    subject = f"{coin.symbol} price alert: now {price} USD"
    message = (
        f"Hi {user.username},\n\n"
        f"{coin.name} ({coin.symbol}) has gone {direction} your target of "
        f"{alert.target_price} USD.\n"
        f"Current price: {Decimal(price)} USD\n\n"
        f"This alert has been deactivated. Create a new one any time."
    )

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    logger.info("Alert email sent: alert_id=%s user_id=%s", alert_id, user.pk)
    return True


@shared_task
def send_daily_summaries():
    """Queue one summary email per user who has active or recently triggered alerts."""
    since = timezone.now() - timedelta(hours=24)
    user_ids = (
        get_user_model().objects
        .filter(Q(alerts__is_active=True) | Q(alerts__triggered_at__gte=since))
        .values_list("pk", flat=True)
        .distinct()
    )

    count = 0
    for user_id in user_ids:
        send_user_summary_email.delay(user_id)
        count += 1
    logger.info("Daily summaries queued for %d user(s)", count)
    return count


@shared_task(
    autoretry_for=(smtplib.SMTPException, ConnectionError, TimeoutError),
    retry_backoff=True,
    max_retries=3,
)
def send_user_summary_email(user_id):
    """Build and send one user's alert summary."""
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning("Summary skipped: user_id=%s no longer exists", user_id)
        return False

    summary = build_summary(user)
    if summary is None:
        logger.info("Summary skipped: user_id=%s has nothing to report", user_id)
        return False

    subject, body = summary
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])
    logger.info("Summary email sent: user_id=%s", user_id)
    return True
