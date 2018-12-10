from __future__ import division
import re, os, sys, datetime
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from django.shortcuts import render_to_response
from django.http import HttpResponse, Http404
from django.template import RequestContext
from catalog.models import Course, Grade, Section, Enrollment
from catalog.utils import calculate_letter_average, sort_course_dicts
from berkeleytime.utils.requests import raise_404_on_error, render_to_empty_json, render_to_json

from berkeleytime.settings import (
    TELEBEARS_JSON, TELEBEARS, CURRENT_SEMESTER, CURRENT_YEAR, PAST_SEMESTERS,
    PAST_SEMESTERS_TELEBEARS_JSON, PAST_SEMESTERS_TELEBEARS, TELEBEARS_ALREADY_STARTED)

from django.db.models import Avg, Sum

import urllib2, ssl
from bs4 import BeautifulSoup
from django.core.cache import cache

STANDARD_GRADES = [("a1", "A+"), ("a2", "A"), ("a3", "A-"),
                   ("b1", "B+"), ("b2", "B"), ("b3", "B-"),
                   ("c1", "C+"), ("c2", "C"), ("c3", "C-"),
                   ("d", "D"), ("f", "F"), ("p", "P"), ("np", "NP")]

def grade_context():
    cached = cache.get("grade__courses")
    if cached:
        rtn = cached
        print "Cache Hit in Grades"
    else:
        courses = Course.objects.filter(grade__isnull=False).distinct().order_by("abbreviation", "course_number")
        rtn = courses.values("id", "abbreviation", "course_number")
        cache.set("grade__courses", rtn, 86400)
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

def grade_section_json(request, course_id):
    """
    {"instructor": "Shewchuk", "semester": "spring", "year": 2012, "section_number": "003", "grade_id": 1533}
    """
    try:
        sections = [
            {
                "instructor": entry.instructor,
                "semester": entry.semester,
                "year": entry.year,
                "section_number": entry.section_number,
                "grade_id": entry.id,
            } for entry in Grade.objects.filter(course__id=int(course_id), total__gte = 1)
        ]
        return render_to_json(sections)
    except Exception as e:
        print e
        return render_to_empty_json()


def grade_json(request, grade_ids):
    try:
        actual_total = 0
        rtn = {}
        grade_ids = grade_ids.split("&")
        sections = Grade.objects.filter(id__in=grade_ids)
        course = Course.objects.get(id=sections.values_list("course", flat=True)[0])
        total = sections.aggregate(Sum("total"))["total__sum"]
        percentile_ceiling = 0
        print(sections.aggregate(Sum("p")))
        for grade, display in STANDARD_GRADES:
            grade_entry = {}
            if grade == "d":
                numerator = sum([get_or_zero(sections.aggregate(Sum(d)), d + "__sum") for d in ("d1", "d2", "d3")])
            else:
                numerator = get_or_zero(sections.aggregate(Sum(grade)), grade + "__sum")
            actual_total += numerator
            percent = numerator / total if total != 0 else 0.0
            grade_entry["percent"] = round(percent, 2)
            grade_entry["numerator"] = numerator
            grade_entry["percentile_high"] = abs(round(1.0 - percentile_ceiling, 2))
            grade_entry["percentile_low"] = abs(round(1.0 - percentile_ceiling - percent, 2))
            percentile_ceiling += percent
            rtn[display] = grade_entry
        rtn["course_id"] = course.id
        rtn["title"] = course.abbreviation + " " + course.course_number
        rtn["subtitle"] = course.title
        rtn["course_gpa"] = round(course.grade_average, 3)
        rtn["course_letter"] = course.letter_average
        rtn["section_gpa"] = round(sections.aggregate(Avg("average"))["average__avg"], 3)
        rtn["section_letter"] = calculate_letter_average(rtn["section_gpa"])
        rtn["denominator"] = total

        if rtn["course_letter"] == "":
            rtn["course_letter"] = "N/A"

        if rtn["section_letter"] == "":
            rtn["section_letter"] = "N/A"

        return render_to_json(rtn)
    except NameError as e:
        print e
        return render_to_empty_json()

def enrollment_context():
    cached = cache.get("enrollment__courses")
    if cached:
        print "Cache Hit in Enrollment"
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
        rtn = Course.objects.filter(has_enrollment=True).values('id', 'abbreviation', 'course_number')
        rtn = sort_course_dicts(rtn)


        cache.set("enrollment__courses", rtn, 86400)
    return {"courses": rtn, "telebears": TELEBEARS_JSON}

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

def get_primary(course_id, semester, year):
    try:
        course = Course.objects.get(id = course_id)
        all_sections = course.section_set.all().filter(semester = semester, year = year, disabled = False)
        sections = all_sections.filter(is_primary = True).order_by("rank")
        return sections
    except Exception as e:
        print e
        return []

def enrollment_section_render(request, course_id):
    try:
        rtn = []
        sections = get_primary(course_id, CURRENT_SEMESTER, CURRENT_YEAR)
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
            past_sections = get_primary(course_id, s["semester"], s["year"])
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
        return render_to_json(rtn)
    except Exception as e:
        print e
        return render_to_empty_json()

