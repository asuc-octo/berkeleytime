from __future__ import division
import re, os, sys, datetime
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
import traceback
from catalog.models import Course, Grade, Section, Enrollment, Playlist
from catalog.service.resource.schedule import schedule_resource
from catalog.service.course import course_service
from catalog.utils import calculate_letter_average, sort_course_dicts
from catalog.views import catalog_filters
from data.lib.grade import add_up_grades
from berkeleytime.utils.requests import raise_404_on_error, render_to_empty_json, render_to_json, render_to_empty_json_with_status_code
from berkeleytime.settings import (
    TELEBEARS_JSON, TELEBEARS, CURRENT_SEMESTER, CURRENT_YEAR, PAST_SEMESTERS,
    PAST_SEMESTERS_TELEBEARS_JSON, PAST_SEMESTERS_TELEBEARS, TELEBEARS_ALREADY_STARTED)

from django.core.cache import cache
from django.db.models import Avg, Sum
from django.shortcuts import render_to_response
from django.template import RequestContext

from threading import Thread

ENROLLMENT_CACHE_TIMEOUT = 900
CACHE_TIMEOUT = 900
NUM_PREFETCH_THREADS = 3


STANDARD_GRADES = [("a1", "A+"), ("a2", "A"), ("a3", "A-")]


def grade_context(long_form=False):
    cache_key = "grade__courses"
    if long_form:
        cache_key = "grade__courses__long"
    cached = cache.get(cache_key)
    if cached:
        rtn = cached
    else:
        courses = Course.objects.filter(grade__isnull=False).distinct().order_by("abbreviation", "course_number")
        if long_form:
            rtn = courses.values("id", "abbreviation", "course_number", "title")
        else:
            rtn = courses.values("id", "abbreviation", "course_number")
        rtn = sort_course_dicts(rtn)
        cache.set(cache_key, rtn, CACHE_TIMEOUT)
    return {"courses": rtn}

def get_or_zero(d, k):
    if k in d and d[k] is not None:
        return d[k]
    return 0

@raise_404_on_error
def grade_render(request):
    """
    [
        {"id": 2345, "title": "COMPSCI 61B", "subtitle": "Data Structures"},
        {"id": 3425, "title": "MCELLBI 32", "subtitle": "Introduction to Human Physiology"},
    ]
    """
    return render_to_response("data/grades.html", grade_context(), context_instance=RequestContext(request))

def grade_context_json(request):
    return render_to_json(grade_context(long_form=request.GET.get('form', 'short') == "long"))

def year_and_semester_to_value(s):
    """
    Assigns a number to a section dict (see grade_section_json for format). Is used to
    sort a list of sections by time.
    """
    if s['semester'] == 'spring':
        sem = 0
    elif s['semester'] == 'fall':
        sem = 2
    else:
        sem = 1
    return 3*int(s['year']) + sem

def grade_section_json(request, course_id):
    """
    {"instructor": "Shewchuk", "semester": "spring", "year": 2012, "section_number": "003", "grade_id": 1533}
    """
    try:
        cached = cache.get("grade_section_json " + str(course_id))
        if cached:
            print("Cache Hit in grade_section_json course_id " + course_id)
            return render_to_json(cached)
        sections = [
            {
                "instructor": entry.instructor,
                "semester": entry.semester,
                "year": entry.year,
                "section_number": entry.section_number,
                "grade_id": entry.id,
            } for entry in Grade.objects.filter(course__id=int(course_id), total__gte = 1)
        ]
        sections = sorted(sections, key=year_and_semester_to_value, reverse=True)
        cache.set("grade_section_json " + str(course_id), sections, CACHE_TIMEOUT)
        return render_to_json(sections)
    except Exception as e:
        print e
        return render_to_empty_json_with_status_code(500)

