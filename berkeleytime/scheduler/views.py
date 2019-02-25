import json
import re

from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from django.http import Http404
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import RequestContext

from catalog.utils import is_post, is_get, sort_course_dicts
from scheduler.utils_views import (section_objects_to_info_dict,
                                   get_section_info, section_to_event)
from scheduler.constraint_func import *
from scheduler.lib.schedule_csp import *
from scheduler.lib.schedule_wrapper import ScheduleWrapper
from scheduler.lib.utils import parse_gmail, parse_section_ids, parse_schedule_id

from catalog.models import Course, Section, Playlist
from account.models import BerkeleytimeUserProfile
from scheduler.models import Schedule

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR, CURRENT_SEMESTER_DISPLAY

from berkeleytime.utils.requests import render_to_empty_json, render_to_json

from datetime import datetime, date, time
from account.utils import get_google_cal_service

import pdb

# Create your views here.

DEBUG_RENDER = False
DEBUG_VIEW_SCHEDULES = False


def under_construction(request):
    return render_to_response(
            'scheduler/under_construction.html')

def login_to_contiune(request):
    return render_to_response(
            'scheduler/login.html')


def select_classes(request):
    if is_get(request):
        if not request.user.is_authenticated():
            return render_to_response("scheduler/schedule.html", {
            "courses": []
        }, context_instance=RequestContext(request))
        favorited_course_data = []
        all_course_data = []

        user = BerkeleytimeUserProfile.objects.get(user=request.user)
        favorite_playlist, _ = Playlist.objects.get_or_create(
            user_email=parse_gmail(request),
            name="Favorites",
            category="custom"
        )
        favorite_courses = favorite_playlist.courses.all()
        all_courses = Playlist.objects.get(category="semester", name=CURRENT_SEMESTER_DISPLAY).courses.all()

        try:
            selected_courses = request.session['all_course']
        except KeyError:
            selected_courses = []

        # Pass only courses that are available this semester to the frontend
        # TODO Allow users to select some other semester
        # TODO instead of hard coding additional fields we should have a singular source of truth somewhere
        for course in all_courses:
            #if course is not selected already
            if str(course.id) not in selected_courses:
                course_info_dict = {
                    'name': str(course),
                    'course_id': str(course.id)
                }
                if course in favorite_courses:
                    # Prefetch additional data for favorite courses
                    course_info_dict.update({
                        'units': course.units,
                        'enrollment_percentage': str(int(course.enrolled_percentage * 100)),
                        'letter_average': course.letter_average,
                        'waitlisted': course.waitlisted,
                    })
                    favorited_course_data.append(course_info_dict)
                    # selected_courses.append(str(course.id))
                all_course_data.append(course_info_dict)

        # all_course_data = sort_course_dicts(all_course_data)
        return render_to_response("scheduler/schedule.html", {
            "all_courses": all_course_data,
            "all_courses_json": json.dumps(all_course_data, cls=DjangoJSONEncoder),
            "courses": favorited_course_data,
            'selected_courses': json.dumps(selected_courses)
        }, context_instance=RequestContext(request))


def schedule_render(request):

    if is_get(request):
        # Case 1: user is not logged in
        if not request.user.is_authenticated():
            return login_to_contiune(request)
            # return select_classes(request)   # TODO need to discuss what to return for not authenticated user

        # Checks if user is an authorized user and redirects request if not
        # file = open("./scheduler/authorized_users.txt", "r")
        # authorized = True #CHANGE THIS BACK
        # user_email = parse_gmail(request)
        # for line in file:
        #     if user_email == line.strip():
        #         authorized = True
        #         break
        # file.close()
        # authorized = True
        # if not authorized:
        #     return under_construction(request)

        schedules = Schedule.objects.filter(user_email=parse_gmail(request))

        # Case 2: User logged in but no saved schedules
        if len(schedules) < 1:
            return select_classes(request)

        # Case 3: User logged in and has at least one saved schedule:
        # return all saved schedules
        saved_section_objects = []
        wrapped_schedules = []
        for schedule in schedules:
            wrapped_schedules.append(ScheduleWrapper.from_schedule(schedule))
            for section in schedule.sections.all():
                saved_section_objects.append(section)

        all_sections_info_dict = section_objects_to_info_dict(saved_section_objects)

        if DEBUG_RENDER:
            print section_objects_to_info_dict
            html = "<html><body> %s </body></html>" % str(section_objects_to_info_dict)
            return HttpResponse(html)

        return render_to_response("scheduler/saved_schedule.html", {
                'all_sections': all_sections_info_dict,
                'schedules': wrapped_schedules,
            }, context_instance=RequestContext(request))



def select_sections_json(request, course_id):
    # TODO: This query seems excessive can probably shrink it down
    # Get the course in the current semester that has the request course_id
    course = Playlist.objects.get(
        category="semester",
        name=CURRENT_SEMESTER_DISPLAY
    ).courses.all().get(id=course_id)
    course_dict = {}
    course_dict.update({
        'name': str(course),
        'units': course.units,
        'enrollment_percentage': str(int(course.enrolled_percentage*100)),
        'letter_average': course.letter_average,
        'waitlisted': course.waitlisted,
        'course_id': str(course.id)
    })
    return render_to_json(course_dict)


