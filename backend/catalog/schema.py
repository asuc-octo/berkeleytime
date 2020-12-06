from functools import reduce

import arrow
import django_filters
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql_relay.node.node import from_global_id

from catalog.models import Course, Section
from playlist.models import Playlist


class CourseFilter(django_filters.FilterSet):
    class Meta:
        model = Course
        fields = '__all__'

    has_grades = django_filters.BooleanFilter(method='filter_has_grades')
    # overrides Course.has_enrollment. TODO: Remove Course.has_enrollment soon
    has_enrollment = django_filters.BooleanFilter(method='filter_has_enrollment')
    in_playlists = django_filters.BaseInFilter(method='filter_in_playlists')
    id_in = django_filters.BaseInFilter(method='filter_id_in')

    def filter_has_grades(self, queryset, name, value):
        return queryset.exclude(grade__isnull=value)

    def filter_has_enrollment(self, queryset, name, value):
        return queryset.exclude(section__isnull=value)

    def filter_in_playlists(self, queryset, name, value):
        playlist_ids = list(map(lambda global_id: from_global_id(global_id)[1], value))
        categories = Playlist.objects.filter(id__in=playlist_ids).distinct('category').values_list('category', flat=True)
        all_reduce = queryset
        for category in categories:
            playlists = Playlist.objects.filter(id__in=playlist_ids, category=category)
            intersected = [playlist.courses.all() for playlist in playlists]
            if category in ('university', 'ls', 'engineering', 'haas'):
                all_reduce &= all_reduce & reduce(lambda x, y: x & y, intersected)
            else:
                all_reduce &= all_reduce & reduce(lambda x, y: x | y, intersected)
        return all_reduce

    def filter_id_in(self, queryset, name, value):
        course_ids = list(map(lambda global_id: from_global_id(global_id)[1], value))
        return queryset.filter(id__in=course_ids)


class CourseType(DjangoObjectType):
    class Meta:
        model = Course
        filterset_class = CourseFilter
        interfaces = (graphene.Node, )

    units = graphene.String()

    def resolve_units(self, info):
        """Format units in a readable way."""
        if '-' in self.units:
            separator = '-'
        elif 'or' in self.units:
            separator = 'or'
        else:
            return self.units
        try:
            first, second = list(map(
                lambda u: int(float(u.strip())),
                self.units.split(separator)
            ))
            return f'{first}-{second}'
        except ValueError:
            return self.units


class SectionFilter(django_filters.FilterSet):
    class Meta:
        model = Section
        fields = '__all__'


class SectionType(DjangoObjectType):
    class Meta:
        model = Section
        filterset_class = SectionFilter
        interfaces = (graphene.Node, )

    word_days = graphene.String()
    start_time = graphene.DateTime()
    end_time = graphene.DateTime()

    def resolve_word_days(self, info):
        days = {'0': 'Su', '1': 'M', '2': 'Tu', '3': 'W', '4': 'Th', '5': 'F', '6': 'Sa', '7': 'Su'}
        return ''.join([days[i] for i in self.days])

    def resolve_start_time(self, info):
        return SectionType.format_time(self.start_time)

    def resolve_end_time(self, info):
        return SectionType.format_time(self.end_time)

    @staticmethod
    def format_time(dt):
        if not dt:
            return None
        return arrow.get(dt).to(tz='US/Pacific').naive

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset.filter(disabled=False)


class Query(graphene.ObjectType):
    course = graphene.Node.Field(CourseType)
    all_courses = DjangoFilterConnectionField(CourseType)

    section = graphene.Node.Field(SectionType)
    all_sections = DjangoFilterConnectionField(SectionType)