def grade_json(request, grade_ids):
    try:
        cached = cache.get("grade_json " + str(grade_ids))
        if cached:
            print("Cache Hit in grade_json " + grade_ids)
            return render_to_json(cached)
        actual_total = 0
        rtn = {}
        grade_ids = grade_ids.split("&")
        sections = Grade.objects.filter(id__in=grade_ids)
        course = Course.objects.get(id=sections.values_list("course", flat=True)[0])
        total = sections.aggregate(Sum("total"))["total__sum"]
        percentile_total = total - get_or_zero(sections.aggregate(Sum('p')), "p__sum")
        percentile_total -= get_or_zero(sections.aggregate(Sum('np')), "np__sum")
        
        percentile_ceiling = 0
        total_unweighted = 0
        for grade, display in STANDARD_GRADES:
            grade_entry = {}
            if grade == "d":
                numerator = sum([get_or_zero(sections.aggregate(Sum(d)), d + "__sum") for d in ("d1", "d2", "d3")])
            else:
                numerator = get_or_zero(sections.aggregate(Sum(grade)), grade + "__sum")
            actual_total += numerator
            percent = numerator / percentile_total if percentile_total > 0 else 0.0
            grade_entry["percent"] = round(percent, 2)
            grade_entry["numerator"] = numerator
            if grade == 'p' or grade == 'np':
                grade_entry["percentile_high"] = 0
                grade_entry["percentile_low"] = 0
                total_unweighted += numerator
            else:
                grade_entry["percentile_high"] = abs(round(1.0 - percentile_ceiling, 2))
                grade_entry["percentile_low"] = abs(round(1.0 - percentile_ceiling - percent, 2))
            percentile_ceiling += percent
            rtn[display] = grade_entry
        rtn["course_id"] = course.id
        rtn["title"] = course.abbreviation + " " + course.course_number
        rtn["subtitle"] = course.title
        rtn["course_gpa"] = round(course.grade_average, 3)
        rtn["course_letter"] = course.letter_average
        weighted_letter_grade_counter, total = add_up_grades(sections)
        if total == 0:
            rtn["section_gpa"] = -1
            rtn["section_letter"] = "N/A"
        else:
            rtn["section_gpa"] = round(float(sum(weighted_letter_grade_counter.values())) / total, 3)
            rtn["section_letter"] = calculate_letter_average(rtn["section_gpa"])
        rtn["denominator"] = total + total_unweighted

        if rtn["course_letter"] == "":
            rtn["course_letter"] = "N/A"

        if rtn["section_letter"] == "":
            rtn["section_letter"] = "N/A"

        cache.set("grade_json" + str(grade_ids), rtn, CACHE_TIMEOUT)
        return render_to_json(rtn)
    except Exception as e:
        print e
        return render_to_empty_json()

def enrollment_context(long_form=False):
    cache_key = "enrollment__courses"
    if long_form:
        cache_key = "enrollment__courses__long"
    cached = cache.get(cache_key)
    if cached:
        rtn = cached
    else:
        # TODO (Yuxin) This query was used prior to 8/3/2016
        # This tries to only return courses with correspoding Enrollment objects
        # but this was crashing the site since the Enrollment table is > 10^7 rows

        # courses = (Section.objects.filter(disabled=False, enrollment__isnull=False)
        #     .prefetch_related("course")
        #     .distinct("course")
        #     .values("course__id", "course__course_number", "course__abbreviation"))
        # rtn = [{
        #     "abbreviation": course["course__abbreviation"],
        #     "id": course["course__id"],
        #     "course_number": course["course__course_number"]
        # } for course in courses]

        # The following query is less exact and returns lots of Courses with no
        # enrollment objects
        courses = Course.objects.filter(has_enrollment=True).distinct().order_by("abbreviation", "course_number")
        if long_form:
            rtn = courses.values("id", "abbreviation", "course_number", "title")
        else:
            rtn = courses.values("id", "abbreviation", "course_number")
        rtn = sort_course_dicts(rtn)

        cache.set(cache_key, rtn, ENROLLMENT_CACHE_TIMEOUT)
    return {"courses": rtn}

@raise_404_on_error
def enrollment_render(request):
    # TODO (Yuxin): Not sure if the following query is correct for enrollment, need to show courses with sections this semester
    # courses = Course.objects.exclude(primary_kind=None).filter(
    #     section__isnull=False, section__enrollment__isnull=False
    # ).distinct().order_by("abbreviation", "course_number")
    # ------
    # courses = list(Enrollment.objects.filter(section__disabled=False)
    #     .prefetch_related("section__course")
    #     .distinct("section__course")
    #     .values("section__course__id", "section__course__abbreviation", "section__course__course_number"))
    return render_to_response("data/enrollment.html", enrollment_context(), context_instance=RequestContext(request))

def enrollment_context_json(request):
    return render_to_json(enrollment_context(long_form=request.GET.get('form', 'short') == "long"))

def get_primary(course_id, semester, year, context_cache=None):
    try:
        if context_cache and course_id in context_cache:
            all_sections = context_cache[course_id]
        else:
            course = Course.objects.get(id = course_id)
            all_sections = course.section_set.all()
            context_cache[course_id] = all_sections
        sections = all_sections.filter(semester = semester, year = year, disabled = False, is_primary = True).order_by("rank").prefetch_related('enrollment_set')
        return sections
    except Exception as e:
        print e
        return []


