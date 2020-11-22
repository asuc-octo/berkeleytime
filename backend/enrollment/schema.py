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

# telebears
from berkeleytime.settings import (
    TELEBEARS, CURRENT_SEMESTER, CURRENT_YEAR, PAST_SEMESTERS_TELEBEARS
)
# new sections
from catalog.resource import sis_class_resource


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
    waitlisted = graphene.Int()
    waitlisted_max = graphene.Int()

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
        current_term = semester == CURRENT_SEMESTER and str(year) == CURRENT_YEAR
        course = Course.objects.get(pk = from_global_id(course_id)[1])
        sections = course.section_set.all().filter(semester = semester, year = year, disabled = False, is_primary = True)
        enrollments = Enrollment.objects.filter(section__in = sections) \
                                        .values('date_created') \
                                        .annotate(
                                            enrolled=Sum('enrolled'),
                                            enrolled_max=Sum('enrolled_max'),
                                            waitlisted=Sum('waitlisted'),
                                            waitlisted_max=Sum('waitlisted_max')
                                        ) \
                                        .order_by('date_created')

        # django annotate dict to enrollment data
        models = []
        for data in enrollments:
            e = EnrollmentData(**data)
            models.append(e)
        lastData = models[-1]

        # telebears
        if current_term:
            # telebears
            telebears = TelebearData(**TELEBEARS)

            # get latest data
            # sis data may be either a dict of a single section
            # or a list of sections
            sis_data = sis_class_resource.get(
                semester=semester,
                year=year,
                course_id=course_id,
                abbreviation=course.abbreviation,
                course_number=course.course_number
            )

            if isinstance(sis_data, dict) and 'enrollmentStatus' in sis_data:
                # update new data
                lastData.enrolled = sis_data['enrollmentStatus']['enrolledCount']
                lastData.waitlisted = sis_data['enrollmentStatus']['waitlistedCount']
                lastData.enrolled_max = sis_data['enrollmentStatus']['maxEnroll']
                lastData.waitlisted_max = sis_data['enrollmentStatus']['maxWaitlist']
            elif isinstance(sis_data, list):
                last_enrolled = 0
                last_waitlisted = 0
                enrolled_max = 0
                waitlisted_max = 0
                # aggregate over sections
                for section in sis_data:
                    if section['association']['primary'] and \
                        section['status']['description'] != 'Disabled':
                        # Not too sure about the exact status codes
                        # but here's what I have so far:
                        # A - Active
                        # O - Open
                        # C - Closed
                        # so... maybe D - Disabled?
                        last_enrolled += section['enrollmentStatus']['enrolledCount']
                        last_waitlisted += section['enrollmentStatus']['waitlistedCount']
                        enrolled_max += section['enrollmentStatus']['maxEnroll']
                        waitlisted_max += section['enrollmentStatus']['maxWaitlist']
                
                # update new data
                lastData.enrolled = last_enrolled
                lastData.waitlisted = last_waitlisted
                lastData.enrolled_max = enrolled_max
                lastData.waitlisted_max = waitlisted_max
            else:
                # the data from sis is somehow invalid?
                # might want to include some sort of
                # warning message
                pass
        else:
            # not current term
            # just telebears
            telebears = TelebearData(**PAST_SEMESTERS_TELEBEARS.get(f'{semester} {year}', {}))

        return EnrollmentInfo(
            course = course,
            aggregate = True,
            data = models,
            enrolled_max = lastData.enrolled_max,
            waitlisted_max = lastData.waitlisted_max,
            telebears = telebears
        )
