from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User

from user.serializers import BerkeleytimeUserSerializer
from user.models import BerkeleytimeUser

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

class BerkeleytimeUserViewSet(viewsets.ViewSet):
    queryset = BerkeleytimeUser.objects.all()
    serializer_class = BerkeleytimeUserSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        serializer = BerkeleytimeUserSerializer(request.user.berkeleytimeuser, many=False)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        # google's token shoudl be included in request.data
        # assume that it has been verified

        # find user in current db based on email
        try:
            user = User.objects.get(email='smxu@berkeley.edu')
            new_user = False
        except User.DoesNotExist:
            # user doesn't exist, register
            user = None
            new_user = True
            pass

        # generate jwt token
        jwt_payload = jwt_payload_handler(user)
        jwt_token = jwt_encode_handler(jwt_payload)

        # get default user data
        serializer = BerkeleytimeUserSerializer(user.berkeleytimeuser, many=False)
        response = {'token': jwt_token, 'new_user': new_user, 'user': serializer.data}
        return Response(response)
