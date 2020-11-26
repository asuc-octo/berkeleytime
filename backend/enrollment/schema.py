import graphene
from graphql_relay.node.node import from_global_id
from django.db.models import Sum

from enrollment.models import Enrollment
from catalog.models import Course, Section
from catalog.schema import CourseType, SectionType

# telebears
from berkeleytime.settings import (
    TELEBEARS, CURRENT_SEMESTER, CURRENT_YEAR, PAST_SEMESTERS_TELEBEARS
)
# real time sis
from enrollment.service import enrollment_service

class EnrollmentData(graphene.ObjectType):
    """ Proxy for enrollment object. Using this instead of
    a DjangoObjectType gives us higher flexibility of the data. """
    day = graphene.Int()
    date_created = graphene.Date()
    
    enrolled = graphene.Int()
    enrolled_max = graphene.Int()
    enrolled_percent = graphene.Float()

    waitlisted = graphene.Int()
    waitlisted_max = graphene.Int()
    waitlisted_percent = graphene.Float()

class TelebearData(graphene.ObjectType):
    """ Telebears JSON """
    phase1_start = graphene.Date()
    phase1_end = graphene.Date()
    phase2_start = graphene.Date()
    phase2_end = graphene.Date()
    adj_start = graphene.Date()

class EnrollmentInfo(graphene.ObjectType):
    """ The return format of both queries """
    course = graphene.Field(CourseType)
    section = graphene.List(SectionType)
    # using a list since aggreagte can have multple sections
    
    telebears = graphene.Field(TelebearData)

    data = graphene.List(EnrollmentData)

    enrolled_max = graphene.Int()
    enrolled_percent_max = graphene.Float()
    enrolled_scale_max = graphene.Int()

    waitlisted_max = graphene.Int()
    waitlisted_percent_max = graphene.Float()
    waitlisted_scale_max = graphene.Int()
    

def create_enrollment_data(data, phase1_start):
    """ Creates an enrollment graphene type from
    raw data.
    
    Args:
        data: dictionary with fields enrolled, enrolled_max,
              waitlisted, waitlisted_max, and date_created
        phase1_start: datetime of phase 1 start date

    Return:
        EnrollmentData object
    """ 
    enrollment = EnrollmentData(**data)

    # manually add additional fields
    enrollment.enrolled_percent = round(enrollment.enrolled / enrollment.enrolled_max, 3) \
                                    if enrollment.enrolled_max else -1
    enrollment.waitlisted_percent = round(enrollment.waitlisted / enrollment.waitlisted_max, 3) \
                                    if enrollment.waitlisted_max else -1
    enrollment.day = (enrollment.date_created - phase1_start).days + 1

    return enrollment

def queryset_to_enrollment(enrollments, telebears):
    """ Convert queryset to EnrollmentData object.
    
    Args:
        enrollments: queryset with values enrolled, enrolled_max,
                     waitlisted, waitlisted_max, and date_created
        telebears: telebears dictionary

    Return:
        list of EnrollmentData, highest enrollment percentage, highest waitlist percentage
    """
    enrollment_data = []
    enrolled_outlier = 1.0
    waitlisted_outlier = 1.0
    for data in enrollments:
        model = create_enrollment_data(data, telebears.phase1_start)
        enrollment_data.append(model)

        # outliers
        if model.enrolled_percent > enrolled_outlier:
            enrolled_outlier = model.enrolled_percent
        if model.waitlisted_percent > waitlisted_outlier:
            waitlisted_outlier = model.waitlisted_percent

    return enrollment_data, enrolled_outlier, waitlisted_outlier

def get_telebears(semester, year):
    if semester == CURRENT_SEMESTER and str(year) == CURRENT_YEAR:
        return TelebearData(**TELEBEARS)
    else:
        return TelebearData(**PAST_SEMESTERS_TELEBEARS.get(f'{semester} {year}', {}))


