import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required
from graphql_relay.node.node import from_global_id
from graphql import GraphQLError

# Meta info
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

# Django models
from django.contrib.auth.models import User
from scheduler.models import Schedule, TimeBlock, SectionSelection
from catalog.models import Course, Section


class TimeBlockType(DjangoObjectType):
    class Meta:
        model = TimeBlock
        interfaces = (graphene.Node, )


class SectionSelectionType(DjangoObjectType):
    class Meta:
        model = SectionSelection
        interfaces = (graphene.Node, )


class ScheduleType(DjangoObjectType):
    class Meta:
        model = Schedule
        interfaces = (graphene.Node, )


class SectionSelectionInput(graphene.InputObjectType):
    course = graphene.ID(required=True)
    primary = graphene.ID(required=False)
    secondary = graphene.List(graphene.ID, required=False)


class TimeBlockInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    start_time = graphene.Time(required=True)
    end_time = graphene.Time(required=True)
    days = graphene.String(required=True)


def forceInt(value):
    """
    Returns integer casted from string value
    Also forces float strings into ints since some units are formatted as 3.0
    """
    try:
        return int(value)
    except ValueError:
        return int(float(value))


def set_selected_sections(schedule, selected_sections):
    """
    Update schedule.selected_sections with selected_sections. Selections not in
    selected_sections will be removed. Returns the total unit count.

    Args:
        schedule: scheduler.Schedule object
        selected_sections: List of SectionSelectionInput from mutation

    Returns:
        Total unit count (Integer)
    """
    old_selections = set(schedule.selected_sections.all())
    units = 0
    for selection_input in selected_sections:
        # get course
        course = Course.objects.get(pk=from_global_id(selection_input.course)[1])
        # only one selection for each course-schedule pair
        selection, _ = schedule.selected_sections.get_or_create(
            schedule = schedule,
            course = course
        )
        units += forceInt(course.units)

        # get primary
        if selection_input.primary:
            primary = Section.objects.get(pk=from_global_id(selection_input.primary)[1])
            selection.primary = primary
        else:
            # clear primary selection
            selection.primary = None

        # update list of secondary sections
        if selection_input.secondary:
            # collect secondary sections
            secondary_sections = []
            for secondary_id in selection_input.secondary:
                secondary = Section.objects.get(pk=from_global_id(secondary_id)[1])
                secondary_sections.append(secondary)
            selection.secondary.set(secondary_sections)

        selection.save()
        old_selections.remove(selection)

    # remove not added selections
    for selection in old_selections:
        selection.delete()

    return units


class CreateSchedule(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=False)
        year = graphene.String(required=False)
        semester = graphene.String(required=False)
        selected_sections = graphene.List(SectionSelectionInput, required=False)
        timeblocks = graphene.List(TimeBlockInput, required=False)

    # output
    schedule = graphene.Field(ScheduleType)

    @login_required
    def mutate(self, info, name=None, year=CURRENT_YEAR, semester=CURRENT_SEMESTER,
    selected_sections=None, timeblocks=None):
        user = info.context.user.berkeleytimeuser

        # fill in with default values
        if not name:
            # default name = "Schedule #"
            count = user.schedules.all().count()
            name = "Schedule " + str(count + 1)  # 1-index

        schedule = Schedule.objects.create(
            user = user,
            name = name,
            year = year,
            semester = semester
        )

        # update sections
        if selected_sections is not None:
            # use is not None to allow empty lists for clearing selections
            try:
                # generate section selections
                units = set_selected_sections(schedule, selected_sections)
                # update units
                schedule.total_units = units
            except Course.DoesNotExist:
                return GraphQLError('Invalid Course ID')
            except Section.DoesNotExist:
                return GraphQLError('Invalid Section ID')
        
        # create timeblocks
        if timeblocks:
            for timeblock_input in timeblocks:
                # unique schedule-name pair
                timeblock = schedule.timeblocks.create(
                    schedule = schedule,
                    name = timeblock_input.name,
                    start_time = timeblock_input.start_time,
                    end_time = timeblock_input.end_time,
                    days = timeblock_input.days,
                )
                timeblock.save()

        # save objects
        schedule.save()

        return CreateSchedule(schedule=schedule)


class UpdateSchedule(graphene.Mutation):
    class Arguments:
        schedule_id = graphene.ID()
        # year and semester can't be edited
        name = graphene.String(required=False)
        selected_sections = graphene.List(SectionSelectionInput, required=False)
        timeblocks = graphene.List(TimeBlockInput, required=False)

    schedule = graphene.Field(ScheduleType)

    @login_required
    def mutate(self, info, schedule_id, name=None, selected_sections=None, timeblocks=None):
        schedule = None
        try:
            schedule = Schedule.objects.get(pk=from_global_id(schedule_id)[1])
        except Schedule.DoesNotExist:
            return GraphQLError('Invalid Schedule ID')
        
        # ensure that schedule belongs to the current user
        if info.context.user.berkeleytimeuser != schedule.user:
            return GraphQLError('No permission')

        # update name
        if name:
            schedule.name = name
        
        # update sections
        if selected_sections is not None:
            # use is not None to allow empty lists for clearing selections
            try:
                # generate section selections
                units = set_selected_sections(schedule, selected_sections)
                # update units
                schedule.total_units = units
            except Course.DoesNotExist:
                return GraphQLError('Invalid Course ID')
            except Section.DoesNotExist:
                return GraphQLError('Invalid Section ID')

        # update timeblocks
        if timeblocks is not None:
            saved_timeblocks = set()
            for timeblock_input in timeblocks:
                # unique schedule-name pair
                timeblock, new_timeblock = schedule.timeblocks.get_or_create(
                    schedule = schedule,
                    name = timeblock_input.name,
                    defaults = {
                        'start_time': timeblock_input.start_time,
                        'end_time': timeblock_input.end_time,
                        'days': timeblock_input.days,
                    }
                )
                
                # manually override values if old 
                if not new_timeblock:
                    timeblock.start_time = timeblock_input.start_time
                    timeblock.end_time = timeblock_input.end_time
                    timeblock.days = timeblock_input.days
                
                timeblock.save()
                saved_timeblocks.add(timeblock)
            
            # remove not added timeblocks
            removed_timeblocks = set(schedule.timeblocks.all()) - saved_timeblocks
            for timeblock in removed_timeblocks:
                timeblock.delete()

        schedule.save()
        return UpdateSchedule(schedule = schedule)


class Query(graphene.ObjectType):
    schedules = graphene.List(ScheduleType)

    def resolve_schedules(self, info):
        # if info.context.user.is_authenticated:
        #     return info.context.user.berkeleytimeuser
        # return None
        # testing:
        return User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser.schedules.all()


class Mutation(graphene.ObjectType):
    create_schedule = CreateSchedule.Field()
    update_schedule = UpdateSchedule.Field()
