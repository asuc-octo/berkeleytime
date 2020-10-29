import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from enrollment.models import Enrollment

# ## Retrieve enrollments

# **GET /enrollment/?section_ids={section_ids}?include_aggregate={True, False}**

# Set *include_aggregate*=True to include aggregate

class EnrollmentType(DjangoObjectType):
    class Meta:
        model = Enrollment
        fields = "__all__"

class Query(graphene.ObjectType):
    enrollment = graphene.Field(EnrollmentType)

    def resolve_enrollment(self, info, **kwargs):
        return Enrollment.objects.all()