from scheduler.models import Schedule
from catalog.models import Section

from berkeleytime.settings import CURRENT_SEMESTER
from berkeleytime.settings import CURRENT_YEAR

import json


def parse_gmail(request):
    """
    Takes a request and parses the gmail address from it providing it is valid
    and authenticated as expected, otherwise return an empty string

    @param request: a request
    @return: email address of the authenticated user
    """
    try:
        user_dict = request.user.socialaccount_set.filter(provider='google')[0].extra_data
        return user_dict['email']
    except (AttributeError, KeyError):
        return ""


def parse_section_ids(request):
    """
    Takes a request and tries to parse a list of Section instances from the db
    using section ccns included in the request, otherwise return an empty list

    @param request: a request
    @return: a list of section ids
    """
    try:
        input_name = request.POST.keys()[1]
        passed_schedule = json.loads(request.POST.get(input_name))["sectionInfo"][0]
        if type(passed_schedule) is dict:
            passed_schedule = passed_schedule["sections"]
        section_ccns_list = [int(i) for i in passed_schedule]
        return Section.objects.filter(
            ccn__in=section_ccns_list,
            semester=CURRENT_SEMESTER,
            year=CURRENT_YEAR
        )
    except (AttributeError, KeyError):
        return []

def parse_schedule_id(request):
    """
    Takes a request and tries to parse a unique id associated with the schedule, otherwise returns -1

    @param request: a request
    @return: an integer unique to a schedule
    """
    try:
        if request.POST.keys()[0] == 'csrfmiddlewaretoken':
            input_name = request.POST.keys()[1]
        else:
            input_name = request.POST.keys()[0]
        return json.loads(request.POST.get(input_name))["uid"]
    except (AttributeError, KeyError):
        return -1
