from threading import Thread
import traceback

from django.core.cache import cache
from django.db.models import Sum

from berkeleytime.utils import render_to_json, render_to_empty_json
from berkeleytime.settings import (
    CURRENT_SEMESTER,
    CURRENT_YEAR,
    PAST_SEMESTERS,
    PAST_SEMESTERS_TELEBEARS,
    PAST_SEMESTERS_TELEBEARS_JSON,
    TELEBEARS_JSON,
    TELEBEARS,
    TELEBEARS_ALREADY_STARTED,
)
from catalog.models import Course, Section
from catalog.utils import sort_course_dicts
from enrollment.models import Enrollment
from enrollment.service import enrollment_service

CACHE_TIMEOUT = 900


# /enrollment/enrollment_json/
def enrollment_context(long_form=False):
    cache_key = 'enrollment__courses_new'
    if long_form:
        cache_key = 'enrollment__courses__long_new'
    cached = cache.get(cache_key)
    if cached:
        rtn = cached
    else:
        courses = Course.objects.exclude(section__isnull=True).order_by('abbreviation', 'course_number')
        if long_form:
            rtn = courses.values('id', 'abbreviation', 'course_number', 'title')
        else:
            rtn = courses.values('id', 'abbreviation', 'course_number')
        rtn = sort_course_dicts(rtn)

        cache.set(cache_key, rtn, CACHE_TIMEOUT)
    return {'courses': rtn}

def enrollment_context_json(request):
    return render_to_json(enrollment_context(long_form=request.GET.get('form', 'short') == 'long'))


# /enrollment/sections/
def prefetch(course_id):
    Thread(target=enrollment_aggregate_json, args=[None, course_id]).start()

def enrollment_section_render(request, course_id):
    try:
        cached = cache.get('enrollment_section_render_new ' + course_id)
        if cached:
            print('Cache Hit in enrollment_section_render with course_id ' + course_id)
            prefetch(course_id)
            return render_to_json(cached)
        semesters = {}
        if TELEBEARS_ALREADY_STARTED:
            semesters[(CURRENT_SEMESTER, CURRENT_YEAR)] = 0
        for sem in reversed(PAST_SEMESTERS):
            semesters[(sem['semester'], sem['year'])] = len(semesters)

        all_sections = Section.objects.filter(
            course_id=course_id,
            disabled=False,
            is_primary=True,
        )

        sem_to_sections = {}
        for sect in all_sections:
            if sect.enrolled is None or (sect.semester, sect.year) not in semesters:
                continue

            if (sect.semester, sect.year) not in sem_to_sections:
                sem_to_sections[(sect.semester, sect.year)] = {
                    'semester': sect.semester, 'year': sect.year, 'sections': []
                }

            sem_to_sections[(sect.semester, sect.year)]['sections'].append(
                {
                    'section_number': sect.section_number,
                    'section_id': sect.id,
                    'instructor': sect.instructor,
                }
            )

        rtn = sorted(sem_to_sections.values(), key=lambda sect: semesters[(sect['semester'], sect['year'])])

        cache.set('enrollment_section_render_new ' + str(course_id), rtn, CACHE_TIMEOUT)
        prefetch(course_id)
        return render_to_json(rtn)
    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json()