def select_sections_params(request):
    try:
        if not request.user.is_authenticated():
            return schedule_render(request)

        if is_get(request):
            # Getting params from posted json.
            request.session['all_course'] = json.loads(request.GET.get("course_ids"))
            return redirect('/scheduler/select_sections/')
    except Exception as e:
        print e
        return HttpResponse(json.dumps({}), mimetype="application/javascript")


def select_sections(request):
    try:
        all_course = request.session['all_course']

        # user refreshed, but session has expired
        if all_course is None:
            return redirect('/scheduler/')

        all_sections = {}
        for course_id in all_course:
            course = Course.objects.filter(id=course_id)
            sections = Section.objects\
                .filter(course=course, disabled=False, semester=CURRENT_SEMESTER, year=CURRENT_YEAR)\
                .order_by("section_number")

            # we apply get_section_info to each section and remove any empty dicts that may be returned by exception
            sections = filter(None, map(get_section_info, sections))

            for sec in sections:
                # Create datetime objects for start/end time display on select sections
                sec["start_time"] = datetime.strptime(sec["start_time"], "%H:%M")
                sec["end_time"] = datetime.strptime(sec["end_time"], "%H:%M")
                if sec['is_primary'] == 'true':
                    sec["final_start"] = datetime.strptime(sec["final_start"], "%H:%M")
                    sec["final_end"] = datetime.strptime(sec["final_end"], "%H:%M")
                # Take only first 3 letters of section type
                sec["type"] = sec["type"][:3].upper()
            #all_sections[str(course)] = sections
            trimmed_name = str(course).replace("Course: ", "")[2:-2]
            all_sections[trimmed_name] = sections
        return render_to_response("scheduler/select_section.html",
            {"sections_filtered": all_sections,
             "sections_filtered_json" : json.dumps(all_sections, cls=DjangoJSONEncoder),
            }, context_instance=RequestContext(request))
    except Exception as e:
        print e
        return HttpResponse(json.dumps({}), mimetype="application/javascript")


def view_schedules_params(request):
    try:
        if not request.user.is_authenticated():
            return schedule_render(request)

        if is_get(request):
            # Getting params from posted json.
            request.session['sections_data'] = json.loads(request.GET.get("sections_data"))

            return redirect('/scheduler/view_schedules/')
    except Exception as e:
        print e
        return HttpResponse(json.dumps({}), mimetype="application/javascript")


# request has user and all the selected section ccns
def view_schedules(request):
    # constraints here, refresh on change
    # start/end time, allow conflicts, dead days
    if not request.user.is_authenticated():
        return schedule_render(request)
    sections_data = request.session['sections_data']

    # user refreshed, but session has expired
    if sections_data is None:
        return redirect('/scheduler/')
    sections_ccns = sections_data.get('ccns')
    constraint_bits = sections_data.get('constraintBits')
    custom_breaks = sections_data.get('breaks')

    sections_dict = parse_sections_ccns(sections_ccns)
    sections_dict.update(parse_custom_breaks(custom_breaks))
    constraints = {}

    # TODO assume the type for time objects passed from frontend is datetime object
    # TODO (Kelvin): ask Flora what these are for / how constraint bits used

    if "start_time" in constraints:
        start_time = constraints.start_time
    else:
        start_time = datetime(2000, 1, 1, hour=00, minute=00, second=0)
    if "end_time" in constraints:
        end_time = constraints.end_time
    else:
        # TODO a really large end time for marking no end time
        end_time = datetime(2200, 1, 1, hour=00, minute=00, second=0)
    # initial_constraints.append(LimitStartEndTimes(start_time, end_time))

    parsed_constraint_funcs = parse_constraint_bits(constraint_bits)

    # Debug output
    if DEBUG_VIEW_SCHEDULES:
        print sections_dict
        print parsed_constraint_funcs

    # Make a scheduleCSP object and generate schedules, returns a list of ScheduleWrapper objects
    schedule_csp = ScheduleCSP(sections_dict, parsed_constraint_funcs[0],
                               parsed_constraint_funcs[2], parsed_constraint_funcs[1])

    # TODO should we remove the amount constraint on generating schedules?
    generated_schedules = schedule_csp.generate_schedules()
    sections = [section for section_list in sections_dict.itervalues() for section in section_list]
    all_sections_info_dict = section_objects_to_info_dict(sections)

    return render_to_response("scheduler/view_schedules.html",
                              {'all_sections': all_sections_info_dict,
                               'schedules': generated_schedules},
                               context_instance=RequestContext(request))


def save_schedule(request):
    """
    POST endpoint for saving a schedule
    request.session['schedule'] should be the JSON of the schedule object that we are trying to save
    :return: we return the JSON of the schedule we save and status code 200 if successful
             else we return an empty string with status code 500
    """
    parsed_section_ids = parse_section_ids(request, "save_sched_data")
    schedule_id = parse_schedule_id(request)
    schedule_instance = Schedule(user_email=parse_gmail(request), uid=schedule_id)
    schedule_instance.save()
    schedule_instance.sections.add(*parsed_section_ids)

    return HttpResponse(status=200)

