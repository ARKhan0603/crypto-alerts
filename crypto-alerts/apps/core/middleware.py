import logging
import time

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Log method, path, status, duration and user id for every request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start) * 1000

        # DRF copies the token-authenticated user onto the underlying request,
        # so this is correct after the view has run.
        user = getattr(request, "user", None)
        user_id = user.pk if user is not None and user.is_authenticated else "-"

        if response.status_code >= 500:
            level = logging.ERROR
        elif response.status_code >= 400:
            level = logging.WARNING
        else:
            level = logging.INFO

        logger.log(
            level,
            "%s %s -> %s (%.1f ms) user_id=%s ip=%s",
            request.method, request.path, response.status_code,
            duration_ms, user_id, request.META.get("REMOTE_ADDR", "-"),
        )
        return response