def enrollment_aggregate_json(request, course_id, semester = CURRENT_SEMESTER, year = CURRENT_YEAR):
    try:
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

            if semester != CURRENT_SEMESTER or year != CURRENT_YEAR:
                CORRECTED_TELEBEARS_JSON = PAST_SEMESTERS_TELEBEARS_JSON[semester + " " + year]
                CORRECTED_TELEBEARS = PAST_SEMESTERS_TELEBEARS[semester + " " + year]
            else:
                CORRECTED_TELEBEARS_JSON = TELEBEARS_JSON
                CORRECTED_TELEBEARS = TELEBEARS

            rtn["telebears"] = CORRECTED_TELEBEARS_JSON #THIS NEEDS TO BE FROM THE OTHER SEMESTER, NOT THE CURRENT SEMESTER
            last_date = sections[0].enrollment_set.all().latest("date_created").date_created
            enrolled_max = Enrollment.objects.filter(section__in = sections, date_created = last_date).aggregate(Sum("enrolled_max"))["enrolled_max__sum"]
            rtn["enrolled_max"] = enrolled_max
            dates = {d: [0, 0] for d in sections[0].enrollment_set.all().values_list("date_created", flat = True)}
            for s in sections:
                enrollment = s.enrollment_set.filter(date_created__gte=CORRECTED_TELEBEARS["phase1_start"]).order_by("date_created")
                for (d, enrolled, waitlisted) in enrollment.values_list("date_created", "enrolled", "waitlisted"):
                    if d in dates:
                        dates[d][0] += enrolled
                        dates[d][1] += waitlisted

            rtn["data"] = [
                {
                    "enrolled": d[1][0],
                    "waitlisted": d[1][1],
                    "day": (d[0] - CORRECTED_TELEBEARS["phase1_start"]).days + 1,
                    "date": (d[0]).strftime("%m/%d/%Y-%H:%M:%S"),
                    "enrolled_percent": round(d[1][0]/enrolled_max, 3),
                    "waitlisted_percent": round(d[1][1]/enrolled_max, 3)
                } for d in sorted(dates.items(), key = lambda x: x[0])
            ]
            enrolled_outliers = [d["enrolled_percent"] for d in rtn["data"] if d["enrolled_percent"] >= 1.0]
            rtn["enrolled_percent_max"] = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
            waitlisted_outliers = [d["waitlisted_percent"] for d in rtn["data"] if d["waitlisted_percent"] >= 1.0]
            rtn["waitlisted_percent_max"] = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
            rtn["enrolled_scale_max"] = int(rtn["enrolled_percent_max"] * rtn["enrolled_max"])
            rtn["waitlisted_scale_max"] = int(rtn["waitlisted_percent_max"] * rtn["enrolled_max"])

        return render_to_json(rtn)
    except Exception as e:
        print e
        return render_to_empty_json()

def enrollment_json(request, section_id):
    try:
        rtn = {}
        section = Section.objects.get(id=section_id)
        course = section.course
        rtn["course_id"] = course.id
        rtn["section_id"] = section.id
        rtn["title"] = course.abbreviation + " " + course.course_number
        rtn["subtitle"] = course.title
        if section.instructor == "":
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

        rtn["telebears"] = CORRECTED_TELEBEARS_JSON
        now = section.enrollment_set.all().latest("date_created")
        rtn["enrolled_max"] = now.enrolled_max
        rtn["data"] = [{
                "enrolled": d.enrolled,
                "waitlisted": d.waitlisted,
                "day": (d.date_created - CORRECTED_TELEBEARS["phase1_start"]).days + 1,
                "date": (d.date_created).strftime("%m/%d/%Y-%H:%M:%S"),
                "enrolled_percent": round(d.enrolled/rtn["enrolled_max"], 3),
                "waitlisted_percent": round(d.waitlisted/rtn["enrolled_max"], 3)
            } for d in section.enrollment_set.all().filter(date_created__gte=CORRECTED_TELEBEARS["phase1_start"]).order_by("date_created")]
        rtn["instructor"] = section.instructor
        enrolled_outliers = [d["enrolled_percent"] for d in rtn["data"] if d["enrolled_percent"] >= 1.0]
        rtn["enrolled_percent_max"] = max(enrolled_outliers) * 1.10 if enrolled_outliers  else 1.10
        waitlisted_outliers = [d["waitlisted_percent"] for d in rtn["data"] if d["waitlisted_percent"] >= 1.0]
        rtn["waitlisted_percent_max"] = max(waitlisted_outliers) * 1.10 if waitlisted_outliers else 1.10
        rtn["enrolled_scale_max"] = int(rtn["enrolled_percent_max"] * rtn["enrolled_max"])
        rtn["waitlisted_scale_max"] = int(rtn["waitlisted_percent_max"] * rtn["enrolled_max"])

        return render_to_json(rtn)
    except Exception as e:
        print e
        return render_to_empty_json()
