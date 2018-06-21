from scheduler.models import Schedule

"""
Wrapper classes over the scheduler/models.py classes.
These objects are what is returned to the front-end.
"""

class ScheduleWrapper:
    """
    Represents a ScheduleWrapper object that holds a list of Section objects.

    @param sections list of section ccns
    """
    def __init__(self, sections):
        self.sections = sections

    def get_sections(self):
        return self.sections

    @classmethod
    def from_schedule(cls, schedule):
        return {"sections": [section.ccn for section in schedule.sections.all()], "uid": schedule.uid}

    # TODO: marking this as deprecated, should probably port save/delete functionality to this model in the future
    def save_as_schedule_model(self, user_profile):
        # user_schedule = Schedule.objects.create(user_profile=user_profile)
        # for section_name, section_model in self.sections.iteritems():
        #     user_schedule.sections.add(section_model)
        # return user_schedule
        return
