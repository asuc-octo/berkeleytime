import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required
from graphql_relay.node.node import from_global_id
from graphql import GraphQLError

# Meta info
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

# Django models
from scheduler.models import Schedule, TimeBlock, SectionSelection
from catalog.models import Course, Section


# =======================
#     Graphene Types
# =======================

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


# =======================
#     Graphene Inputs
# =======================

class SectionSelectionInput(graphene.InputObjectType):
    course = graphene.ID(required=True)
    primary = graphene.ID(required=False)
    secondary = graphene.List(graphene.ID, required=False)


class TimeBlockInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    start_time = graphene.Time(required=True)
    end_time = graphene.Time(required=True)
    days = graphene.String(required=True)


# =======================
#       Mutataions
# =======================

def set_selected_sections(schedule, selected_sections):
    """
    Update schedule.selected_sections with selected_sections. Selections not in
    selected_sections will be removed.

    Args:
        schedule: scheduler.Schedule object
        selected_sections: List of SectionSelectionInput from mutation
    """
    old_selections = set(schedule.selected_sections.all())
    for selection_input in selected_sections:
        # get course
        course = Course.objects.get(pk=from_global_id(selection_input.course)[1])
        # only one selection for each course-schedule pair
        selection, _ = schedule.selected_sections.get_or_create(
            schedule = schedule,
            course = course
        )

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
        old_selections.discard(selection)

    # remove not added selections
    for selection in old_selections:
        selection.delete()


class CreateSchedule(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=False)
        year = graphene.String(required=False)
        semester = graphene.String(required=False)
        selected_sections = graphene.List(SectionSelectionInput, required=False)
        timeblocks = graphene.List(TimeBlockInput, required=False)
        total_units = graphene.String(required=False)
        public = graphene.Boolean(required=False, default_value=False)

    # output
    schedule = graphene.Field(ScheduleType)

    @login_required
    def mutate(self, info, name=None, year=CURRENT_YEAR, semester=CURRENT_SEMESTER,
        selected_sections=None, timeblocks=None, total_units=None, public=False):
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
            semester = semester,
            public = public
        )

        # update units
        if total_units and len(total_units) <= 16:
            schedule.total_units = total_units

        # update sections
        if selected_sections is not None:
            # use is not None to allow empty lists for clearing selections
            try:
                # generate section selections
                set_selected_sections(schedule, selected_sections)
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
        total_units = graphene.String(required=False)
        public = graphene.Boolean(required=False)

    schedule = graphene.Field(ScheduleType)

    @login_required
    def mutate(self, info, schedule_id, name=None, selected_sections=None,
        timeblocks=None, total_units=None, public=None):
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

        # update public
        if public is not None:
            schedule.public = public

        # update units
        if total_units and len(total_units) <= 16:
            schedule.total_units = total_units
        
        # update sections
        if selected_sections is not None:
            # use is not None to allow empty lists for clearing selections
            try:
                # generate section selections
                set_selected_sections(schedule, selected_sections)
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


class RemoveSchedule(graphene.Mutation):
    class Arguments:
        schedule_id = graphene.ID()

    schedule = graphene.Field(ScheduleType)

    @login_required
    def mutate(self, info, schedule_id):
        schedule = None
        try:
            schedule = Schedule.objects.get(pk=from_global_id(schedule_id)[1])
        except Schedule.DoesNotExist:
            return GraphQLError('Invalid Schedule ID')
        
        # ensure that schedule belongs to the current user
        if info.context.user.berkeleytimeuser != schedule.user:
            return GraphQLError('No permission')
        
        # remove schedule
        schedule.delete()
        return RemoveSchedule(schedule)


# =======================
#        Graphene
# =======================

class Query(graphene.ObjectType):
    schedules = graphene.List(ScheduleType)
    schedule = graphene.Field(ScheduleType, id=graphene.ID())

    def resolve_schedules(self, info):
        """ Query all schedules from the user """
        if info.context.user.is_authenticated:
            return info.context.user.berkeleytimeuser.schedules.all()
        return None

    def resolve_schedule(self, info, id):
        """ Query a single schedule based on id """
        try:
            schedule = Schedule.objects.get(pk=from_global_id(id)[1])

            # ensure that schedule belongs to the current user
            is_owner = False
            if info.context.user.is_authenticated:
                is_owner = info.context.user.berkeleytimeuser == schedule.user
            
            # don't show private schedules to non-owner
            if not is_owner and not schedule.public:
                return GraphQLError('No permission')
            return schedule
        except Schedule.DoesNotExist:
            return GraphQLError('Invalid Schedule ID')


class Mutation(graphene.ObjectType):
    create_schedule = CreateSchedule.Field()
    update_schedule = UpdateSchedule.Field()
    remove_schedule = RemoveSchedule.Field()
