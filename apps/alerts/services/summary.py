from datetime import timedelta

from django.utils import timezone

from apps.alerts.models import Alert


def _fmt(value):
    return "n/a" if value is None else format(value.normalize(), "f")


def build_summary(user, hours=24):
    """Return (subject, body) for the user, or None if there is nothing to report."""
    since = timezone.now() - timedelta(hours=hours)
    alerts = Alert.objects.for_user(user).select_related("cryptocurrency")

    active = list(alerts.active().order_by("cryptocurrency__symbol", "target_price"))
    triggered = list(alerts.filter(triggered_at__gte=since).order_by("-triggered_at"))
    if not active and not triggered:
        return None

    lines = [f"Hi {user.username},", "", f"Your crypto alert summary for the last {hours} hours.", ""]

    lines.append(f"Triggered ({len(triggered)}):")
    for a in triggered:
        lines.append(f"  - {a.cryptocurrency.symbol} {a.alert_type} {_fmt(a.target_price)} USD")
    if not triggered:
        lines.append("  none")

    lines += ["", f"Still watching ({len(active)}):"]
    for a in active:
        coin = a.cryptocurrency
        lines.append(
            f"  - {coin.symbol} {a.alert_type} {_fmt(a.target_price)} USD "
            f"(current: {_fmt(coin.last_price)} USD)"
        )
    if not active:
        lines.append("  none")

    subject = f"Your crypto alert summary: {len(triggered)} triggered, {len(active)} active"
    return subject, "\n".join(lines)
