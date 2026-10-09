from django.contrib import admin

from .models import Alert, Cryptocurrency

admin.site.register(Cryptocurrency)
admin.site.register(Alert)
