import graphene
from graphene import Node
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError

from catalog.models import Course, Section


class CourseType(DjangoObjectType):
    class Meta:
        model = Course
        filter_fields = '__all__'
        interfaces = (Node, )


class SectionType(DjangoObjectType):
    class Meta:
        model = Section
        filter_fields = '__all__'
        interfaces = (Node, )


class Query(graphene.ObjectType):
    course = Node.Field(CourseType)
    all_courses = DjangoFilterConnectionField(CourseType)

    section = Node.Field(SectionType)
    all_sections = DjangoFilterConnectionField(SectionType)
