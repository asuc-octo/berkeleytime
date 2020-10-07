from rest_framework import viewsets
from rest_framework.response import Response
from user.serializers import BerkeleytimeUserSerializer
from user.models import BerkeleytimeUser

class BerkeleytimeUserViewSet(viewsets.ViewSet):
    queryset = BerkeleytimeUser.objects.all()
    # serializer_class = BerkeleytimeUserSerializer
    http_method_names = ['get']
    # limit this to get for custom register implementation

    def list(self, request):
        serializer = BerkeleytimeUserSerializer(request.user.berkeleytimeuser, many=False)
        return Response(serializer.data)
