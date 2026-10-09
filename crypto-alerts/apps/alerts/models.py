from django.conf import settings
from django.db import models
from django.db.models import Q

from apps.core.models import TimeStampedModel


class AlertType(models.TextChoices):
    ABOVE = "above", "Above"
    BELOW = "below", "Below"


class Cryptocurrency(TimeStampedModel):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=50)
    coingecko_id = models.CharField(max_length=100, unique=True)
    last_price = models.DecimalField(
        max_digits=20, decimal_places=8, null=True, blank=True
    )
    last_price_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["symbol"]
        verbose_name_plural = "cryptocurrencies"

    def __str__(self):
        return self.symbol


class AlertQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def for_user(self, user):
        return self.filter(user=user)

    def hit_by(self, price):
        """Alerts whose threshold is reached by the given price."""
        return self.filter(
            Q(alert_type=AlertType.ABOVE, target_price__lte=price)
            | Q(alert_type=AlertType.BELOW, target_price__gte=price)
        )


class Alert(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="alerts",
    )
    cryptocurrency = models.ForeignKey(
        Cryptocurrency,
        on_delete=models.PROTECT,
        related_name="alerts",
    )
    alert_type = models.CharField(max_length=5, choices=AlertType.choices)
    target_price = models.DecimalField(max_digits=20, decimal_places=8)
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(null=True, blank=True)

    objects = AlertQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["is_active", "cryptocurrency"],
                name="alert_active_crypto_idx",
            ),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(target_price__gt=0),
                name="alert_target_price_gt_0",
            ),
            models.UniqueConstraint(
                fields=["user", "cryptocurrency", "alert_type", "target_price"],
                condition=Q(is_active=True),
                name="unique_active_alert",
            ),
        ]

    def __str__(self):
        return f"{self.user} | {self.cryptocurrency} {self.alert_type} {self.target_price}"
