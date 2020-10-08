import traceback
import json
from functools import reduce

from django.core.cache import cache

from berkeleytime.utils import render_to_json, render_to_empty_json
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR, CURRENT_SEMESTER_DISPLAY
from catalog.models import Section, Course
from catalog.utils import sort_course_dicts
from enrollment.models import Enrollment
from playlist.models import Playlist


CACHE_TIMEOUT = 900

# /catalog/catalog_json/
def catalog_context_json(request, abbreviation='', course_number=''):
    """Return JSON of all courses"""

    long_form = request.GET.get('form', 'short') == 'long'
    cache_key = 'all__courses'
    if long_form:
        cache_key = 'all__courses__long'
    cached = cache.get(cache_key)
    if cached:
        rtn = cached
    else:
        courses = Course.objects.distinct().order_by('abbreviation', 'course_number')
        if long_form:
            rtn = courses.values('id', 'abbreviation', 'course_number', 'title')
        else:
            rtn = courses.values('id', 'abbreviation', 'course_number')
        rtn = sort_course_dicts(rtn)
        cache.set(cache_key, rtn, CACHE_TIMEOUT)
    return render_to_json({'courses': rtn})


# /catalog/catalog_json/filters/
def catalog_filters(request, abbreviation='', course_number=''):
    """Return the context for the catalog."""

    haas = Playlist.objects.filter(category='haas')
    ls = Playlist.objects.filter(category='ls', semester=CURRENT_SEMESTER, year=CURRENT_YEAR).order_by('name')
    university = Playlist.objects.filter(category='university').order_by('id')
    engineering = Playlist.objects.filter(category='engineering').order_by('id')

    department = Playlist.objects.filter(category='department').order_by('name')
    units = Playlist.objects.filter(category='units').order_by('id')
    level = Playlist.objects.filter(category='level').order_by('id')
    semester = Playlist.objects.filter(category='semester').order_by('-id')

    playlist_ids = Playlist.objects.filter(name__in=[CURRENT_SEMESTER_DISPLAY]).values_list('id', flat=True)
    default_playlists = ','.join(map(str, playlist_ids))

    if Course.objects.filter(abbreviation=abbreviation, course_number=course_number):
        default_course = course[0].id
    else:
        default_course = ''

    rtn = {
        'haas': haas,
        'ls': ls,
        'university': university,
        'engineering': engineering,
        'department': department,
        'units': units,
        'level': level,
        'semester': semester,
        'default_playlists': default_playlists,
        'default_course': default_course,
    }
    return rtn

def catalog_filters_json(request, abbreviation='', course_number=''):
    """Return JSON of filters for the catalog page."""

    filters = catalog_filters(request, abbreviation=abbreviation, course_number=course_number)
    playlist_type = type(Playlist.objects.all())

    for playlist in filters:
        if type(filters[playlist]) == playlist_type:
            filters[playlist] = list(map(lambda x: x.as_json(), filters[playlist]))

    filters['department'].insert(0, {
        'category': 'department',
        'name': '-',
        'id': -1,
    })

    return render_to_json(filters)


# /catalog/catalog_json/course/
def get_last_enrollment_update(sections):
    """Retrieve the lastest datetime enrollment was updated."""
    try:
        primary_sections = [s for s in sections if s.is_primary]

        if not primary_sections:
            return

        enrollment = Enrollment.objects.filter(section_id=primary_sections[0].id).latest('date_created')
        return enrollment.date_created if enrollment else None

    except Exception as e:
        traceback.print_exc()
        return

def course_json(request, course_id):
    """Render the JSON for a single course given a course_id."""
    try:
        course = Course.objects.get(pk=course_id)
        sections = Section.objects.filter(
            course_id=course_id, semester=CURRENT_SEMESTER, year=CURRENT_YEAR, disabled=False).order_by('section_number')

        return render_to_json(
            {
                'title': course.title,
                'course': course,
                'last_enrollment_update': get_last_enrollment_update(sections),
                'offered': bool(sections),
            },

        )
    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json()


