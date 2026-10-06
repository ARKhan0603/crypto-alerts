from rest_framework import serializers

from .models import Alert, Cryptocurrency


class SymbolRelatedField(serializers.SlugRelatedField):
    """Accept a coin symbol like 'btc' or 'BTC' and resolve it to a Cryptocurrency."""

    def to_internal_value(self, data):
        if isinstance(data, str):
            data = data.strip().upper()
        return super().to_internal_value(data)


class CryptocurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Cryptocurrency
        fields = ["symbol", "name", "last_price", "last_price_at"]


class AlertSerializer(serializers.ModelSerializer):
    symbol = SymbolRelatedField(
        source="cryptocurrency",
        slug_field="symbol",
        queryset=Cryptocurrency.objects.all(),
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "symbol",
            "alert_type",
            "target_price",
            "is_active",
            "triggered_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "triggered_at", "created_at", "updated_at"]

    def validate_target_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target price must be greater than 0.")
        return value

    def validate(self, attrs):
        """Reject a duplicate active alert with a clear message (the DB constraint is the backstop)."""
        instance = self.instance
        user = self.context["request"].user

        cryptocurrency = attrs.get("cryptocurrency", getattr(instance, "cryptocurrency", None))
        alert_type = attrs.get("alert_type", getattr(instance, "alert_type", None))
        target_price = attrs.get("target_price", getattr(instance, "target_price", None))
        is_active = attrs.get("is_active", getattr(instance, "is_active", True))

        if is_active:
            duplicates = Alert.objects.filter(
                user=user,
                cryptocurrency=cryptocurrency,
                alert_type=alert_type,
                target_price=target_price,
                is_active=True,
            )
            if instance is not None:
                duplicates = duplicates.exclude(pk=instance.pk)
            if duplicates.exists():
                raise serializers.ValidationError(
                    "You already have an active alert with these exact settings."
                )
        return attrs
