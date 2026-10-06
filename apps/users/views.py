import logging

from rest_framework import generics, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def perform_create(self, serializer):
        user = serializer.save()
        logger.info("User registered: user_id=%s", user.pk)


class LoginView(ObtainAuthToken):
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except ValidationError:
            logger.warning(
                "Failed login attempt: username=%s", request.data.get("username")
            )
            raise
        logger.info("User logged in: username=%s", request.data.get("username"))
        return response


class LogoutView(APIView):
    def post(self, request):
        request.auth.delete()
        logger.info("User logged out: user_id=%s", request.user.pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