# /enrollment/aggregate/
def enrollment_aggregate_json(request, course_id, semester=CURRENT_SEMESTER, year=CURRENT_YEAR):
    try:
        cached = cache.get('enrollment_aggregate_json_new ' + str(course_id) + semester + str(year))
        if cached:
            print('Cache Hit in enrollment_aggregate_json with course_id  ' + course_id + ' semester ' + semester
                  + ' year ' + year)
            return render_to_json(cached)
        rtn = {}
        course = Course.objects.get(id = course_id)
        sections = course.section_set.all().filter(semester=semester, year=year, disabled=False, is_primary=True)
        if sections:
            rtn['course_id'] = course.id
            rtn['section_id'] = 'all'
            rtn['title'] = course.abbreviation + ' ' + course.course_number
            rtn['subtitle'] = course.title
            rtn['section_name'] = 'All Sections'

            new_sections = None
            if semester != CURRENT_SEMESTER or year != CURRENT_YEAR:
                CORRECTED_TELEBEARS_JSON = PAST_SEMESTERS_TELEBEARS_JSON[semester + ' ' + year]
                CORRECTED_TELEBEARS = PAST_SEMESTERS_TELEBEARS[semester + ' ' + year]
            else:
                CORRECTED_TELEBEARS_JSON = TELEBEARS_JSON
                CORRECTED_TELEBEARS = TELEBEARS
                try:
                    new_sections = enrollment_service.get_live_enrollment(
                        semester=semester,
                        year=year,
                        course_id=course_id,
                        abbreviation=course.abbreviation,
                        course_number=course.course_number,
                        log=True,
                    )
                except:
                    print('SIS did not return valid live enrollment')

            rtn['telebears'] = CORRECTED_TELEBEARS_JSON #THIS NEEDS TO BE FROM THE OTHER SEMESTER, NOT THE CURRENT SEMESTER
            rtn['telebears']['semester'] = semester.capitalize() + ' ' + year
            last_date = sections[0].enrollment_set.all().latest('date_created').date_created
            enrolled_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum('enrolled_max'))['enrolled_max__sum']
            waitlisted_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum('waitlisted_max'))['waitlisted_max__sum']
            rtn['enrolled_max'] = enrolled_max
            rtn['waitlisted_max'] = waitlisted_max
            dates = {d: [0, 0] for d in sections[0].enrollment_set.all().values_list('date_created', flat = True)}
            for s in sections:
                enrollment = s.enrollment_set.filter(date_created__gte=CORRECTED_TELEBEARS['phase1_start']).order_by('date_created')
                for (d, enrolled, waitlisted) in enrollment.values_list('date_created', 'enrolled', 'waitlisted'):
                    if d in dates:
                        dates[d][0] += enrolled
                        dates[d][1] += waitlisted

            rtn['data'] = []
            for d in sorted(dates.items(), key=lambda date_enrollment_data_pair: date_enrollment_data_pair[0]):
                curr_d = {}
                curr_d['enrolled'] = d[1][0]
                curr_d['waitlisted'] = d[1][1]
                curr_d['day'] = (d[0] - CORRECTED_TELEBEARS['phase1_start']).days + 1
                curr_d['date'] = (d[0]).strftime('%m/%d/%Y-%H:%M:%S')
                curr_enrolled_max = Enrollment.objects.filter(section__in = sections, date_created=d[0]).aggregate(Sum('enrolled_max'))['enrolled_max__sum']
                curr_d['enrolled_max'] = curr_enrolled_max
                curr_waitlisted_max = Enrollment.objects.filter(section__in=sections, date_created=d[0]).aggregate(Sum('waitlisted_max'))['waitlisted_max__sum']
                curr_d['waitlisted_max'] = curr_waitlisted_max
                curr_d['enrolled_percent'] = round(d[1][0] / curr_enrolled_max, 3) if curr_enrolled_max else -1
                curr_d['waitlisted_percent'] = round(d[1][1] / curr_waitlisted_max, 3) if curr_waitlisted_max else -1
                rtn['data'].append(curr_d)

            if semester == CURRENT_SEMESTER and year == CURRENT_YEAR and new_sections is not None:
                last_enrolled = sum([s['enrolled'] for s in new_sections])
                last_waitlisted = sum([s['waitlisted'] for s in new_sections])
                enrolled_max = sum([s['enrolled_max'] for s in new_sections])
                waitlisted_max = sum([s['waitlisted_max'] for s in new_sections])
                rtn['data'][-1]['enrolled'] = last_enrolled
                rtn['data'][-1]['waitlisted'] = last_waitlisted
                rtn['data'][-1]['enrolled_percent'] = round(last_enrolled / enrolled_max, 3) if enrolled_max else -1
                rtn['data'][-1]['waitlisted_percent'] = round(last_waitlisted / waitlisted_max, 3) if waitlisted_max else -1
                rtn['data'][-1]['enrolled_max'] = enrolled_max
                rtn['data'][-1]['waitlisted_max'] = waitlisted_max
                rtn['enrolled_max'] = enrolled_max
                rtn['waitlisted_max'] = waitlisted_max

            enrolled_outliers = [d['enrolled_percent'] for d in rtn['data'] if d['enrolled_percent'] >= 1.0]
            rtn['enrolled_percent_max'] = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
            waitlisted_outliers = [d['waitlisted_percent'] for d in rtn['data'] if d['waitlisted_percent'] >= 1.0]
            rtn['waitlisted_percent_max'] = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
            rtn['enrolled_scale_max'] = int(rtn['enrolled_percent_max'] * rtn['enrolled_max'])
            rtn['waitlisted_scale_max'] = int(rtn['waitlisted_percent_max'] * rtn['waitlisted_max'])

            cache.set('enrollment_aggregate_json_new ' + str(course_id) + semester + str(year), rtn, CACHE_TIMEOUT)
            rtn = render_to_json(rtn)

        return rtn
    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json()


