import graphene
from graphene import Node
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError

from grades.models import Grade


class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        filter_fields = '__all__'
        interfaces = (Node, )

class Query(graphene.ObjectType):
    all_grades = DjangoFilterConnectionField(GradeType)
    grade = Node.Field(GradeType)