def enrollment_section_render(request, course_id):
    try:
        cached = cache.get("enrollment_section_render " + course_id)
        if cached:
            print('Cache Hit in enrollment_section_render with course_id ' + course_id)
            prefetch(course_id)
            return render_to_json(cached)
        rtn = []
        context_cache = {}
        sections = get_primary(course_id, CURRENT_SEMESTER, CURRENT_YEAR, context_cache)
        # DONT INCLUDE CURRENT SEMESTER IF NOT YET TELEBEARS
        if sections and TELEBEARS_ALREADY_STARTED:
            current = {"semester": CURRENT_SEMESTER, "year": CURRENT_YEAR, "sections": []}
            for s in sections:
                if s.enrollment_set.all():
                    temp = {}
                    temp["section_number"] = s.section_number
                    temp["section_id"] = s.id
                    temp["instructor"] = s.instructor
                    current["sections"].append(temp)
            if current["sections"]:
                rtn.append(current)
        # REFACTOR THIS
        ordered_past_semesters = PAST_SEMESTERS[:]
        ordered_past_semesters.reverse()
        for s in ordered_past_semesters:
            past_sections = get_primary(course_id, s["semester"], s["year"], context_cache)
            if past_sections:
                current = {"semester": s["semester"], "year": s["year"], "sections": []}
                for s in past_sections:
                    if s.enrollment_set.all():
                        temp = {}
                        temp["section_number"] = s.section_number
                        temp["section_id"] = s.id
                        temp["instructor"] = s.instructor
                        current["sections"].append(temp)
                if current["sections"]:
                    rtn.append(current)
        cache.set("enrollment_section_render " + str(course_id), rtn, CACHE_TIMEOUT)
        prefetch(course_id)
        return render_to_json(rtn)
    except Exception as e:
        print e
        return render_to_empty_json()