def delete_schedule(request):
    schedule_id = parse_schedule_id(request)
    schedules_instances = Schedule.objects.filter(user_email=parse_gmail(request))
    for schedule in schedules_instances:
        if schedule.uid == schedule_id:
            schedule.delete()
            return HttpResponse(status=200)
    return HttpResponse(status=400)

def export_schedule(request):
    service = get_google_cal_service(request)

    parsed_section_ids = parse_section_ids(request, "export_sched_data")
    events = map(section_to_event, parsed_section_ids)

    for event in events:
        if event:
            service.events().insert(calendarId='primary', body=event).execute()

    return HttpResponse(status=200)

def parse_sections_ccns(sections_ccns):
    """
    Helper method for parsing section CCNs into section info dictionary
    :param sections_ccn_s: a STRING containing all section CCNs
    :return: section info dictionary
    :type: {section name : [section objects]}
      e.g. {"cs170-dis": [section_cs170_d1, section_cs170_d2, section_cs170_d3]}
    """
    # Find all sections corresponding to CCNs
    sections_list = []
    for ccn in sections_ccns:
        try:
            section = Section.objects.filter(ccn=ccn, semester=CURRENT_SEMESTER, year=CURRENT_YEAR)\
                .order_by("-last_updated")[0]
            sections_list.append(section)
        except IndexError:
            continue

    # Turn section objects into {section name : [section objects]}
    # e.g. {"cs170-dis": [section_cs170_d1, section_cs170_d2, section_cs170_d3]}
    sections_dict = {}
    for section_obj in sections_list:
        section_key = str(section_obj)
        if section_key in sections_dict:
            sections_dict[section_key].append(section_obj)
        else:
            sections_dict[section_key] = [section_obj]
    return sections_dict


def parse_constraint_bits(constraint_bits_s):
    """
    Helper method for parsing constraint bits into constraint objects
    :param constraint_bits_s: A STRING containing 0/1 marking constraints turned on/off
                              See the GitHub wiki page for ordering of the bits
    :return: (initial_constraints, on_demand_ranking_constraints, on_demand_hard_constraint)
             where all items are lists of constraint_func objects
    """

    initial_constraints = []
    on_demand_ranking_constraints = []
    on_demand_hard_constraint = []

    constraint_bits = [int(item) for item in list(constraint_bits_s)]
    if constraint_bits.pop(0) == 1:
        initial_constraints.append(PreferMorning())
    if constraint_bits.pop(0) == 1:
        initial_constraints.append(PreferMidday())
    if constraint_bits.pop(0) == 1:
        initial_constraints.append(PreferAfternoon())
    if constraint_bits.pop(0) == 1:
        on_demand_ranking_constraints.append(MinimizeGaps())
    if constraint_bits.pop(0) == 1:
        on_demand_ranking_constraints.append(MaximizeGaps())
    if constraint_bits.pop(0) == 1:
        on_demand_ranking_constraints.append(MinimizeDays())
    if constraint_bits.pop(0) == 1:
        on_demand_ranking_constraints.append(MaximizeDays())
    dead_days_bits = constraint_bits[:5]
    constraint_bits = constraint_bits[5:]
    dead_days = []
    for day in range(1, 6):
        if dead_days_bits.pop(0):
            dead_days.append(day)
    if DEBUG_VIEW_SCHEDULES:
        print dead_days
    if dead_days:
        initial_constraints.append(PruneDeadDays(dead_days))
    if constraint_bits.pop(0) == 0:
        # Not allowing time conflicts
        on_demand_hard_constraint.append(OnDemandHardConstraint())

    return initial_constraints, on_demand_ranking_constraints, on_demand_hard_constraint

def parse_custom_breaks(custom_break_data):
    """
    Helper method for turning the custom break dict into a list of sections
    :param Dictionary of breaks with key: name and value: {start, end, days} for each break.
    :return: List of section objects, one for each break
    """
    if not custom_break_data:
        return {}
    break_sections = {}
    break_count = 0
    for k, v in custom_break_data.iteritems():
        s = Section()
        s.course_title = k
        s.days = "".join([str(i) for i in v["breakDays"]])
        d = date(1900, 1, 1)
        if float(v["start"]) // 1 == float(v["start"]):
            ts = time(int(v["start"]), 0)
        else:
            ts = time(int(float(v["start"]) // 1), 30)
        if float(v["end"]) // 1 == float(v["end"]):
            te = time(int(v["end"])-1, 59)
        else:
            te = time(int(float(v["end"]) // 1), 30)
        s.start_time = datetime.combine(d, ts)
        s.end_time = datetime.combine(d, te)
        s.rank = 1
        s.is_primary = False
        s.abbreviation = "BREAK"
        s.kind = "Break"
        s.course_number = "0"
        s.instructor = None
        s.ccn = unicode(str(break_count), "utf-8")
        break_count += 1
        break_sections[k] = [s]
    return break_sections
