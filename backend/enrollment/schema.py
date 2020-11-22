import graphene
from graphene import Node
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError
from graphql_relay.node.node import from_global_id
from django.db.models import Sum

from enrollment.models import Enrollment
from catalog.models import Course
from catalog.schema import CourseType, SectionType

# telebears stuff
from berkeleytime.settings import (
    TELEBEARS, CURRENT_SEMESTER, CURRENT_YEAR, PAST_SEMESTERS_TELEBEARS
)


class EnrollmentType(DjangoObjectType):
    class Meta:
        model = Enrollment
        filter_fields = '__all__'
        interfaces = (Node, )

class EnrollmentData(graphene.ObjectType):
    """ Proxy for enrollment object """
    date_created = graphene.Date()
    enrolled = graphene.Int()
    enrolled_max = graphene.Int()

class TelebearData(graphene.ObjectType):
    phase1_start = graphene.Date()
    phase1_end = graphene.Date()
    phase2_start = graphene.Date()
    phase2_end = graphene.Date()
    adj_start = graphene.Date()

class EnrollmentInfo(graphene.ObjectType):
    """ Aggregate enrollment """
    course = graphene.Field(CourseType)
    section = graphene.Field(SectionType)
    aggregate = graphene.Boolean()
    data = graphene.List(EnrollmentData)
    enrolled_max = graphene.Int()
    enrolled_percent_max = graphene.Float()
    enrolled_scale_max = graphene.Int()
    waitlisted_max = graphene.Int()
    waitlisted_percent_max = graphene.Float()
    waitlisted_scale_max = graphene.Int()
    telebears = graphene.Field(TelebearData)


class Query(graphene.ObjectType):
    all_enrollments = DjangoFilterConnectionField(EnrollmentType)
    enrollment = Node.Field(EnrollmentType)
    aggregated_enrollment_by_semester = graphene.Field(
        EnrollmentInfo,
        course_id = graphene.ID(),
        semester = graphene.String(),
        year = graphene.Int()
    )

    def resolve_aggregated_enrollment_by_semester(root, info, course_id, semester, year):
        current_term = semester == CURRENT_SEMESTER and year == CURRENT_YEAR

        course = Course.objects.get(pk = from_global_id(course_id)[1])
        sections = course.section_set.all().filter(semester = semester, year = year, disabled = False, is_primary = True)

        enrollments = Enrollment.objects.filter(section__in = sections).values('date_created').annotate(enrolled=Sum('enrolled'), enrolled_max=Sum('enrolled_max')).order_by('date_created')

        models = []
        for data in enrollments:
            e = EnrollmentData(**data)
            models.append(e)

        enrolled_max = models[-1].enrolled_max

        # telebears
        if current_term:
            telebears = TelebearData(**TELEBEARS)
        else:
            telebears = TelebearData(**PAST_SEMESTERS_TELEBEARS.get(f'{semester} {year}', {}))

        return EnrollmentInfo(
            course = course,
            aggregate = True,
            data = models,
            enrolled_max = enrolled_max,
            telebears = telebears
        )

        # stuff from the original implementation:
        # last_date = sections[0].enrollment_set.all().latest('date_created').date_created
        # enrolled_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum('enrolled_max'))['enrolled_max__sum']
        # waitlisted_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum('waitlisted_max'))['waitlisted_max__sum']

        # dates = {d: [0, 0] for d in sections[0].enrollment_set.all().values_list('date_created', flat = True)}


        # enrolled_outliers = [d['enrolled_percent'] for d in rtn['data'] if d['enrolled_percent'] >= 1.0]
        # enrolled_percent_max = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
        # waitlisted_outliers = [d['waitlisted_percent'] for d in rtn['data'] if d['waitlisted_percent'] >= 1.0]
        # waitlisted_percent_max = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
        # enrolled_scale_max = int(rtn['enrolled_percent_max'] * rtn['enrolled_max'])
        # waitlisted_scale_max = int(rtn['waitlisted_percent_max'] * rtn['waitlisted_max'])
