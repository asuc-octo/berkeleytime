import django_filters
import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from grades.models import Grade


class GradeFilter(django_filters.FilterSet):
    class Meta:
        model = Grade
        exclude = ['instructors']


class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        filterset_class = GradeFilter
        interfaces = (graphene.Node, )


class Query(graphene.ObjectType):
    all_grades = DjangoFilterConnectionField(GradeType, filterset_class=GradeFilter)
    grade = graphene.Node.Field(GradeType)
