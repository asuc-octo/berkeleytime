import requests
import json

# pymongo for mongodb
import pymongo

# django email
from django.core.management.base import BaseCommand
from django.core.mail.message import EmailMultiAlternatives
from django.core.mail import get_connection
from django.template.loader import render_to_string

# telebears
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

# testing
from django.contrib.auth.models import User


# ======================================================
#                        Config
# ======================================================

PERCENTAGE_THRESHOLDS = [0.50, 0.75]
MOMENTUM_THRESHOLD = 0.2

# ======================================================
# Fetch real time (~2min) data from Course Catalog's API
# ======================================================

def scrape_enrollment(section_number):
    """ Returns a dictionary from Course Catalog's endpoint
    for a class. Returns an empty dictionary if failed to get data. """
    # TODO: Cache this
    try:
        # 2212 changes for every semester,
        # there seems to be a pattern not sure how we can get it yet...
        course_req = requests.get(f'https://classes.berkeley.edu/enrollment/get/2212/{section_number}')
        course = course_req.json()
        
        # error, most likely section number not found
        if 'error' in course:
            print(course['error'])
            return {}
        
        # success
        return course
    except requests.exceptions.RequestException:
        # request error
        return {}

def scrape_sections(section_number):
    """ Returns a list dictionaries corresponding to the secondary sections
    of the class. Returns an empty list if failed to get data. """
    # TODO: Cache this
    try:
        sections_req = requests.get(f'https://classes.berkeley.edu/enrollment/json-all-associated-sections/{section_number}/{section_number}/2212')
        sections = sections_req.json()
        # error, most likely section number not found
        if 'error' in sections:
            print(sections['error'])
            return []
        if 'nodes' not in sections:
            # no section?
            return []
        return sections['nodes']
    except requests.exceptions.RequestException:
        # request error
        return []

# ======================================================
#       Parse json outputs of Course Catalog API
# ======================================================

def parse_enrollment_json(enrollment_json):
    """ Returns a dictionary with relevant enrollment information extracted from
    the course catalog's output dictionary. """
    enrolled = enrollment_json['available']['enrollmentStatus']['enrolledCount']
    max_enrolled = enrollment_json['available']['enrollmentStatus']['maxEnroll']
    waitlisted = enrollment_json['available']['enrollmentStatus']['waitlistedCount']
    max_waitlisted = enrollment_json['available']['enrollmentStatus']['maxWaitlist']
    return {
        'enrolled': enrolled,
        'max_enrolled': max_enrolled,
        'waitlisted': waitlisted,
        'max_waitlisted': max_waitlisted
    }

def parse_section_json(section_json):
    """ Returns a dictionary with relevant section information extracted from
    the output list from the course catalog's section endpoint. """
    node = section_json['node']
    section_info = json.loads(node['json'])
    section_enrollment = json.loads(node['enrollment_import'])
    return section_info, parse_enrollment_json(section_enrollment)

# ======================================================
#      Store/Fetch enrollment states in MongoDB
# ======================================================

def get_previous_state(section_number, enrollment_collection):
    """ Returns the previous enrollment state of SECTION_NUMBER from mongo db. """
    # retrieve previous state from mongo
    state = enrollment_collection.find_one({"_id": str(section_number)})
    return state

def set_state(section_number, enrollment_state, enrollment_collection):
    # TODO: Update Mongo db after fetching
    pass

# ======================================================
#          Checks for sending notifications
# ======================================================

# if new seats open up
def check_has_new_seats(new_enrollment, last_enrollment):
    """ Returns if there are new seats added to the class """
    return new_enrollment['max_enrolled'] > last_enrollment['max_enrolled']

# if class is getting popular
def pass_percentage(count, max):
    """ Returns the percentage bounded to PERCENTAGE_THRESHOLDS """
    percent = count / max
    for threshold in sorted(PERCENTAGE_THRESHOLDS, reverse=True):
        # reverse so we compare larger thresholds first
        if percent > threshold:
            return threshold
    return 0

def check_past_threshold(new_enrollment, last_enrollment):
    """ Returns if the enrolled percentage passed a new threshold in PERCENTAGE_THRESHOLDS """
    last_percent = pass_percentage(last_enrollment['enrolled'], last_enrollment['max_enrolled'])
    percent = pass_percentage(new_enrollment['enrolled'], new_enrollment['max_enrolled'])

    if percent and percent != last_percent:
        # new percentage
        return percent
    else:
        return 0

