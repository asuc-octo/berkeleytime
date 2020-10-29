import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from catalog.models import Course, Section


# ## List courses
# **GET /courses/?filters={filter_id1,filter_id2,...}&has_enrollment={True, False}**

# *has_enrollment*=True means only return the courses with enrollment data

# ## Retrieve course

# **GET /courses/:course_id/**

# ## List sections

# **GET /sections/?course_id={course_id}**

class CourseType(DjangoObjectType):
    class Meta:
        model = Course
        fields = "__all__"

class SectionType(DjangoObjectType):
    class Meta:
        model = Section
        fields = "__all__"

class Query(graphene.ObjectType):
    course = graphene.Field(CourseType)
    section = graphene.Field(SectionType)

    def resolve_course(self, info, **kwargs):
        return Course.objects.all()

    def resolve_section(self, info, **kwargs):
        return Section.objects.all()