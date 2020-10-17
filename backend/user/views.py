from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User


# Google Auth
from google.oauth2 import id_token
from google.auth.transport import requests

from user.serializers import BerkeleytimeUserSerializer
from user.models import BerkeleytimeUser

# JWT global handlers
jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

# Google Auth
CLIENT_ID = '***REMOVED***'

class BerkeleytimeUserViewSet(viewsets.ViewSet):
    queryset = BerkeleytimeUser.objects.all()
    serializer_class = BerkeleytimeUserSerializer
    permission_classes = [IsAuthenticated]

    # GET /user/
    def list(self, request):
        serializer = BerkeleytimeUserSerializer(request.user.berkeleytimeuser, many=False)
        return Response(serializer.data)

    # PATCH /user/
    def partial_update(self, request, pk=None):
        user = request.user.berkeleytimeuser
        serializer = BerkeleytimeUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.validated_data)
        else:
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

    # POST /user/login/
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        # verify google auth
        try:
            idinfo = id_token.verify_oauth2_token(request.data['tokenId'], requests.Request())
            print(idinfo)
        except ValueError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            return Response({'error': 'No token'}, status=status.HTTP_400_BAD_REQUEST)
        """
        Sample idinfo
        {
            'iss': 'accounts.google.com',
            'azp': '***REMOVED***.apps.googleusercontent.com',
            'aud': '***REMOVED***.apps.googleusercontent.com',
            'sub': '118249227406852333938',
            'hd': 'berkeley.edu',
            'email': 'smxu@berkeley.edu',
            'email_verified': True,
            'at_hash': 'MJ-3DDx_HCBLbs-e_3531g',
            'name': 'Shuming Xu',
            'picture': 'https://lh6.googleusercontent.com/-Fk03bwRzULw/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucnqpb2_h0I-8NRDOgm-QKkbYx2Dbw/s96-c/photo.jpg',
            'given_name': 'Shuming',
            'family_name': 'Xu',
            'locale': 'en',
            'iat': 1602969244,
            'exp': 1602972844,
            'jti': '151a33ebedbddb776d47ae5b316f6941e45003fd'
        }
        """
        # verify berkeley email
        if 'hd' not in idinfo or idinfo['hd'] != 'berkeley.edu':
            return Response({'error': 'Not berkeley.edu account'}, status=status.HTTP_401_UNAUTHORIZED) 

        # find user in current db based on email
        try:
            user = User.objects.get(email='smxu@berkeley.edu')
            new_user = False
        except User.DoesNotExist:
            # user doesn't exist, register
            new_user = True
            serializer = BerkeleytimeUserSerializer(
                data={
                    'user' : {
                        'email': idinfo['email'],
                        'first_name': idinfo['given_name'],
                        'last_name': idinfo['family_name']
                        },
                    # we could add support for populating majors/saved classes etc
                }
            )
            if not serializer.is_valid(raise_exception=True):
                return Response({'error': 'Invalid data from Google account'}, status=status.HTTP_400_BAD_REQUEST) 
            user = serializer.save().user

        # generate jwt token
        jwt_payload = jwt_payload_handler(user)
        jwt_token = jwt_encode_handler(jwt_payload)

        # get user data
        serializer = BerkeleytimeUserSerializer(user.berkeleytimeuser, many=False)
        response = {'token': jwt_token, 'new_user': new_user, 'user': serializer.data}
        return Response(response)
