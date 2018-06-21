import datetime, re, operator

from django.forms.models import model_to_dict
from django.http import Http404, HttpResponse
from django.db.models import Q
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.db import models

import searchtools
from berkeleytime.settings import ONGOING_SEMESTER, ONGOING_YEAR
from berkeleytime.utils.requests import render_to_json
from berkeleytime.utils.requests import raise_404_on_error
from berkeleytime.utils.requests import raise_404_if_not_get
from catalog.models import Course, Section, Grade, Playlist
from campus.models import Building, Room
from building_names import name_to_standard_name

SEARCH_ERROR = ["too many results", "no results", "room not found", "all numbers"]


@raise_404_on_error
def render(request):
    return render_to_response("campus/campus.html", campus_context(), context_instance=RequestContext(request))

@raise_404_if_not_get
@raise_404_on_error
def buildings(request):
    buildings = list(Building.objects.filter(
        room__isnull=False, latitude__isnull=False
    ).distinct("id").values("id", "name", "latitude", "longitude"))
    return render_to_json({"buildings": buildings})

@raise_404_if_not_get
@raise_404_on_error
def state(request):
    """
    URL endpoint which returns the current state of the campus

    """
    dt_string = request.GET.get("datetime")
    dt, day = string_to_state(dt_string)

    ongoing = Section.objects.filter(
        semester=ONGOING_SEMESTER,
        year=ONGOING_YEAR,
        disabled=False,
        days__contains=day,
        start_time__lte=dt,
        end_time__gte=dt,
        standard_location__isnull=False,
        standard_location__building__latitude__isnull=False,
        standard_location__building__longitude__isnull=False,
    ).select_related("standard_location__building", "standard_location")
    buildings = sorted(list(set([section.standard_location.building for section in ongoing])), key=lambda building: building.name)
    json = {"active_ids": [building.id for building in buildings], "section_count": ongoing.count()}
    return render_to_json(json)

@raise_404_if_not_get
@raise_404_on_error
def ongoing(request):
    """ returns all rooms with ongoing activity """
    dt_string = request.GET.get("datetime")
    dt, day = string_to_state(dt_string)

    ongoing = Section.objects.filter(
        semester=ONGOING_SEMESTER,
        year=ONGOING_YEAR,
        disabled=False,
        days__contains=day,
        start_time__lte=dt,
        end_time__gte=dt,
        standard_location__isnull=False,
        standard_location__building__latitude__isnull=False,
        standard_location__building__longitude__isnull=False,
    ).select_related("standard_location__building", "standard_location")
    return render_to_json({
        "rooms": section_state(ongoing)
    })

def building_state(building, state, day):
    json = []
    all_rooms = building.room_set.all()
    seated_rooms = list(all_rooms.exclude(seats__isnull=True).order_by("-seats"))
    nonseated_rooms = list(all_rooms.filter(seats__isnull=True).order_by("name"))
    room_mapping = {}
    sections = Section.objects.filter(
        semester=ONGOING_SEMESTER,
        year=ONGOING_YEAR,
        disabled=False,
        days__contains=day,
        start_time__lte=state,
        end_time__gte=state,
        standard_location__building=building
    ).select_related("standard_location")
    for section in sections:
        room_mapping[section.standard_location.id] = section

    for room in seated_rooms + nonseated_rooms:
        temp = {"info": {
            "id": room.id, "seats": room.seats, "name": room.name, "short_name": room.short_name
        }}
        section = room_mapping.get(room.id, None)
        if section:
            temp["section"] = {"info": section.info, "id": section.course.id}
        json.append(temp)
    return json

def room_state(room, state, day):
    try:
        temp = {"info": {
            "id": room.id, "seats": room.seats,
            "name": room.name, "short_name": room.short_name
        }}
        current = ongoing_section(room, state, day)
        if current:
            section = current[0]
            temp["section"] = {"info": section.info, "id": section.course.id}
        return temp
    except Exception as e:
        print e
        return []

def section_state(sections):
    try:
        json = []
        for section in sections:
            # want to order by section course number
            room = section.standard_location
            temp = {"info": {
                "id": room.id, "seats": room.seats, "name": room.name, "short_name": room.short_name, "building_id": room.building.id
            }}
            temp["section"] = {"info": section.info, "id": section.course.id}
            json.append(temp)
        return json
    except Exception as e:
        print e
        return []

def ongoing_section(room, state, day):
    """
    given Room parameter, room, returns the first ongoing section object

    """
    return room.section_set.filter(
        semester=ONGOING_SEMESTER,
        year=ONGOING_YEAR,
        disabled=False,
        days__contains=day,
        start_time__lte=state,
        end_time__gte=state
    )

