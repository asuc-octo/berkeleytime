import graphene
from django.db.models import Q
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR
from playlist.models import Playlist


class PlaylistType(DjangoObjectType):
    class Meta:
        model = Playlist
        filter_fields = '__all__'
        interfaces = (graphene.Node, )

    @classmethod
    def get_queryset(cls, queryset, info):
        return (queryset.exclude(Q(category='custom') | Q(category='ls')) |
               queryset.filter(category='ls', semester=CURRENT_SEMESTER, year=CURRENT_YEAR))

class Query(graphene.ObjectType):
    all_playlists = DjangoFilterConnectionField(PlaylistType)
    playlist = graphene.Node.Field(PlaylistType)