# if class is full
def check_is_full(new_enrollment, last_enrollment):
    return last_enrollment['enrolled'] < last_enrollment['max_enrolled'] and \
        new_enrollment['enrolled'] >= new_enrollment['max_enrolled']

# if enrollment has momentum
def check_momentum(new_enrollment, last_enrollment):
    """ Returns if the enrolled percentage increased by more than MOMENTUM_THRESHOLD
    since the previous update """
    enrolled_percent = new_enrollment['enrolled']  / new_enrollment['max_enrolled']
    last_percent = last_enrollment['enrolled']  / last_enrollment['max_enrolled']
    momentum = enrolled_percent - last_percent
    return (momentum >= MOMENTUM_THRESHOLD) * momentum

# aggregate all checks
def check_all(new_enrollment, last_enrollment):
    """ Returns a list of tuples containing all of passed checks with their
    relevant information as [('check_name', check_data),] """
    notifs = []
    if check_has_new_seats(new_enrollment, last_enrollment):
        notifs.append(('new_seats', ))
    past_threshold = check_past_threshold(new_enrollment, last_enrollment)
    if past_threshold:
        notifs.append(('past_threshold', past_threshold))
    if check_is_full(new_enrollment, last_enrollment):
        notifs.append(('is_full', ))
    momentum = check_momentum(new_enrollment, last_enrollment)
    if momentum:
        notifs.append(('momentum', momentum))
    return notifs

# ======================================================
#                   Django Command
# ======================================================

class Command(BaseCommand):
    """python manage.py email_notification"""

    def add_arguments(self, parser):
        # TODO: Add args (e.g. clear states)
        pass

    def send_mass_html_mail(self, datatuple, fail_silently=False, connection=None):
        # TODO: Add email template for notifications
        connection = connection or get_connection(
            fail_silently=fail_silently,
        )
        messages = [
            EmailMultiAlternatives(subject=subject, body=message, to=(recipient,),
                                alternatives=[(html_message, 'text/html')],
                                connection=connection)
            for subject, message, html_message, recipient in datatuple
        ]
        return connection.send_messages(messages)

    def handle(self, *args, **options):
        print('Running python3 manage.py email_notification')
        
        # start pymongo connection
        client = pymongo.MongoClient("whyareyoureadingthis")
        btdb = client.bt
        enrollment_collection = btdb.enrollment

        # testing
        # TODO: Change this
        user = User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser
        
        # use saved classes for now
        # TODO: Add another field for notification classes
        saved_classes = user.saved_classes.all()

        notifs = []
        for saved_class in saved_classes:
            # get primary sections of the class
            primary_sections = saved_class.section_set.all().filter(
                semester=CURRENT_SEMESTER,
                year=CURRENT_YEAR,
                is_primary=True,
                section_number__iregex=r'^.{4,}$' # section numbers with length 4 or more
                # and disabled=False but removing this bc all of them are disabled rn
            )

            class_notifs = []
            # get enrollment notifications for each section
            for primary_section in primary_sections:
                # fetch enrollment json from api
                section_number = primary_section.section_number
                section_json = scrape_enrollment(section_number)

                # parse json for enrollment info
                new_enrollment = parse_enrollment_json(section_json)
                
                # get previous state from mongo
                last_enrollment = get_previous_state(section_number, enrollment_collection)

                # check for notifications
                primary_notifs = check_all(new_enrollment, last_enrollment)
                class_notifs.append((primary_section, primary_notifs))

                # TODO: Add checks for secondary sections also
                # secondary_sections = scrape_sections(section_number)
                # for secondary_section_json in secondary_sections:
                #     sec_section_info, sec_section_enrollment = parse_section_json(secondary_section_json)
            
            notifs.append((saved_class, class_notifs))
        
        # notifs structure:
        # [
        #   (class,
        #       [
        #           (primary section, [('is_full'), ('momentum', 0.5)]),
        #           (primary section 2, ...)
        #       ]
        #   ),
        #   (class 2, ...)
        # ]

        # TODO: Change this into sending emails
        for class_notif in notifs:
            print('===========')
            class_model, primary_notifs = class_notif
            print(class_model.abbreviation, class_model.course_number, class_model.title)
            for primary_section, section_notifs in primary_notifs:
                print(primary_section.section_number)
                print(section_notifs)
