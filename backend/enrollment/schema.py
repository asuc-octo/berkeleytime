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
    day = graphene.Int()
    date_created = graphene.Date()
    
    enrolled = graphene.Int()
    enrolled_max = graphene.Int()
    enrolled_percent = graphene.Float()

    waitlisted = graphene.Int()
    waitlisted_max = graphene.Int()
    waitlisted_percent = graphene.Float()

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
    data = graphene.List(EnrollmentData)
    enrolled_max = graphene.Int()
    enrolled_percent_max = graphene.Float()
    enrolled_scale_max = graphene.Int()
    waitlisted_max = graphene.Int()
    waitlisted_percent_max = graphene.Float()
    waitlisted_scale_max = graphene.Int()
    telebears = graphene.Field(TelebearData)


def create_enrollment_data(data, phase1_start):
    """ Creates an enrollment graphene type from
    raw data.
    
    Args:
    data -- dictionary with fields enrolled, enrolled_max, waitlisted, waitlisted_max, and date_created
    phase1_start -- datetime of phase 1 start date

    Return: EnrollmentData object
     """ 
    enrollment = EnrollmentData(**data)

    # manually add additional fields
    enrollment.enrolled_percent = round(enrollment.enrolled / enrollment.enrolled_max, 3) \
                                    if enrollment.enrolled_max else -1
    enrollment.waitlisted_percent = round(enrollment.waitlisted / enrollment.waitlisted_max, 3) \
                                    if enrollment.waitlisted_max else -1
    enrollment.day = (enrollment.date_created - phase1_start).days + 1
    return enrollment


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

        # telebears
        if current_term:
            telebears = TelebearData(**TELEBEARS)
        else:
            telebears = TelebearData(**PAST_SEMESTERS_TELEBEARS.get(f'{semester} {year}', {}))

        # django annotate dict to enrollment data
        models = []
        enrolled_outlier = 1.0
        waitlisted_outlier = 1.0
        for data in enrollments:
            enrollment = create_enrollment_data(data, telebears.phase1_start)
            models.append(enrollment)

            # outliers
            if enrollment.enrolled_percent > enrolled_outlier:
                enrolled_outlier = enrollment.enrolled_percent
            if enrollment.waitlisted_percent > waitlisted_outlier:
                waitlisted_outlier = enrollment.waitlisted_percent
        
        # sis
        if current_term:
            sis_data = sis_class_resource.get(
                semester=semester,
                year=year,
                course_id=course_id,
                abbreviation=course.abbreviation,
                course_number=course.course_number
            )

            # aggregate over sections
            last_enrolled, last_waitlisted, last_enrolled_max, last_waitlisted_max = 0, 0, 0, 0
            for section in sis_data:
                if section['association']['primary'] and section['printInScheduleOfClasses']:
                    last_enrolled += section['enrollmentStatus']['enrolledCount']
                    last_waitlisted += section['enrollmentStatus']['waitlistedCount']
                    last_enrolled_max += section['enrollmentStatus']['maxEnroll']
                    last_waitlisted_max += section['enrollmentStatus']['maxWaitlist']

            # update the last data
            models[-1] = create_enrollment_data({
                'enrolled': last_enrolled,
                'waitlisted': last_waitlisted,
                'enrolled_max': last_enrolled_max,
                'waitlisted_max': last_waitlisted_max,
                'date_created': models[-1].date_created
            }, telebears.phase1_start)

        # get section percentages
        enrolled_max = models[-1].enrolled_max
        enrolled_percent_max = enrolled_outlier * 1.10
        enrolled_scale_max = int(enrolled_max * enrolled_percent_max)
        
        waitlisted_max = models[-1].waitlisted_max
        waitlisted_percent_max = waitlisted_outlier * 1.10
        waitlisted_scale_max = int(waitlisted_max * waitlisted_percent_max)

        return EnrollmentInfo(
            course = course,
            data = models,
            enrolled_max = enrolled_max,
            enrolled_percent_max = enrolled_percent_max,
            enrolled_scale_max = enrolled_scale_max,
            waitlisted_max = waitlisted_max,
            waitlisted_percent_max = waitlisted_percent_max,
            waitlisted_scale_max = waitlisted_scale_max,
            telebears = telebears
        )
