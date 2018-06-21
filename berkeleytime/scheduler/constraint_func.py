from scheduler.lib.schedule_csp import ScheduleCSP
from datetime import date, time, datetime

class InitialConstraint:
    """
    Constraint function that eliminates (prunes) or sorts the domain.
    """

    def call(self, domain):
        updated_domain = []
        for section in domain:
            if self._satisfies_constraint(section):
                updated_domain.append(section)
        return updated_domain

    def _satisfies_constraint(self, section):
        return True


class PruneDeadDays(InitialConstraint):
    def __init__(self, dead_days):
        # param dead_days: dead_days (no classes on these days)

        self.dead_days = dead_days

    def _satisfies_constraint(self, section):
        for day in section.days:
            if day in self.dead_days:
                return False
        return True


class LimitStartEndTimes(InitialConstraint):
    def __init__(self, start_time, end_time):
        """
        :param start_time: earliest start_time
        :param end_time: latest end_time
        """
        self.start_time = start_time
        self.end_time = end_time

    def _satisfies_constraint(self, section):
        if (section.start_time < self.start_time or section.end_time >= self.end_time or
                    section.start_time >= self.end_time or section.end_time <= self.start_time):
            return False
        return True


class PreferMorning(InitialConstraint):
    def call(self, domain):
        # Compare the start time; the earlier start time the better
        return sorted(domain, cmp=None, key=lambda x: x.start_time, reverse=False)


class PreferAfternoon(InitialConstraint):
    def call(self, domain):
        # Compare the start time; the later start time the better
        return sorted(domain, cmp=None, key=lambda x: x.start_time, reverse=True)


class PreferMidday(InitialConstraint):
    def call(self, domain):
        # Compare the start time; sort by distance from 1 pm
        d = date(1900, 1, 1)
        midday = datetime.combine(d, time(13, 0))
        return sorted(domain, cmp=None, key=lambda x: abs(x.start_time - midday), reverse=False)


class OnDemandHardConstraint:
    # I think this class doesn't need a init  --Flora

    def call(self, old_time_slots, new_assigned_val):
        """Round a datetime object to any time laps in seconds
        @param   old_time_slots      old times slots before assigning the new value
        @type    old_time_slots      Counter {K:V} ~ {(2-2:30):0} K: time slot, V: number of assigned sections
        @param   new_assigned_val    new value to be assigned
        @type    new_assigned_val    list
        @return  True/False
        """
        # default constraint prevents time conflicts, i.e. no more than 1 section assigned to a time slot
        for time_value in new_assigned_val:
            # at least one section has already been assigned to this time slot
            if old_time_slots[time_value] > 0:
                return False
        return True


class PostGenerationRankingConstraint:
    # @param rank_func  function  higher order function of ranking
    # @param reverse    boolean   is increasing order or not
    def __init__(self, rank_func, reverse):
        self.rank_func = rank_func
        self.reverse = reverse

    def call(self, generated_schedules):
        return sorted(generated_schedules, cmp=None, key=self.rank_func, reverse=self.reverse)



def sum_diff(sched):
    # key_list is a list of assigned time slots [("1", datetime(1900-01-01, 2:00:00))]
    # key[0] gets the day, key[1] gets the datetime object
    key_list = sorted(sched_to_list(sched), cmp=sort_sections)
    # the total time difference
    tot = None
    # iterate through all the time slots
    for i in range(len(key_list) - 1):
        key1 = key_list[i]
        key2 = key_list[i + 1]
        # if it's the same day:
        if key1[0] == key2[0]:
            val_diff = key1[1] - key2[1]
            if not tot:
                tot = val_diff
            else:
                tot += val_diff
    return tot


def total_num_days(sched):
    # key_list is a list of assigned time slots [("1", datetime(1900-01-01, 2:00:00))]
    # key[0] gets the day, key[1] gets the datetime object
    key_list = sched_to_list(sched)
    seen = []
    for section in key_list:
        if section[0] not in seen:
            seen.append(section[0])
    return len(seen)


def sched_to_list(sched):
    key_list = []  # key_list is a list of assigned time slots [("1", datetime(1900-01-01, 2:00:00))]
    for section in sched:
        for day in section.days:
            key_list.append((day, section.start_time))
    return key_list


class MinimizeGaps(PostGenerationRankingConstraint):
    def __init__(self, reverse=False):
        PostGenerationRankingConstraint.__init__(self, sum_diff, reverse)


class MaximizeGaps(PostGenerationRankingConstraint):
    def __init__(self, reverse=True):
        PostGenerationRankingConstraint.__init__(self, sum_diff, reverse)


class MinimizeDays(PostGenerationRankingConstraint):
    def __init__(self, reverse=False):
        PostGenerationRankingConstraint.__init__(self, total_num_days, reverse)


class MaximizeDays(PostGenerationRankingConstraint):
    def __init__(self, reverse=True):
        PostGenerationRankingConstraint.__init__(self, total_num_days, reverse)
