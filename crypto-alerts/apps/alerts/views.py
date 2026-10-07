import logging

from rest_framework import generics

from .models import Alert, Cryptocurrency
from .serializers import AlertSerializer, CryptocurrencySerializer

logger = logging.getLogger(__name__)


class CryptocurrencyListView(generics.ListAPIView):
    queryset = Cryptocurrency.objects.all()
    serializer_class = CryptocurrencySerializer
    pagination_class = None


class AlertListCreateView(generics.ListCreateAPIView):
    serializer_class = AlertSerializer

    def get_queryset(self):
        return Alert.objects.for_user(self.request.user).select_related("cryptocurrency")

    def perform_create(self, serializer):
        alert = serializer.save(user=self.request.user)
        logger.info(
            "Alert created: alert_id=%s user_id=%s %s %s %s",
            alert.pk, alert.user_id, alert.cryptocurrency.symbol,
            alert.alert_type, alert.target_price,
        )


class AlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlertSerializer

    def get_queryset(self):
        return Alert.objects.for_user(self.request.user).select_related("cryptocurrency")

    def perform_update(self, serializer):
        alert = serializer.save()
        logger.info("Alert updated: alert_id=%s user_id=%s", alert.pk, alert.user_id)

    def perform_destroy(self, instance):
        alert_id, user_id = instance.pk, instance.user_id
        instance.delete()
        logger.info("Alert deleted: alert_id=%s user_id=%s", alert_id, user_id)
