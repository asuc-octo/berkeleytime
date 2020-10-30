import graphene
from graphene import Node
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError

from playlist.models import Playlist


class PlaylistType(DjangoObjectType):
    class Meta:
        model = Playlist
        filter_fields = '__all__'
        interfaces = (Node,)

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset.exclude(category='custom')

class Query(graphene.ObjectType):
    all_playlists = DjangoFilterConnectionField(PlaylistType)
    playlist = Node.Field(PlaylistType)