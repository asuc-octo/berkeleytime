import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from graphql_relay.node.node import from_global_id

# Google Auth
import google_auth_oauthlib.flow
from google.oauth2 import id_token
from google.auth.transport import requests

# JWT
import graphql_jwt
from graphql_jwt.decorators import login_required, refresh_expiration
from graphql_jwt.settings import jwt_settings
from graphql_jwt.refresh_token.shortcuts import create_refresh_token, refresh_token_lazy

# Django models
from django.contrib.auth.models import User
from user.models import BerkeleytimeUser, create_user
from catalog.schema import CourseType
from catalog.models import Course


# Object Types
class UserType(DjangoObjectType):
    class Meta:
        model = User

class BerkeleytimeUserType(DjangoObjectType):
    saved_classes = graphene.List(CourseType)

    @graphene.resolve_only_args
    def resolve_saved_classes(self):
        return self.saved_classes.all()

    class Meta:
        model = BerkeleytimeUser

class UpdateUser(graphene.Mutation):
    class Arguments:
        major = graphene.String(required=False)
        email_class_update = graphene.Boolean(required=False)
        email_grade_update = graphene.Boolean(required=False)
        email_enrollment_opening = graphene.Boolean(required=False)
        email_berkeleytime_update = graphene.Boolean(required=False)

    # output
    user = graphene.Field(BerkeleytimeUserType)

    # avaliable fields
    _user_fields = (
        'major',
        'email_class_update',
        'email_grade_update',
        'email_enrollment_opening',
        'email_berkeleytime_update'
        )

    @login_required
    def mutate(self, info, **kwargs):
        # user = User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser
        user = info.context.user.berkeleytimeuser

        # update user info
        for key in kwargs:
            if key in UpdateUser._user_fields:
                setattr(user, key, kwargs[key])
        user.save()
        return UpdateUser(user=user)

class SaveClass(graphene.Mutation):
    class Arguments:
        class_id = graphene.ID()

    # output
    user = graphene.Field(BerkeleytimeUserType)

    @login_required
    def mutate(self, info, class_id):
        # user = User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser
        user = info.context.user.berkeleytimeuser
        try:
            save_class = Course.objects.get(pk=from_global_id(class_id)[1])
            user.saved_classes.add(save_class)
        except Course.DoesNotExist:
            return GraphQLError('Invalid Class ID')
        return SaveClass(user=user)

class RemoveClass(graphene.Mutation):
    class Arguments:
        class_id = graphene.ID()

    # output
    user = graphene.Field(BerkeleytimeUserType)

    @login_required
    def mutate(self, info, class_id):
        # user = User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser
        user = info.context.user.berkeleytimeuser
        user.saved_classes.remove(from_global_id(class_id)[1])
        return RemoveClass(user=user)

# JWT
def on_token_auth_resolve(context, user, payload):
    """ Append JWT payload (not really needed tbh) and token to graphql
    payload.
    We are using this custom implementation and not the one in graphql_jwt
    because it requires username/password. Kind of hacky and this will
    probably break some jwt settings but it should work for the most part.
    """
    # set payload
    payload.payload = jwt_settings.JWT_PAYLOAD_HANDLER(user, context)
    # get token
    token = jwt_settings.JWT_ENCODE_HANDLER(payload.payload, context)
    # return token in response
    if not jwt_settings.JWT_HIDE_TOKEN_FIELDS:
        payload.token = token
    # set token in cookies
    if getattr(context, 'jwt_cookie', False):
            context.jwt_token = token

    # generate refresh token
    if jwt_settings.JWT_LONG_RUNNING_REFRESH_TOKEN:
        if getattr(context, 'jwt_cookie', False):
            context.jwt_refresh_token = create_refresh_token(user)
            payload.refresh_token = context.jwt_refresh_token.get_token()
        else:
            payload.refresh_token = refresh_token_lazy(user)
    return payload


class ObtainJSONWebToken(graphql_jwt.mixins.JSONWebTokenMixin, graphene.Mutation):
    """ Login mutation using graphql_jwt """
    class Arguments:
        token_id = graphene.String()

    user = graphene.Field(BerkeleytimeUserType)
    new_user = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info, token_id):
        return cls.resolve(root, info, token_id)

    @classmethod
    @refresh_expiration
    def resolve(cls, root, info, token_id):
        info.context._jwt_token_auth = True

        # verify google auth
        try:
            idinfo = id_token.verify_oauth2_token(token_id, requests.Request())
        except ValueError:
            return GraphQLError('Invalid token')
        """
        Sample idinfo
        {
            'iss': 'accounts.google.com',
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
            return GraphQLError('Not berkeley.edu account')

        # find user in current db based on email
        try:
            btuser = User.objects.get(email=idinfo['email']).berkeleytimeuser
            new_user = False
        except User.DoesNotExist:
            # user doesn't exist
            new_user = True
            try:
                # try creating new user
                data={
                    'user' : {
                        'email': idinfo['email'],
                        'first_name': idinfo['given_name'],
                        'last_name': idinfo['family_name']
                        },
                    # we could add support for populating majors/saved classes etc
                }
                btuser = create_user(data)
            except KeyError:
                return GraphQLError('Invalid data from Google account')

        # generate jwt token
        return on_token_auth_resolve(info.context, btuser.user, cls(user=btuser, new_user=new_user))

class Logout(graphene.Mutation):
    success = graphene.Boolean()

    @classmethod
    def mutate(cls, root, info):
        # remove cookies
        deleted = graphql_jwt.DeleteJSONWebTokenCookie.mutate(root, info).deleted
        return Logout(success=deleted)

class DeleteUser(graphene.Mutation):
    success = graphene.Boolean()

    @classmethod
    @login_required
    def mutate(cls, root, info):
        # remove cookies
        graphql_jwt.DeleteJSONWebTokenCookie.mutate(root, info)

        # delete user
        user = info.context.user
        user.delete()
        return DeleteUser(True)

class Query(graphene.ObjectType):
    user = graphene.Field(BerkeleytimeUserType)

    def resolve_user(self, info):
        if info.context.user.is_authenticated:
            return info.context.user.berkeleytimeuser
        return None
        # testing:
        # return User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser

class Mutation(graphene.ObjectType):
    update_user = UpdateUser.Field()
    save_class = SaveClass.Field()
    remove_class = RemoveClass.Field()
    login = ObtainJSONWebToken.Field()
    logout = Logout.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    delete_user = DeleteUser.Field()
