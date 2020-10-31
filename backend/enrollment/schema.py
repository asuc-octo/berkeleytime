import graphene
from graphene import Node
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError

from enrollment.models import Enrollment


class EnrollmentType(DjangoObjectType):
    class Meta:
        model = Enrollment
        filter_fields = '__all__'
        interfaces = (Node, )

class Query(graphene.ObjectType):
    all_enrollments = DjangoFilterConnectionField(EnrollmentType)
    enrollment = Node.Field(EnrollmentType)