# /enrollment/data/
def enrollment_json(request, section_id):
    try:
        cached = cache.get('enrollment_json_new' + str(section_id))
        if cached:
            print('Cache Hit in enrollment_json with section_id ' + section_id)
            return render_to_json(cached)
        rtn = {}
        section = Section.objects.get(id=section_id)
        course = section.course
        rtn['course_id'] = course.id
        rtn['section_id'] = section.id
        rtn['title'] = course.abbreviation + ' ' + course.course_number
        rtn['subtitle'] = course.title
        if section.instructor == '' or section.instructor is None:
            section.instructor = 'No Instructor Assigned'
        rtn['section_name'] = section.instructor + ' - ' + section.section_number

        semester = section.semester
        year = section.year
        new_section = None
        if semester != CURRENT_SEMESTER or year != CURRENT_YEAR:
            CORRECTED_TELEBEARS_JSON = PAST_SEMESTERS_TELEBEARS_JSON[semester + ' ' + year]
            CORRECTED_TELEBEARS = PAST_SEMESTERS_TELEBEARS[semester + ' ' + year]
        else:
            CORRECTED_TELEBEARS_JSON = TELEBEARS_JSON
            CORRECTED_TELEBEARS = TELEBEARS
            try:
                new_section = enrollment_service.get_live_enrollment(
                    semester=semester,
                    year=year,
                    course_id=course.id,
                    abbreviation=course.abbreviation,
                    course_number=course.course_number,
                    ccn=section.ccn,
                    log=True,
                )[0]
            except:
                print('SIS did not return valid live enrollment')

        rtn['telebears'] = CORRECTED_TELEBEARS_JSON
        enrolled_max = section.enrollment_set.all().latest('date_created').enrolled_max
        waitlisted_max = section.enrollment_set.all().latest('date_created').waitlisted_max
        rtn['enrolled_max'] = enrolled_max
        rtn['waitlisted_max'] = waitlisted_max

        rtn['data'] = []
        for d in section.enrollment_set.all().filter(date_created__gte=CORRECTED_TELEBEARS['phase1_start']).order_by('date_created'):
            curr_d = {}
            curr_d['enrolled'] = d.enrolled
            curr_d['waitlisted'] = d.waitlisted
            curr_d['enrolled_max'] = enrolled_max
            curr_waitlisted_max = section.enrollment_set.all().latest('date_created').waitlisted_max
            curr_d['waitlisted_max'] = curr_waitlisted_max
            curr_d['day'] = (d.date_created - CORRECTED_TELEBEARS['phase1_start']).days + 1
            curr_d['date'] = (d.date_created).strftime('%m/%d/%Y-%H:%M:%S')
            curr_d['enrolled_percent'] = round(d.enrolled / enrolled_max, 3) if enrolled_max else -1
            curr_d['waitlisted_percent'] = round(d.waitlisted / curr_waitlisted_max, 3) if curr_waitlisted_max else -1
            rtn['data'].append(curr_d)


        if semester == CURRENT_SEMESTER and year == CURRENT_YEAR and new_section is not None:
            last_enrolled = new_section['enrolled']
            last_waitlisted = new_section['waitlisted']
            enrolled_max = new_section['enrolled_max']
            waitlisted_max = new_section['waitlisted_max']
            rtn['data'][-1]['enrolled'] = last_enrolled
            rtn['data'][-1]['waitlisted'] = last_waitlisted
            rtn['data'][-1]['enrolled_percent'] = round(last_enrolled / enrolled_max, 3) if enrolled_max else -1
            rtn['data'][-1]['waitlisted_percent'] = round(last_waitlisted / waitlisted_max, 3) if waitlisted_max else -1
            rtn['data'][-1]['enrolled_max'] = enrolled_max
            rtn['data'][-1]['waitlisted_max'] = waitlisted_max
            rtn['enrolled_max'] = enrolled_max
            rtn['waitlisted_max'] = waitlisted_max

        rtn['instructor'] = section.instructor
        enrolled_outliers = [d['enrolled_percent'] for d in rtn['data'] if d['enrolled_percent'] >= 1.0]
        rtn['enrolled_percent_max'] = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
        waitlisted_outliers = [d['waitlisted_percent'] for d in rtn['data'] if d['waitlisted_percent'] >= 1.0]
        rtn['waitlisted_percent_max'] = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
        rtn['enrolled_scale_max'] = int(rtn['enrolled_percent_max'] * rtn['enrolled_max'])
        rtn['waitlisted_scale_max'] = int(rtn['waitlisted_percent_max'] * rtn['enrolled_max'])

        cache.set('enrollment_json_new' + str(section_id), rtn, CACHE_TIMEOUT)
        rtn = render_to_json(rtn)

        return rtn
    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json()
