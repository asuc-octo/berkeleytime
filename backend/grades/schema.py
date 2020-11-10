import graphene
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from grades.models import Grade


class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        filter_fields = '__all__'
        interfaces = (graphene.Node, )


class Query(graphene.ObjectType):
    all_grades = DjangoFilterConnectionField(GradeType)
    grade = graphene.Node.Field(GradeType)
