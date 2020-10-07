from rest_framework import serializers
from user.models import BerkeleytimeUser

class UserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

class BerkeleytimeUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = BerkeleytimeUser
        fields = '__all__'
