import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required
from graphql_relay.node.node import from_global_id
from graphql import GraphQLError

# Meta info
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

# Django models
from django.contrib.auth.models import User
from scheduler.models import Schedule, TimeBlock
from catalog.models import Course, Section

class TimeBlockType(DjangoObjectType):
    class Meta:
        model = TimeBlock
        interfaces = (graphene.Node, )

class ScheduleType(DjangoObjectType):
    class Meta:
        model = Schedule
        interfaces = (graphene.Node, )

class CreateSchedule(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=False)
        year = graphene.String(required=False)
        semester = graphene.String(required=False)
        timezone = graphene.String()
        classes = graphene.List(graphene.ID)

    # output
    schedule = graphene.Field(ScheduleType)

    # @login_required
    def mutate(self, info, timezone, classes, name=None, year=CURRENT_YEAR, semester=CURRENT_SEMESTER):
        user = User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser
        # user = info.context.user.berkeleytimeuser
        
        # fill in with default values
        if not name:
            # default name = "Schedule #"
            count = user.schedules.all().count()
            name = "Schedule " + str(count + 1)  # 1-index

        schedule = Schedule.objects.create(
            user = user,
            timezone = timezone,
            name = name,
            year = year,
            semester = semester
        )

        try:
            for class_id in classes:
                course = Course.objects.get(pk=from_global_id(class_id)[1])
                schedule.classes.add(course)
        except Course.DoesNotExist:
            return GraphQLError('Invalid Class ID')

        schedule.save()
        return CreateSchedule(schedule=schedule)

def forceInt(value):
    try:
        return int(value)
    except ValueError:
        return int(float(value))

class UpdateSchedule(graphene.Mutation):
    class Arguments:
        schedule_id = graphene.ID()
        # year and semester can't be edited
        name = graphene.String(required=False)
        classes = graphene.List(graphene.ID, required=False)
        selected_sections = graphene.List(graphene.ID, required=False)

    schedule = graphene.Field(ScheduleType)

    # @login_required
    def mutate(self, info, schedule_id, name, classes, selected_sections):
        schedule = None
        try:
            schedule = Schedule.objects.get(pk=from_global_id(schedule_id)[1])
        except TimeBlock.DoesNotExist:
            return GraphQLError('Invalid Time Block ID')
        
        # ensure that schedule belongs to the current user
        if info.context.user.berkeleytimeuser != schedule.user:
            return GraphQLError('No permission')

        # update name
        if name:
            schedule.name = name

        # update classes
        if classes:
            unit = 0
            try:
                for class_id in classes:
                    course = Course.objects.get(pk=from_global_id(class_id)[1])
                    unit += forceInt(course.units)
                    schedule.classes.add(course)
            except Course.DoesNotExist:
                return GraphQLError('Invalid Class ID')
            schedule.total_units = unit
        
        # update sections
        if selected_sections:
            try:
                for section_id in selected_sections:
                    section = Section.objects.get(pk=from_global_id(section_id)[1])
                    schedule.selected_sections.add(section)
            except Course.DoesNotExist:
                return GraphQLError('Invalid Section ID')

        schedule.save()
        return CreateTimeBlock(schedule = schedule)

class CreateTimeBlock(graphene.Mutation):
    class Arguments:
        schedule_id = graphene.ID()
        name = graphene.String()
        start_time = graphene.Time()
        end_time = graphene.Time()
        days = graphene.String()

    time_block = graphene.Field(TimeBlockType)
    schedule = graphene.Field(ScheduleType)

    # @login_required
    def mutate(self, info, schedule_id, name, start_time, end_time, days):
        schedule = None
        try:
            schedule = Schedule.objects.get(pk=from_global_id(schedule_id)[1])
        except Schedule.DoesNotExist:
            return GraphQLError('Invalid Schedule ID')
        
        # ensure that the schedule belongs to the current user
        # if info.context.user.berkeleytimeuser != schedule.user:
        user = User.objects.get(email='smxu@berkeley.edu').berkeleytimeuser
        if user != schedule.user:
            return GraphQLError('No permission')

        timeblock = TimeBlock.objects.create(
            schedule = schedule,
            name = name,
            start_time = start_time,
            end_time = end_time,
            days = days
        )
        timeblock.save()

        return CreateTimeBlock(time_block = timeblock, schedule = schedule)

class UpdateTimeBlock(graphene.Mutation):
    class Arguments:
        time_block_id = graphene.ID()
        name = graphene.String(required=False)
        start_time = graphene.Time(required=False)
        end_time = graphene.Time(required=False)
        days = graphene.String(required=False)

    time_block = graphene.Field(TimeBlockType)

    # avaliable fields
    _time_block_fields = (
        'name',
        'start_time',
        'end_time',
        'days'
    )

    # @login_required
    def mutate(self, info, time_block_id, **kwargs):
        timeblock = None
        try:
            timeblock = TimeBlock.objects.get(pk=from_global_id(time_block_id)[1])
        except TimeBlock.DoesNotExist:
            return GraphQLError('Invalid Time Block ID')
        
        # ensure that time blog belongs to the current user
        if info.context.user.berkeleytimeuser != timeblock.schedule.user:
            return GraphQLError('No permission')

        # update attributes
        for key in kwargs:
            if key in UpdateTimeBlock._time_block_fields:
                setattr(timeblock, key, kwargs[key])
        timeblock.save()

        return CreateTimeBlock(time_block = timeblock)

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
    create_time_block = CreateTimeBlock.Field()
    update_time_block = UpdateTimeBlock.Field()
