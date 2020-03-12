"""Catalog Views."""
import logging
import re
import json

from django.http import Http404
from django.shortcuts import render_to_response
# from django.http import HttpResponse
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles import finders
from django.core import serializers

from marketplace import views as marketplace_views
from berkeleytime.utils.requests import raise_404_on_error
from berkeleytime.utils.requests import raise_404_if_not_get
from berkeleytime.utils.requests import render_to_empty_json
from berkeleytime.utils.requests import render_to_json
from berkeleytime.utils.requests import get_profile

from catalog.models import Course
# from catalog.models import Section
from catalog.models import Playlist
# from account.models import BerkeleytimeUserProfile

from berkeleytime.settings import CURRENT_SEMESTER
from berkeleytime.settings import CURRENT_YEAR
from berkeleytime.settings import CURRENT_SEMESTER_DISPLAY
from berkeleytime.settings import TELEBEARS_ALREADY_STARTED
from berkeleytime.settings import ONGOING_YEAR
from berkeleytime.settings import ONGOING_SEMESTER

from catalog.utils import is_post, is_get
from catalog.service.enrollment import enrollment_service
from catalog.service.section import section_service

from scheduler.lib.utils import parse_gmail

logger = logging.getLogger(__name__)


def test(request):
    """Test request."""
    temp = 1/0  # noqa
    render_to_response('team/index.html', {}, context_instance=RequestContext(request))  # noqa


@raise_404_on_error
@raise_404_if_not_get
def catalog(request, abbreviation='', course_number=''):
    """Return HTML for the base catalog page."""
    return render_to_response(
        'catalog/catalog.html',
        catalog_filters(
            request, abbreviation=abbreviation, course_number=course_number
        ),
        context_instance=RequestContext(request)
    )


def catalog_filters(request, abbreviation='', course_number=''):
    """Return the context for the catalog."""
    defaults = Playlist.objects.filter(user=None)
    # By Semester
    haas = defaults.filter(category="haas")
    ls = defaults.filter(category="ls", semester=CURRENT_SEMESTER, year=CURRENT_YEAR).order_by("name")
    university = defaults.filter(category="university").order_by("id")
    engineering = defaults.filter(category="engineering").order_by("id")
    # Universal
    department = defaults.filter(category="department").order_by("name")
    units = Playlist.objects.filter(category="units").order_by("id")
    level = Playlist.objects.filter(category="level").order_by("id")
    semester = Playlist.objects.filter(category="semester")
    chemistry = defaults.filter(category="chemistry").order_by("id")  # deprecated?
    enrollment = Playlist.objects.filter(category="enrollment").order_by("id")
    length = Playlist.objects.filter(category="length").order_by("id")

    days = Playlist.objects.filter(category="days").order_by("id")
    time = Playlist.objects.filter(category="time").order_by("id")
    time_of_day = Playlist.objects.filter(category="time_of_day").order_by("id")  # noqa
    custom = []
    if request.user.is_authenticated():
        user_profile = get_profile(request)
        custom = Playlist.objects.filter(
            category="custom",
            name="Favorites",
            user_email=parse_gmail(request)
        )
    default_course = ""
    playlist_ids = Playlist.objects.filter(
        name__in=["Lower Division", "Upper Division", "Graduate", CURRENT_SEMESTER_DISPLAY]  # noqa
    ).values_list("id", flat=True)

    default_playlists = ",".join(map(str, playlist_ids))
    course = Course.objects.filter(
        abbreviation=abbreviation, course_number=course_number
    ) if (abbreviation and course_number) else None  # noqa
    if course:
        default_course = course[0].id

    rtn = {
        "haas": haas, "ls": ls, "university": university, "engineering": engineering,  # noqa
        "chemistry": chemistry, "custom": custom, "level": level, "units": units,  # noqa
        "days": days, "time": time, "time_of_day": time_of_day,
        "length": length, "enrollment": enrollment,
        "department": department, "default_playlists": default_playlists,
        "semester": semester,
        "default_course": default_course,
        "promotions": json.dumps(marketplace_views.get_promotion_context()),
    }
    return rtn