def enrollment_aggregate_json(request, course_id, semester = CURRENT_SEMESTER, year = CURRENT_YEAR):
    try:
        cached = cache.get("enrollment_aggregate_json " + str(course_id) + semester + str(year))
        if cached:
            print('Cache Hit in enrollment_aggregate_json with course_id  ' + course_id + ' semester ' + semester
                  + ' year ' + year)
            return render_to_json(cached)
        rtn = {}
        course = Course.objects.get(id = course_id)
        all_sections = course.section_set.all().filter(semester = semester, year = year, disabled = False)
        sections = all_sections.filter(is_primary = True ).order_by("rank")
        if sections:
            rtn["course_id"] = course.id
            rtn["section_id"] = "all"
            rtn["title"] = course.abbreviation + " " + course.course_number
            rtn["subtitle"] = course.title
            rtn["section_name"] = "All Sections"

            new_sections = None
            if semester != CURRENT_SEMESTER or year != CURRENT_YEAR:
                CORRECTED_TELEBEARS_JSON = PAST_SEMESTERS_TELEBEARS_JSON[semester + " " + year]
                CORRECTED_TELEBEARS = PAST_SEMESTERS_TELEBEARS[semester + " " + year]
            else:
                CORRECTED_TELEBEARS_JSON = TELEBEARS_JSON
                CORRECTED_TELEBEARS = TELEBEARS
                schedules = schedule_resource.get(
                    semester=semester,
                    year=year,
                    course_id=course_id,
                    abbreviation=course.abbreviation,
                    course_number=course.course_number,
                    log=True,
                )
                new_sections = [x.enrollment._initial for x in schedules if x.section._initial["is_primary"] and not x.section._initial["disabled"]]

            rtn["telebears"] = CORRECTED_TELEBEARS_JSON #THIS NEEDS TO BE FROM THE OTHER SEMESTER, NOT THE CURRENT SEMESTER
            rtn["telebears"]["semester"] = semester.capitalize() + " " + year
            last_date = sections[0].enrollment_set.all().latest("date_created").date_created
            enrolled_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum("enrolled_max"))["enrolled_max__sum"]
            waitlisted_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum("waitlisted_max"))["waitlisted_max__sum"]
            rtn["enrolled_max"] = enrolled_max
            rtn["waitlisted_max"] = waitlisted_max
            dates = {d: [0, 0] for d in sections[0].enrollment_set.all().values_list("date_created", flat = True)}
            for s in sections:
                enrollment = s.enrollment_set.filter(date_created__gte=CORRECTED_TELEBEARS["phase1_start"]).order_by("date_created")
                for (d, enrolled, waitlisted) in enrollment.values_list("date_created", "enrolled", "waitlisted"):
                    if d in dates:
                        dates[d][0] += enrolled
                        dates[d][1] += waitlisted

            rtn['data'] = []
            for d in sorted(dates.items(), key=lambda date_enrollment_data_pair: date_enrollment_data_pair[0]):
                curr_d = {}
                curr_d["enrolled"] = d[1][0]
                curr_d["waitlisted"] = d[1][1]
                curr_d["day"] = (d[0] - CORRECTED_TELEBEARS["phase1_start"]).days + 1
                curr_d["date"] = (d[0]).strftime("%m/%d/%Y-%H:%M:%S")
                curr_enrolled_max = Enrollment.objects.filter(section__in = sections, date_created=d[0]).aggregate(Sum("enrolled_max"))["enrolled_max__sum"]
                curr_d["enrolled_max"] = curr_enrolled_max
                curr_waitlisted_max = Enrollment.objects.filter(section__in=sections, date_created=d[0]).aggregate(Sum("waitlisted_max"))["waitlisted_max__sum"]
                curr_d["waitlisted_max"] = curr_waitlisted_max
                curr_d["enrolled_percent"] = round(d[1][0] / curr_enrolled_max, 3) if curr_enrolled_max else -1
                curr_d["waitlisted_percent"] = round(d[1][1] / curr_waitlisted_max, 3) if curr_waitlisted_max else -1
                rtn["data"].append(curr_d)

            if semester == CURRENT_SEMESTER and year == CURRENT_YEAR:
                last_enrolled = sum([s["enrolled"] for s in new_sections])
                last_waitlisted = sum([s["waitlisted"] for s in new_sections])
                enrolled_max = sum([s["enrolled_max"] for s in new_sections])
                waitlisted_max = sum([s["waitlisted_max"] for s in new_sections])
                rtn["data"][-1]["enrolled"] = last_enrolled
                rtn["data"][-1]["waitlisted"] = last_waitlisted
                rtn["data"][-1]["enrolled_percent"] = round(last_enrolled / enrolled_max, 3) if enrolled_max else -1
                rtn["data"][-1]["waitlisted_percent"] = round(last_waitlisted / waitlisted_max, 3) if waitlisted_max else -1
                rtn["data"][-1]["enrolled_max"] = enrolled_max
                rtn["data"][-1]["waitlisted_max"] = waitlisted_max
                rtn["enrolled_max"] = enrolled_max
                rtn["waitlisted_max"] = waitlisted_max

            enrolled_outliers = [d["enrolled_percent"] for d in rtn["data"] if d["enrolled_percent"] >= 1.0]
            rtn["enrolled_percent_max"] = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
            waitlisted_outliers = [d["waitlisted_percent"] for d in rtn["data"] if d["waitlisted_percent"] >= 1.0]
            rtn["waitlisted_percent_max"] = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
            rtn["enrolled_scale_max"] = int(rtn["enrolled_percent_max"] * rtn["enrolled_max"])
            rtn["waitlisted_scale_max"] = int(rtn["waitlisted_percent_max"] * rtn["waitlisted_max"])

            cache.set("enrollment_aggregate_json " + str(course_id) + semester + str(year), rtn, ENROLLMENT_CACHE_TIMEOUT)
            rtn = render_to_json(rtn)

        return rtn
    except Exception as e:
        print e
        return render_to_empty_json()


def prefetch(course_id):
    t1 = Thread(target=enrollment_aggregate_json, args=[None, course_id])
    t1.start()


