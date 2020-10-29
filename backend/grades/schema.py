import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from grades.models import Grade

# ## List grades

# **GET /grades/?course_id={course_id}**

# ## Retrieve grades

# **GET /grades/:grade_ids/?include_aggregate={True, False}**

# Set *include_aggregate*=True to include aggregate

class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        fields = "__all__"

class Query(graphene.ObjectType):
    grade = graphene.Field(GradeType)

    def resolve_grade(self, info, **kwargs):
        return Grade.objects.all()