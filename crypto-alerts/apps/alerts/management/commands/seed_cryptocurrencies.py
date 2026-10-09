from django.core.management.base import BaseCommand

from apps.alerts.models import Cryptocurrency

COINS = [
    ("BTC", "Bitcoin", "bitcoin"),
    ("ETH", "Ethereum", "ethereum"),
    ("XRP", "XRP", "ripple"),
    ("ADA", "Cardano", "cardano"),
    ("SOL", "Solana", "solana"),
    ("DOGE", "Dogecoin", "dogecoin"),
]


class Command(BaseCommand):
    help = "Create or update the supported cryptocurrencies."

    def handle(self, *args, **options):
        for symbol, name, coingecko_id in COINS:
            _, created = Cryptocurrency.objects.update_or_create(
                symbol=symbol,
                defaults={"name": name, "coingecko_id": coingecko_id},
            )
            self.stdout.write(f"{'Created' if created else 'Updated'} {symbol}")