def enrollment_json(request, section_id):
    try:
        cached = cache.get("enrollment_json" + str(section_id))
        if cached:
            print("Cache Hit in enrollment_json with section_id " + section_id)
            return render_to_json(cached)
        rtn = {}
        section = Section.objects.get(id=section_id)
        course = section.course
        rtn["course_id"] = course.id
        rtn["section_id"] = section.id
        rtn["title"] = course.abbreviation + " " + course.course_number
        rtn["subtitle"] = course.title
        if section.instructor == "" or section.instructor is None:
            section.instructor = "No Instructor Assigned"
        rtn["section_name"] = section.instructor + " - " + section.section_number

        semester = section.semester
        year = section.year
        if semester != CURRENT_SEMESTER or year != CURRENT_YEAR:
            CORRECTED_TELEBEARS_JSON = PAST_SEMESTERS_TELEBEARS_JSON[semester + " " + year]
            CORRECTED_TELEBEARS = PAST_SEMESTERS_TELEBEARS[semester + " " + year]
        else:
            CORRECTED_TELEBEARS_JSON = TELEBEARS_JSON
            CORRECTED_TELEBEARS = TELEBEARS
            schedules = schedule_resource.get(
                semester=semester,
                year=year,
                course_id=course.id,
                abbreviation=course.abbreviation,
                course_number=course.course_number,
                log=True,
            )
            new_section = [x.enrollment._initial for x in schedules if x.section['ccn'] == section.ccn][0]

        rtn["telebears"] = CORRECTED_TELEBEARS_JSON
        enrolled_max = section.enrollment_set.all().latest("date_created").enrolled_max
        waitlisted_max = section.enrollment_set.all().latest("date_created").waitlisted_max
        rtn["enrolled_max"] = enrolled_max
        rtn["waitlisted_max"] = waitlisted_max

        rtn["data"] = []
        for d in section.enrollment_set.all().filter(date_created__gte=CORRECTED_TELEBEARS["phase1_start"]).order_by("date_created"):
            curr_d = {}
            curr_d["enrolled"] = d.enrolled
            curr_d["waitlisted"] = d.waitlisted
            curr_d["enrolled_max"] = enrolled_max
            curr_waitlisted_max = section.enrollment_set.all().latest("date_created").waitlisted_max
            curr_d["waitlisted_max"] = curr_waitlisted_max
            curr_d["day"] = (d.date_created - CORRECTED_TELEBEARS["phase1_start"]).days + 1
            curr_d["date"] = (d.date_created).strftime("%m/%d/%Y-%H:%M:%S")
            curr_d["enrolled_percent"] = round(d.enrolled / enrolled_max, 3) if enrolled_max else -1
            curr_d["waitlisted_percent"] = round(d.waitlisted / curr_waitlisted_max, 3) if curr_waitlisted_max else -1
            rtn["data"].append(curr_d)


        if semester == CURRENT_SEMESTER and year == CURRENT_YEAR:
            last_enrolled = new_section["enrolled"]
            last_waitlisted = new_section["waitlisted"]
            enrolled_max = new_section["enrolled_max"]
            waitlisted_max = new_section["waitlisted_max"]
            rtn["data"][-1]["enrolled"] = last_enrolled
            rtn["data"][-1]["waitlisted"] = last_waitlisted
            rtn["data"][-1]["enrolled_percent"] = round(last_enrolled / enrolled_max, 3) if enrolled_max else -1
            rtn["data"][-1]["waitlisted_percent"] = round(last_waitlisted / waitlisted_max, 3) if waitlisted_max else -1
            rtn["data"][-1]["enrolled_max"] = enrolled_max
            rtn["data"][-1]["waitlisted_max"] = waitlisted_max
            rtn["enrolled_max"] = enrolled_max
            rtn["waitlisted_max"] = waitlisted_max

        rtn["instructor"] = section.instructor
        enrolled_outliers = [d["enrolled_percent"] for d in rtn["data"] if d["enrolled_percent"] >= 1.0]
        rtn["enrolled_percent_max"] = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
        waitlisted_outliers = [d["waitlisted_percent"] for d in rtn["data"] if d["waitlisted_percent"] >= 1.0]
        rtn["waitlisted_percent_max"] = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
        rtn["enrolled_scale_max"] = int(rtn["enrolled_percent_max"] * rtn["enrolled_max"])
        rtn["waitlisted_scale_max"] = int(rtn["waitlisted_percent_max"] * rtn["enrolled_max"])

        cache.set("enrollment_json" + str(section_id), rtn, ENROLLMENT_CACHE_TIMEOUT)
        rtn = render_to_json(rtn)

        return rtn
    except Exception as e:
        print e
        return render_to_empty_json()

def catalog_context_json(request, abbreviation='', course_number=''):
    long_form = request.GET.get('form', 'short') == "long"
    cache_key = "all__courses"
    if long_form:
        cache_key = "all__courses__long"
    cached = cache.get(cache_key)
    if cached:
        rtn = cached
    else:
        courses = Course.objects.distinct().order_by("abbreviation", "course_number")
        if long_form:
            rtn = courses.values("id", "abbreviation", "course_number", "title")
        else:
            rtn = courses.values("id", "abbreviation", "course_number")
        rtn = sort_course_dicts(rtn)
        cache.set(cache_key, rtn, CACHE_TIMEOUT)
    return render_to_json({"courses": rtn})

def catalog_filters_json(request, abbreviation='', course_number=''):
    """Return JSON of filters for the catalog page."""
    filters = catalog_filters(request, abbreviation=abbreviation, course_number=course_number)
    playlist_type = type(Playlist.objects.all())

    for playlist in filters:
        if type(filters[playlist]) == playlist_type:
            filters[playlist] = map(lambda x: x.as_json(), filters[playlist])

    filters['department'].insert(0, {
        'category': 'department',
        'name': '-',
        'id': -1,
    })

    filters['semester'] = sorted(filters['semester'], key=lambda x: x['id'], reverse=True)

    return render_to_json(filters)
