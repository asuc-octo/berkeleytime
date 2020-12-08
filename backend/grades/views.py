import traceback

from django.core.cache import cache
from django.db.models import Sum
from django.shortcuts import render

from berkeleytime.utils import render_to_json, render_to_empty_json, render_to_empty_json_with_status_code
from catalog.models import Course
from catalog.utils import sort_course_dicts
from grades.models import Grade
from grades.utils import add_up_grades, gpa_to_letter_grade


CACHE_TIMEOUT = 900

# /grades/grades_json/
def grade_context(long_form=False):
    cache_key = 'grade__courses_new'
    if long_form:
        cache_key = 'grade__courses__long_new'
    cached = cache.get(cache_key)
    if cached:
        rtn = cached
    else:
        courses = Course.objects.filter(grade__isnull=False).distinct().order_by('abbreviation', 'course_number')
        if long_form:
            rtn = courses.values('id', 'abbreviation', 'course_number', 'title')
        else:
            rtn = courses.values('id', 'abbreviation', 'course_number')
        rtn = sort_course_dicts(rtn)
        cache.set(cache_key, rtn, CACHE_TIMEOUT)
    return {'courses': rtn}

def grade_context_json(request):
    return render_to_json(grade_context(long_form=request.GET.get('form', 'short') == 'long'))


# /grades/course_grades/
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
    return 3 * int(s['year']) + sem

def grade_section_json(request, course_id):
    """
    {'instructor': 'Shewchuk', 'semester': 'spring', 'year': 2012, 'section_number': '003', 'grade_id': 1533}
    """
    try:
        cached = cache.get('grade_section_json_new ' + str(course_id))
        if cached:
            print('Cache Hit in grade_section_json course_id ' + course_id)
            return render_to_json(cached)
        sections = [
            {
                'instructor': entry.instructor,
                'semester': entry.semester,
                'year': entry.year,
                'section_number': entry.section_number,
                'grade_id': entry.id,
            } for entry in Grade.objects.filter(course__id=int(course_id))
        ]
        sections = sorted(sections, key=year_and_semester_to_value, reverse=True)
        cache.set('grade_section_json_new ' + str(course_id), sections, CACHE_TIMEOUT)
        return render_to_json(sections)
    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json_with_status_code(500)


# /grades/sections/
STANDARD_GRADES = [("a1", "A+"), ("a2", "A"), ("a3", "A-"),
                   ("b1", "B+"), ("b2", "B"), ("b3", "B-"),
                   ("c1", "C+"), ("c2", "C"), ("c3", "C-"),
                   ("d", "D"), ("f", "F"), ("p", "P"), ("np", "NP")]

def grade_json(request, grade_ids):
    try:
        cached = cache.get('grade_json_new ' + str(grade_ids))
        if cached:
            print('Cache Hit in grade_json ' + grade_ids)
            return render_to_json(cached)
        actual_total = 0
        rtn = {}
        grade_ids = grade_ids.split('&')
        sections = Grade.objects.filter(id__in=grade_ids)
        course = Course.objects.get(id=sections.values_list('course', flat=True)[0])
        percentile_total = sections.aggregate(Sum('graded_total'))['graded_total__sum']

        percentile_ceiling = 0
        total_unweighted = 0
        for grade, display in STANDARD_GRADES:
            grade_entry = {}
            if grade == 'd':
                numerator = sum([sections.aggregate(Sum(d)).get(d + '__sum', 0) for d in ('d1', 'd2', 'd3')])
            else:
                numerator = sections.aggregate(Sum(grade)).get(grade + '__sum', 0)
            actual_total += numerator
            percent = numerator / percentile_total if percentile_total > 0 else 0.0
            grade_entry['percent'] = round(percent, 2)
            grade_entry['numerator'] = numerator
            if grade == 'p' or grade == 'np':
                grade_entry['percentile_high'] = 0
                grade_entry['percentile_low'] = 0
                total_unweighted += numerator
            else:
                grade_entry['percentile_high'] = abs(round(1.0 - percentile_ceiling, 2))
                grade_entry['percentile_low'] = abs(round(1.0 - percentile_ceiling - percent, 2))
            percentile_ceiling += percent
            rtn[display] = grade_entry
        rtn['course_id'] = course.id
        rtn['title'] = course.abbreviation + ' ' + course.course_number
        rtn['subtitle'] = course.title
        rtn['course_gpa'] = round(course.grade_average, 3)
        rtn['course_letter'] = course.letter_average
        weighted_letter_grade_counter, total = add_up_grades(sections)
        if total == 0:
            rtn['section_gpa'] = -1
            rtn['section_letter'] = 'N/A'
        else:
            rtn['section_gpa'] = round(float(sum(weighted_letter_grade_counter.values())) / total, 3)
            rtn['section_letter'] = gpa_to_letter_grade(rtn['section_gpa'])
        rtn['denominator'] = total + total_unweighted

        if rtn['course_letter'] == '':
            rtn['course_letter'] = 'N/A'

        if rtn['section_letter'] == '':
            rtn['section_letter'] = 'N/A'

        cache.set('grade_json_new ' + str(grade_ids), rtn, CACHE_TIMEOUT)
        return render_to_json(rtn)
    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json()