class Query(graphene.ObjectType):
    all_enrollments = graphene.Field(
        EnrollmentInfo,
        section_id = graphene.ID()
    )
    aggregated_enrollment_by_semester = graphene.Field(
        EnrollmentInfo,
        course_id = graphene.ID(),
        semester = graphene.String(),
        year = graphene.Int()
    )

    def resolve_all_enrollments(root, info, section_id):
        section = Section.objects.get(pk = from_global_id(section_id)[1])
        enrollments = section.enrollment_set \
                             .order_by('date_created') \
                             .values(
                                 'date_created',
                                 'enrolled',
                                 'enrolled_max',
                                 'waitlisted',
                                 'waitlisted_max'
                                 )
        

        telebears = get_telebears(section.semester, section.year)

        # convert queryset to graphene models
        models, enrolled_outlier, waitlisted_outlier = queryset_to_enrollment(enrollments, telebears)

        # sis - get real time data
        if section.semester == CURRENT_SEMESTER and str(section.year) == CURRENT_YEAR:
            sis_data = enrollment_service.get_live_enrollment(
                semester=section.semester,
                year=section.year,
                course_id=section.course.id,
                abbreviation=section.course.abbreviation,
                course_number=section.course.course_number,
                ccn=section.ccn
            )[0]

            # update the last data
            models[-1] = create_enrollment_data(sis_data, telebears.phase1_start)

        # get section percentages
        enrolled_max = models[-1].enrolled_max
        enrolled_percent_max = enrolled_outlier * 1.10
        enrolled_scale_max = int(enrolled_max * enrolled_percent_max)
        
        waitlisted_max = models[-1].waitlisted_max
        waitlisted_percent_max = waitlisted_outlier * 1.10
        waitlisted_scale_max = int(waitlisted_max * waitlisted_percent_max)

        return EnrollmentInfo(
            course = section.course,
            section = [section],
            telebears = telebears,
            data = models,
            enrolled_max = enrolled_max,
            enrolled_percent_max = enrolled_percent_max,
            enrolled_scale_max = enrolled_scale_max,
            waitlisted_max = waitlisted_max,
            waitlisted_percent_max = waitlisted_percent_max,
            waitlisted_scale_max = waitlisted_scale_max
        )


    def resolve_aggregated_enrollment_by_semester(root, info, course_id, semester, year):
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

        telebears = get_telebears(semester, year)

        # convert queryset to graphene models
        models, enrolled_outlier, waitlisted_outlier = queryset_to_enrollment(enrollments, telebears)
        
        # sis - get real time data
        if semester == CURRENT_SEMESTER and str(year) == CURRENT_YEAR:
            sis_data = enrollment_service.get_live_enrollment(
                semester=semester,
                year=year,
                course_id=course.id,
                abbreviation=course.abbreviation,
                course_number=course.course_number
            )

            # aggregate over sections
            last_enrolled, last_waitlisted, last_enrolled_max, last_waitlisted_max = 0, 0, 0, 0
            for section in sis_data:
                last_enrolled += section['enrolled']
                last_waitlisted += section['waitlisted']
                last_enrolled_max += section['enrolled_max']
                last_waitlisted_max += section['waitlisted_max']

            # update the last data
            models[-1] = create_enrollment_data({
                'enrolled': last_enrolled,
                'waitlisted': last_waitlisted,
                'enrolled_max': last_enrolled_max,
                'waitlisted_max': last_waitlisted_max,
                'date_created': sis_data[-1]['date_created']
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
            section = sections,
            telebears = telebears,
            data = models,
            enrolled_max = enrolled_max,
            enrolled_percent_max = enrolled_percent_max,
            enrolled_scale_max = enrolled_scale_max,
            waitlisted_max = waitlisted_max,
            waitlisted_percent_max = waitlisted_percent_max,
            waitlisted_scale_max = waitlisted_scale_max
        )
