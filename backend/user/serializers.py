from django.contrib.auth import get_user_model
from django.db.models import fields
from rest_framework import serializers
from user.models import BerkeleytimeUser


# Get Django's default auth user model
UserModel = get_user_model()

class UserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=1500, required=False)

class BerkeleytimeUserSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    major = serializers.CharField(max_length=100, required=False)
    email_class_update = serializers.BooleanField(required=False)
    email_grade_update = serializers.BooleanField(required=False)
    email_enrollment_opening = serializers.BooleanField(required=False)
    email_berkeleytime_update = serializers.BooleanField(required=False)

    class Meta:
        model = BerkeleytimeUser
        exclude = ('saved_classes',)
        # excluded for now, will be added back when we add a course serializer

    def create(self, validated_data):
        # create django user
        user = UserModel.objects.create(
            email = validated_data['user']['email'],
            first_name = validated_data['user']['first_name'],
            last_name = validated_data['user']['last_name'],
            username = validated_data['user']['email'].replace('@berkeley.edu', '')
        )
        user.save()

        # create berkeleytimeuser
        btUser = BerkeleytimeUser.objects.create(
            user = user,
            # other fields are left at default upon registration
            # we could add the option to populate them later
        )
        btUser.save()

        return btUser