def filter(request):
    """Filter something."""
    try:
        if is_get(request):
            course_id = request.GET.get("course_id")
            if course_id:
                course = courses_to_json(Course.objects.filter(pk=course_id))
                if course:
                    return render_to_json(course)
                raise Http404
            filter_ids = request.GET["filters"].strip(",").split(",")
            unioned = list(set(Playlist.objects.filter(
                id__in=filter_ids).values_list("category", flat=True)))  # 0.001  # noqa
            for index, category in enumerate(unioned):
                if request.user.is_authenticated():
                    unioned[index] = union_by_category(
                        category, filter_ids, get_profile(request))
                else:
                    unioned[index] = union_by_category(
                        category, filter_ids)

            if unioned:
                courses = reduce(lambda x, y: x & y, unioned).distinct()
                return render_to_json(courses_to_json(courses))
            return render_to_empty_json()
        else:
            raise Http404
    except Exception as e:
        print e
        return render_to_empty_json()


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


def course(request, course_id):
    """Render the HTML for a single course given a course_id."""
    try:
        course = Course.objects.get(pk=course_id)
        favorited = False
        sections = section_service.find_by_course_id(
            course_id=course, semester=CURRENT_SEMESTER, year=CURRENT_YEAR,
        )

        if request.user.is_authenticated():
            user = get_profile(request)
            favorited = course in Playlist.objects.get(
                category="custom",
                name="Favorites",
                user_email=parse_gmail(request)
            ).courses.all()

        return render_to_response(
            "catalog/course.html",
            {
                'course': course,
                'favorited': favorited,
                'last_enrollment_update': get_last_enrollment_update(sections),
                'cover_photo': cover_photo(course),
                'offered': bool(sections),
                'marketplace': marketplace_views.get_textbook_context(
                    course, CURRENT_SEMESTER, CURRENT_YEAR,
                ),
            },
            context_instance=RequestContext(request),
        )
    except Exception as e:
        print e
        raise Http404

def course_json(request, course_id):
    """Render the JSON for a single course given a course_id."""
    try:
        course = Course.objects.get(pk=course_id)
        favorited = False
        sections = section_service.find_by_course_id(
            course_id=course, semester=CURRENT_SEMESTER, year=CURRENT_YEAR,
        )

        if request.user.is_authenticated():
            user = get_profile(request)
            favorited = course in Playlist.objects.get(
                category="custom",
                name="Favorites",
                user_email=parse_gmail(request)
            ).courses.all()

        return render_to_json(
            {
                'title': course.title,
                'course': course,
                'favorited': favorited,
                'last_enrollment_update': get_last_enrollment_update(sections),
                'cover_photo': cover_photo(course),
                'offered': bool(sections),
                'marketplace': marketplace_views.get_textbook_context(
                    course, CURRENT_SEMESTER, CURRENT_YEAR,
                ),
            },

        )
    except Exception as e:
        print e
        return render_to_empty_json()


def get_last_enrollment_update(sections):
    """Retrieve the lastest datetime enrollment was updated."""
    try:
        # TODO (ASUC) Is this being used anymore
        # Do not return anything if Telebears hasn't even started, assumes that
        # sections are for the current semester
        if not TELEBEARS_ALREADY_STARTED:
            return

        primary_sections = [s for s in sections if s.is_primary]

        if not primary_sections:
            return

        enrollment = enrollment_service.get_latest(primary_sections[0].id)
        return enrollment.date_created if enrollment else None

    except Exception as e:
        print e
        return


def course_box(request):
    """
    DEPRECATED
    Render the HTML for a course box.
    """
    try:
        course = Course.objects.get(id=request.GET.get("course_id"))
        semester = request.GET.get("semester") if "semester" in request.GET else CURRENT_SEMESTER  # noqa
        year = request.GET.get("year") if "year" in request.GET else CURRENT_YEAR  # noqa
        sections = section_service.find_by_course_id(
            course_id=course.id, semester=semester, year=year,
        )

        favorited = False
        if request.user.is_authenticated():
            user = get_profile(request)
            favorited = course in Playlist.objects.get(
                category="custom",
                name="Favorites",
                user_email=parse_gmail(request)
            ).courses.all()

        # show ongoing sections too if not a specific semester/year requested
        # and current semester/year diferent from ongoing
        ongoing = "semester" not in request.GET and "year" not in request.GET and (CURRENT_YEAR != ONGOING_YEAR or CURRENT_SEMESTER != ONGOING_SEMESTER)  # noqa
        ongoing_sections = section_service.find_by_course_id(
            course_id=course.id, semester=ONGOING_SEMESTER, year=ONGOING_YEAR,
        )

        return render_to_response('course_box.html', {
            'course': course,
            'sections': sections,
            'favorited': favorited,
            'requirements': universal_requirements(course),
            'cover_photo': cover_photo(course),
            'last_enrollment_update': get_last_enrollment_update(sections),
            'ongoing_sections': ongoing_sections,
            'ongoing': ongoing,
            'marketplace': marketplace_views.get_textbook_context(
                course, CURRENT_SEMESTER, CURRENT_YEAR,
            )
        }, context_instance=RequestContext(request))
    except Exception as e:
        print e
        return render_to_empty_json()


