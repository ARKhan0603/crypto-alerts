from django.urls import path

from .views import AlertDetailView, AlertListCreateView, CryptocurrencyListView

urlpatterns = [
    path("cryptocurrencies/", CryptocurrencyListView.as_view(), name="crypto-list"),
    path("alerts/", AlertListCreateView.as_view(), name="alert-list"),
    path("alerts/<int:pk>/", AlertDetailView.as_view(), name="alert-detail"),
]