def string_to_state(dt_string):
    """
    converts a string representation of a datetime object to a campus state representation
    of the following format:

    (datetime(1900, 1, 1, time), <day_of_theweek>)

    """
    dt = datetime.datetime.strptime(dt_string, "%m/%d/%Y-%H:%M")
    return datetime_to_state(dt)

def datetime_to_state(dt):
    """
    converts a python datetime object to a campus state representation of the following format:
    (datetime(1900, 1, 1, time), <day_of_theweek>)

    """
    return datetime.datetime.combine(datetime.date(1900, 1, 1), dt.time()), dt.weekday() + 1

@raise_404_if_not_get
@raise_404_on_error
def building(request):
    building_id = request.GET.get("building_id")
    dt_string = request.GET.get("datetime")
    state, day = string_to_state(dt_string)
    building = Building.objects.get(id=building_id)
    json = building_state(building, state, day)
    return render_to_json({
        "rooms": json,
        "building_id": building_id,
        "name": building.name,
    })

def search(request):
    try:
        query = request.GET.get("query")
        dt_string = request.GET.get("datetime")
        state, day = string_to_state(dt_string)
        search_result = parse_search(query, state, day)
        # no results or error
        if isinstance(search_result, str) and search_result in SEARCH_ERROR:
            return render_to_json({"error": search_result, "query": query})
        elif isinstance(search_result, dict):
            json = section_state(search_result["queryset"])
            return render_to_json({
                "rooms": json,
                "name": search_result["query"]
            })
        elif isinstance(search_result, Building):
            json = building_state(search_result, state, day)
            return render_to_json({
                "rooms": json,
                "building_id": search_result.id,
                "name": search_result.name
            })
        elif isinstance(search_result, Room):
            json = room_state(search_result, state, day)
            return render_to_json({
                "room": json,
                "building_id": search_result.building.id,
                "name": search_result.full_name
            })
        else:
            return render_to_json({"error": "unknown error"})
    except Exception as e:
        print e
        return render_to_json({"error": "unknown error"})

def parse_search(query, state, day):
    """
    parses string query (ie. 155 Dwinelle) and returns a dictionary of the following format:
    {building_id: <id>, room_id: <id or None>}, may also return the following strings:

    "multiple results": the query needs to be more specific
    "no results": no building or room was found based on the query
    "no rooms found": a building was found, but no room matched the query

    the function works with the following heuristics:

    a) if the first or last element contains numeric characters, split the query
    into room and building names, query each separately. If a building is found, query room
    name in the building, if not, query the building name as a custom room name

    b) otherwise, query as a building name, if no results are found, query as a custom
    room name

    """
    try:
        query = query.upper()
        # replaces elements in query with standard building names
        for name in name_to_standard_name.keys():
            if name in query:
                query = query.replace(name, name_to_standard_name[name])

        keywords = [keyword.strip() for keyword in query.split(" ")]
        digits = searchtools.parse_digits(query)
        if digits and len(keywords) == 1:
            return course_number_search(keywords[0], state, day)
        # contains room number or address
        elif digits and len(keywords) > 1:
            first = searchtools.parse_digits(keywords[0])
            last = searchtools.parse_digits(keywords[-1])

            # separate room and building names
            if not first and not last:
                return "no results"
            if first:
                room_name, building_name = keywords[0], keywords[1:]
            else:
                room_name, building_name = keywords[-1], keywords[:-1]

            # search through buildings, and if failed, search through custom rooms
            result = building_search(building_name)
            # check if there are any results
            if type(result) == models.query.QuerySet:
                # if buildings were, search through rooms
                result = room_search(room_name, result, only_one=True)

                # hard coded heuristic, length of room name is greater than 4 is probably an address
                if result == "room not found" and len(room_name) > 3:
                    result = building_search(keywords, only_one=True)
                    return result
                # found a single room
                return result
            elif result == "no results":
                result = custom_room_search(building_name, only_one=True)
                if result == "no results":
                    return course_search(keywords, state, day)
            else:
                return result

        # if no numbers are present in the query, search buildings, if failed
        # search custom rooms
        elif not digits:
            result = building_search(keywords, only_one=True)
            if result == "no results":
                result = custom_room_search(keywords, only_one=True)
                if result == "no results":
                    return department_search(keywords, state, day)
                return result
            return result

        else:
            return "no results"
    except Exception as e:
        print e
        return "no results"