def course_box_json(request):
    """Render the HTML for a course box."""
    course = Course.objects.get(id=request.GET.get("course_id"))
    semester = request.GET.get("semester") if "semester" in request.GET else CURRENT_SEMESTER  # noqa
    year = request.GET.get("year") if "year" in request.GET else CURRENT_YEAR  # noqa
    sections = section_service.find_by_course_id(
        course_id=course.id, semester=semester, year=year,
    )

    favorited = False
    if request.user.is_authenticated():
        user = get_profile(request)
        favorited = course in Playlist.objects.get(
            category="custom",
            name="Favorites",
            user_email=parse_gmail(request)
        ).courses.all()

    # show ongoing sections too if not a specific semester/year requested
    # and current semester/year diferent from ongoing
    ongoing = "semester" not in request.GET and "year" not in request.GET and (CURRENT_YEAR != ONGOING_YEAR or CURRENT_SEMESTER != ONGOING_SEMESTER)  # noqa
    ongoing_sections = section_service.find_by_course_id(
        course_id=course.id, semester=ONGOING_SEMESTER, year=ONGOING_YEAR,
    )

    return render_to_json({
        'course': course.as_json(),
        'sections': map(lambda s: s.as_json(), sections),
        'favorited': favorited,
        'universal_requirements': universal_requirements(course),
        'requirements_by_semester': semester_requirements(course),
        'cover_photo': cover_photo(course),
        'last_enrollment_update': get_last_enrollment_update(sections),
        'ongoing_sections': map(lambda s: s.as_json(), ongoing_sections),
        'ongoing': ongoing,
        'marketplace': marketplace_views.get_textbook_context(
            course, CURRENT_SEMESTER, CURRENT_YEAR,
        )
    })


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
    return 3*int(year) + sem


def universal_requirements(course):
    playlists_1 = course.playlist_set.filter(category__in=[
        'department',
        'university',
        'units',
    ])
    playlists_2 = course.playlist_set.filter(category__in=[
        'semester',
    ])
    requirements_1 = list(playlists_1.values_list('name', flat=True))
    requirements_2 = sorted(list(playlists_2.values_list('name', flat=True)), key=semester_to_value, reverse=True)
    print("Universal: " + str(requirements_1 + requirements_2))
    return requirements_1 + requirements_2


def semester_requirements(course):
    playlists = course.playlist_set.filter(category__in=[
        'ls',
        'engineering',
        'haas',
    ])
    requirements = list(playlists.values_list('semester', 'year', 'name'))
    sem_to_reqs = dict()
    for semester, year, name in requirements:
        sem_to_reqs.setdefault(semester.capitalize() + ' ' + year, list()).append(name)
    retval = [{'semester': sem, 'requirements': reqs} for sem, reqs in sem_to_reqs.items()]
    print("Semester requirements: " + str(retval))
    return retval


@login_required
def favorite(request):
    """Toggle whether this is a course favorite."""
    try:
        if is_post(request) and request.user.is_authenticated():
            user = get_profile(request)
            course = Course.objects.get(id=request.POST["course_id"])
            if request.POST["action"] == "favorite":
                Playlist.objects.get(
                    category="custom",
                    name="Favorites",
                    user_email=parse_gmail(request)
                ).courses.add(course)
                course.favorite_count += 1
                course.save()
            elif request.POST["action"] == "unfavorite":
                Playlist.objects.get(
                    category="custom",
                    name="Favorites",
                    user_email=parse_gmail(request)
                ).courses.remove(course)
                course.favorite_count -= 1
                course.save()
            else:
                raise Http404
            return render_to_empty_json()
    except Exception as e:
        print e
        raise Http404


def cover_photo(course):
    """Return a relative URL of the cover photo to render."""
    return "GENERIC"
