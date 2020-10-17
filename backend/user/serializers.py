from django.contrib.auth import get_user_model
from rest_framework import serializers
from user.models import BerkeleytimeUser

UserModel = get_user_model()

class UserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

class BerkeleytimeUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = BerkeleytimeUser
        fields = '__all__'

    def create(self, validated_data):
        # create django user
        user = UserModel.objects.create(
            email=validated_data['user']['email'],
            first_name=validated_data['user']['first_name'],
            last_name=validated_data['user']['last_name']
            )
        user.save()
        
        # create berkeleytimeuser
        btUser = BerkeleytimeUser.objects.create(
            user = user,
            # other fields are left at default upon registration
        )

        return btUser