def course_number_search(course_number, state, day):
    try:
        sections = Section.objects.filter(
            semester=ONGOING_SEMESTER,
            year=ONGOING_YEAR,
            course_number=course_number,
            disabled=False,
            days__contains=day,
            start_time__lte=state,
            end_time__gte=state,
            standard_location__isnull=False,
            standard_location__building__latitude__isnull=False,
            standard_location__building__longitude__isnull=False,
        )
        courses = sections.distinct("course")
        query = course_number + " (Course Number)"
        if len(courses) == 1:
            query = courses[0].course.department + " " + courses[0].course_number
        return {"queryset": sections, "query": query} if sections else "no results"
    except Exception as e:
        print e

def course_search(keywords, state, day):
    try:
        department, course_number = " ".join(keywords[:-1]), keywords[-1]
        course = Course.objects.filter(course_number=course_number, abbreviation=department)
        if not course:
            course = Course.objects.filter(course_number=course_number, department__iexact=department)
        if course:
            course = course[0]
            sections = course.section_set.filter(
                semester=ONGOING_SEMESTER,
                year=ONGOING_YEAR,
                disabled=False,
                days__contains=day,
                start_time__lte=state,
                end_time__gte=state,
                standard_location__isnull=False,
                standard_location__building__latitude__isnull=False,
                standard_location__building__longitude__isnull=False,
            ).select_related("standard_location__building", "standard_location")
            return {"queryset": sections, "query": course.department + " " + course.course_number}
        return "no results"
    except Exception as e:
        return "no results"

def department_search(keywords, state, day):
    department = " ".join(keywords)
    courses = Course.objects.filter(abbreviation=department)
    if not courses:
        courses = Course.objects.filter(department__iexact=department)
    if courses:
        sections = Section.objects.filter(
            course__in=courses,
            semester=ONGOING_SEMESTER,
            year=ONGOING_YEAR,
            disabled=False,
            days__contains=day,
            start_time__lte=state,
            end_time__gte=state,
            standard_location__isnull=False,
            standard_location__building__latitude__isnull=False,
            standard_location__building__longitude__isnull=False,
        ).select_related("standard_location__building", "standard_location").order_by("course_number")
        return {"queryset": sections, "query": courses[0].department}
    return "no results"


def room_search(room_name, buildings, only_one=False):
    room = Room.objects.filter(building__in=buildings, name=room_name)
    if room and only_one:
        return room[0]
    elif room:
        return room
    else:
        return "room not found"

def building_search(keywords, only_one=False):
    """
    returns a QuerySet of buildings which match the keywords, if only_one, returns a single Building

    """
    buildings_value_dict = Building.objects.exclude(room__isnull=True, latitude__isnull=False).values("name", "id")
    # mapping of building names to ids
    buildings_dict = {p["name"].upper(): p["id"] for p in buildings_value_dict}
    # list of building names
    building_names = buildings_dict.keys()
    result = searchtools.partial_match(building_names, keywords)
    if type(result) == list:
        match_ids = [buildings_dict[name] for name in result]
        buildings = Building.objects.filter(id__in=match_ids)
        if only_one:
            return buildings[0]
        return buildings
    else:
        # "no results" or "too many results"
        return result

def custom_room_search(keywords, only_one=False):
    """
    returns a QuerySet of rooms which match the keywords, if only_one, returns a single room

    """
    custom_rooms = Room.objects.filter(abbreviation__isnull=False).values("name", "id")
    # mapping of room names to ids
    rooms_dict = {r["name"].upper(): r["id"] for r in custom_rooms}
    # list of room names
    room_names = rooms_dict.keys()
    result = searchtools.partial_match(room_names, keywords)
    if type(result) == list:
        match_ids = [rooms_dict[name] for name in result]
        rooms = Room.objects.filter(id__in=match_ids)
        if only_one:
            return rooms[0]
        return rooms
    else:
        # "no results" or "too many results"
        return result

@raise_404_if_not_get
@raise_404_on_error
def room_sections(request):
    """
    Returns a JSON encoded list of data about each of the sections present in the given room.

    """
    room_id = request.GET['room_id']
    day = request.GET['day']
    sections = Section.objects.filter(semester=ONGOING_SEMESTER, year=ONGOING_YEAR, standard_location__id=room_id, days__icontains=day)
    rtn = []
    for section in sections:
        temp = model_to_dict(section, fields=[
            "abbreviation",
            "course_number",
            "course_id",
            "kind",
            "section_number",
            "id",
            "location"
        ])
        temp["start_time"] = time_format(section.start_time)
        temp["end_time"] = time_format(section.end_time)
        temp["course_id"] = section.course.id
        rtn.append(temp)
    return render_to_json(rtn)
