"""Validate a SIS schedule response using Voluptuous."""
from voluptuous import REMOVE_EXTRA
from voluptuous import MultipleInvalid
from voluptuous import Optional
from voluptuous import Schema

from catalog.service.exc import ScheduleValidationException


class ScheduleValidator(object):
    """Section Validator."""

    def __init__(self):
        """Instantiate a validation Schema."""
        schedule = {
            'id': int,
            'number': unicode,
            'class': {
                'course': {
                    'identifiers': [
                        {
                            'type': 'cs-course-id',
                            'id': unicode,
                        },
                    ],
                    'title': unicode,
                },
            },
            'component': {
                'code': unicode,
                'description': unicode,
            },
            'enrollmentStatus': {
                'maxEnroll': int,
                'enrolledCount': int,
                'waitlistedCount': int,
                'maxWaitlist': int,
            },
            'printInScheduleOfClasses': bool,
            'association': {
                'primary': bool,
            },
            Optional('instructionMode'): {
                'code': unicode,
                'description': unicode,
            },
            Optional('meetings'): [
                {
                    'meetsMonday': bool,
                    'meetsTuesday': bool,
                    'meetsWednesday': bool,
                    'meetsThursday': bool,
                    'meetsFriday': bool,
                    'meetsSaturday': bool,
                    'meetsSunday': bool,
                    'startTime': unicode,
                    'endTime': unicode,
                    Optional('location'): {
                        Optional('description'): unicode,
                    },
                    Optional('assignedInstructors'): [
                        {
                            Optional('instructor'): {
                                Optional('names'): [
                                    {
                                        'type': {
                                            'code': unicode,
                                        },
                                        'familyName': unicode,
                                        'givenName': unicode,
                                    },
                                ],
                            },
                        },
                    ],
                },
            ]
        }

        self.schema = Schema(
            {
                'apiResponse': {
                    'httpStatus': {
                        'code': unicode,
                        'description': unicode,
                    },
                    Optional('response'): {
                        # Optional iff sections not found
                        Optional('classSections'): [
                            schedule,
                        ]
                    }
                }
            },
            required=True,
            extra=REMOVE_EXTRA,
        )

    def validate(self, data):
        """Validate a SIS schedule response and return ONLY valid fields."""
        try:
            return self.schema(data)

        except MultipleInvalid as e:
            raise ScheduleValidationException({
                'message': 'Invalid schedule response from SIS',
                'exception': str(e),
            })

schedule_validator = ScheduleValidator()
