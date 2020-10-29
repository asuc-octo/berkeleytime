import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from playlist.models import Playlist

# ## List playlists

# **GET /playlists/**

class PlaylistType(DjangoObjectType):
    class Meta:
        model = Playlist
        fields = "__all__"

class Query(graphene.ObjectType):
    playlist = graphene.Field(PlaylistType)

    def resolve_playlist(self, info, **kwargs):
        return Playlist.objects.all()