# /catalog/catalog_json/course_box/
def semester_to_value(s):
    """
    Assigns a number to a section dict (see grade_section_json for format). Is used to
    sort a list of sections by time.
    """
    semester, year = s.split()
    if semester.lower() == 'spring':
        sem = 0
    elif semester.lower() == 'fall':
        sem = 2
    else:
        sem = 1
    return 3 * int(year) + sem

def all_requirements(course):
    playlists_1 = course.playlist_set.filter(category__in=[
        'department',
        'university',
        'units',
        'engineering',
        'haas',
    ])
    playlists_2 = course.playlist_set.filter(category__in=[
        'semester',
    ])
    playlists_3 = course.playlist_set.filter(category__in=['ls'])

    requirements_base = list(playlists_1.values_list('name', flat=True))
    requirements_semester = sorted(list(playlists_2.values_list('name', flat=True)), key=semester_to_value, reverse=True)

    requirements_ls = []
    ls_reqs_unprocessed = list(playlists_3.values_list('semester', 'year', 'name'))
    for semester, year, name in ls_reqs_unprocessed:
        if semester == CURRENT_SEMESTER and year == CURRENT_YEAR:
            requirements_ls.append(name)

    return requirements_ls + requirements_base + requirements_semester

def course_box_json(request):
    """Render the HTML for a course box."""
    try:
        course = Course.objects.get(id=request.GET.get('course_id'))

        semester = request.GET.get('semester', CURRENT_SEMESTER)
        year = request.GET.get('year', CURRENT_YEAR)
        sections = Section.objects.filter(
            course_id=course.id, semester=semester, year=year, disabled=False).order_by('section_number')

        return render_to_json({
            'course': course.as_json(),
            'sections': list(map(lambda s: s.as_json(), sections)),
            'requirements': all_requirements(course),  # Backwards-compatible
            # 'universal_requirements': universal_requirements(course),  # Enable when ready
            # 'requirements_by_semester': semester_requirements(course),  # Enable when ready
            'last_enrollment_update': get_last_enrollment_update(sections),
        })

    except Exception as e:
        traceback.print_exc()
        return render_to_empty_json()


# /catalog/filter/
def courses_to_json(queryset):
    """Convert a single course to JSON."""
    return list(queryset.values(
        "id", "abbreviation", "course_number", "title", "grade_average",
        "letter_average", "enrolled", "enrolled_percentage",
        "open_seats", "favorite_count", "waitlisted", "units", "description"))

def union_by_category(category, filter_ids, user=None):
    """TODO (ASUC) Write docstring."""
    playlists = Playlist.objects.filter(id__in=filter_ids, category=category)
    if category == "custom":
        playlists = playlists.filter(user=user)
    intersected = [playlist.courses.all() for playlist in playlists]
    if category in ('university', 'ls', 'engineering', 'haas'):
        return reduce(lambda x, y: x & y, intersected)
    else:
        return reduce(lambda x, y: x | y, intersected)

def filter(request):
    """Filter something."""
    try:
        if request.method == 'GET':
            course_id = request.GET.get('course_id')
            if course_id:
                course = courses_to_json(Course.objects.filter(pk=course_id))
                if course:
                    return render_to_json(course)
                raise Http404
            filter_ids = request.GET['filters'].strip(',').split(',')
            unioned = list(set(Playlist.objects.filter(
                id__in=filter_ids).values_list('category', flat=True)))
            for index, category in enumerate(unioned):
                unioned[index] = union_by_category(
                    category, filter_ids)

            if unioned:
                courses = reduce(lambda x, y: x & y, unioned).distinct()
                return render_to_json(courses_to_json(courses))
            return render_to_empty_json()
        else:
            raise Http404
    except Exception as e:
        print(e)
        return render_to_empty_json()

