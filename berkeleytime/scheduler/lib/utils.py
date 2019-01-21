from scheduler.models import Schedule
from catalog.models import Section

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

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


def parse_section_ids(request, key):
    """
    Takes a request and tries to parse a list of Section instances from the db
    using section ccns included in the request, otherwise return an empty list

    @param request: a request, key: the key in the POST dict to extract
    @return: a list of section ids
    """
    section_list = []
    passed_schedule = json.loads(request.POST.get(key))["sectionInfo"][0]
    if type(passed_schedule) is dict:
        passed_schedule = passed_schedule["sections"]
    section_ccns_list = [int(i) for i in passed_schedule]

    sections_list = []
    for ccn in section_ccns_list:
        try:
            section = Section.objects.filter(ccn=ccn, semester=CURRENT_SEMESTER, year=CURRENT_YEAR) \
                .order_by("-last_updated")[0]
            sections_list.append(section)
        except IndexError:
            continue

    return sections_list


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
