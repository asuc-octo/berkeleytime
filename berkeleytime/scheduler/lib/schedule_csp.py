import datetime
import time

from schedule_wrapper import ScheduleWrapper
from collections import Counter


# Hacky time testing with time module ...
def print_time(method):
    def timed(*args, **kw):
        ts = time.time()
        result = method(*args, **kw)
        te = time.time()

        print '%r (%r, %r) %2.2f sec' % \
              (method.__name__, args, kw, te - ts)
        return result

    return timed


class ScheduleCSP:
    """
    Class to represent a Schedule CSP in our Usage Case
    Static Constants below - can be set to match usage:
    @HOURS_PER_DAY      assuming classes from 6AM to 12 AM
    @HOUR_PARTITIONS    classes either start on the hour or on the half hour
    @DAYS_PER_WEEK      number of days per week that there are classes
    @TIME_DELTA         datetime.timedelta object to represent smallest hour partition
    """
    HOURS_PER_DAY = 18
    HOUR_PARTITIONS = 2
    DAYS_PER_WEEK = 7
    TIME_DELTA = datetime.timedelta(hours=1.0 / HOUR_PARTITIONS)  # 1.0 because of Python2.7 '/' behavior

    def __init__(self,
                 selected_dict,
                 initial_constraints,
                 on_demand_hard_constraints,
                 on_demand_ranking_constraints,
                 max_schedules=10000):
        """
        @param selected_dict                     dict of sections that the user selected
        @type  vars_dict                         dict {K: V} ~ {section_name: [selected_sections]}
        @param initial_constraints               constraints that will be applied before CSP chain
        @type  initial_constraints               PruneConstraint instance
        @param on_demand_hard_constraints        constraints that will be applied during CSPChainNode assign
        @type  on_demand_hard_constraints        OnDemandConstraint instance
        @param on_demand_ranking_constraints     constraints that will be applied during CSPChainNode init
        @type  on_demand_ranking_constraints     RankingConstraint instance
        """
        self.selected_dict = selected_dict
        self.initial_constraints = initial_constraints
        self.on_demand_hard_constraints = on_demand_hard_constraints
        self.on_demand_ranking_constraints = on_demand_ranking_constraints
        self.time_slots = Counter()
        self.sorted_section_names = None
        self.csp_chain = None
        self.schedules = []  # is a list of SectionTime objects
        self.max_schedules = max_schedules

    @staticmethod
    def _round_time(dt):
        """Round a datetime object to any time laps in seconds
        @param   dt       datetime to round
        @type    dt       datetime object
        @return  datetime object rounded to TIME_DELTA
        """
        cutoff = ScheduleCSP.TIME_DELTA.seconds
        seconds = (dt.replace(tzinfo=None) - dt.min).seconds
        rounding = (seconds + cutoff / 2) // cutoff * cutoff
        return dt + datetime.timedelta(0, rounding - seconds, -dt.microsecond)

    @staticmethod
    def _translate(section):
        """Translates a datetime object into a list of corresponding time slot keys
        @param  section     a section object to translate
        @type   section     Section model instance
        @return list of time slots i.e. tuple [] ~ [(day, datetime object)] for section
        """
        start = ScheduleCSP._round_time(section.start_time)
        end = ScheduleCSP._round_time(section.end_time)
        time_keys = []
        while start < end:
            for day in section.days:
                time_keys.append((day, start))
            start += ScheduleCSP.TIME_DELTA
        return time_keys

    @staticmethod
    def _print_schedule(schedule):
        for section_name in schedule:
            schedule[section_name].print_section(section_name)
        print "------"

    def _hard_constraints_satisfied(self, section):
        """
        Checks if all hard constraints are satisfied for assignments currently in time slots
        """
        for constraint in self.on_demand_hard_constraints:
            time_keys = ScheduleCSP._translate(section)
            if not constraint.call(self.time_slots, time_keys):
                return False
        return True

    def _apply_initial_constraints(self):
        """
        Applies initial constraints for the CSP and prunes the domain for all sections
        """
        for section_name in self.selected_dict:
            sections = self.selected_dict[section_name]
            for constraint in self.initial_constraints:
                pruned_domain = constraint.call(sections)
                if len(pruned_domain) == 0:
                    return False
                self.selected_dict[section_name] = pruned_domain
        return True

    def _LRV_sort_primary_secondary_sections(self, selected_dict):
        # maps K: section_name, V: number of sections
        primary = {}
        secondary = {}

        for section_name in selected_dict:
            selected_sections = selected_dict[section_name]
            if len(selected_sections) > 0:
                if selected_sections[0].is_primary:
                    primary[section_name] = len(selected_sections)
                else:
                    secondary[section_name] = len(selected_sections)

        sorted_primary = sorted(primary, key=lambda x: primary[x])
        sorted_secondary = sorted(secondary, key=lambda x: secondary[x])
        return sorted_primary + sorted_secondary

    def _add_to_time_slot(self, section):
        for time_key in ScheduleCSP._translate(section):
            self.time_slots[time_key] += 1

    def _remove_from_time_slot(self, section):
        for time_key in ScheduleCSP._translate(section):
            self.time_slots[time_key] -= 1

    def _check_should_backtrack(self, node):
        """
        Advances the node parameter and returns whether or not a next valid assignment exists for that node's domain.
        """
        while not self._hard_constraints_satisfied(node.get_assignment()):
            # reached the end of domain for the node
            if not node.advance_assignment():
                return True
        return False

    def _backtrack_and_advance_assignment(self):
        """
        This backtracking method is called when a new_node in the chain cannot be created (since the curr_node's assignment cannot be produce any valid nodes)

        Updates `time_slot`, `csp_chain`, and `csp_chain.curr_node` values.
        It sets those values to the state where the next valid assignment occurs after backtracking node(s).

        @return: True   when backtracing finds the next valid assignment for some curr_node.
        @return: False  if backtracking indicates that the csp_algorithm should terminate (when all domains exhausted).
        """
        while self.csp_chain.length > 0:
            # remove curr_node's assignment since it can produce no valid nodes after
            self._remove_from_time_slot(self.csp_chain.curr_node.get_assignment())

            if self.csp_chain.curr_node.advance_assignment():
                if not self._check_should_backtrack(self.csp_chain.curr_node):
                    # valid assignment exists
                    self._add_to_time_slot(self.csp_chain.curr_node.get_assignment())
                    return True

            # either reached end of curr_node's domain or no valid assignments possible
            # backtrack again by moving curr_node to previous node and continue the loop
            self.csp_chain.remove_tail()
        return False

    def _run_csp_algorithm(self):
        """
        Runs the CSP algorithm and returns all of the valid schedules.
        """
        # Quick exit if no data is found in the db to match section ids
        if not self.selected_dict:
            return []

        self.csp_chain = CSPChain()

        while self.csp_chain.length >= 0 and len(self.schedules) < self.max_schedules:

            # everything in chain has been assigned
            if self.csp_chain.length == len(self.sorted_section_names):
                self._append_schedule(self.csp_chain)

                self._remove_from_time_slot(self.csp_chain.curr_node.get_assignment())

                # last node already created, so just remove current assignment, iterate through rest of domain, and add valid schedules
                while self.csp_chain.curr_node.advance_assignment():
                    if self._hard_constraints_satisfied(self.csp_chain.curr_node.get_assignment()):
                        self._append_schedule(self.csp_chain)

                # guaranteed that last domain exhausted here, so backtrack and remove last node
                self.csp_chain.remove_tail()

                # find the next valid assignment
                if not self._backtrack_and_advance_assignment():
                    break

            # create a new_node and attempt to add it to the chain
            section_name = self.sorted_section_names[self.csp_chain.length]
            new_node = CSPChainNode(section_name, self.selected_dict[section_name])

            # checks if there exists a valid assignment for new_node given what has already been assigned in csp_chain
            if not self._check_should_backtrack(new_node):
                self._add_to_time_slot(new_node.get_assignment())
                self.csp_chain.append_node(new_node)
            # find the next valid assignment
            elif not self._backtrack_and_advance_assignment():
                break

        return self.schedules

    def _append_schedule(self, csp_chain):
        # TODO rankings

        # sorted_time_slot = sorted(list(self.time_slots.keys()), key=lambda x: (x[0], x[1]))
        if len(self.schedules) < self.max_schedules:
            user_schedule = ScheduleWrapper(csp_chain.get_schedule_ccns())
            self.schedules.append(user_schedule)

    @print_time
    def generate_schedules(self):
        """
        Method to generate all schedules of the CSP, stores results in self and returns results
        @return     list of generated schedules
        """
        # TODO: an initial constraint filtering nonempty variables?

        # initial constraints already fail (one pruned domain is empty), so no schedules can be valid
        if not self._apply_initial_constraints():
            return self.schedules

        # use LRV to sort primary sections first, then secondary sections after
        self.sorted_section_names = self._LRV_sort_primary_secondary_sections(self.selected_dict)

        # runs algorithm and populates self.schedules with all generate schedules
        self._run_csp_algorithm()

        # TODO: on_demand_ranking_constraints on generated self.schedules

        return self.schedules


"""
Internal Classes
"""


class CSPChain:
    """
    Class to represent CSP chain for a CSP problem
    """

    def __init__(self):
        self.curr_node = None
        self.length = 0

    def append_node(self, node):
        if self.curr_node is None:
            self.curr_node = node
        else:
            self.curr_node.next_node = node
            node.prev_node = self.curr_node
            self.curr_node = node
        self.length += 1

    def remove_tail(self):
        self.curr_node = self.curr_node.prev_node
        if self.curr_node is not None:
            self.curr_node.next_node = None
        self.length -= 1

    def get_schedule_ccns(self):
        """
        @return    list of ccns in current chain
        """
        schedule = []
        node = self.curr_node
        while node is not None:
            schedule.append(node.get_assignment().ccn)
            node = node.prev_node
        return schedule

    def get_schedule(self):
        """
        @return    list of sections in current chain
        """
        schedule = []
        node = self.curr_node
        while node is not None:
            schedule.append(node.get_assignment())
            node = node.prev_node
        return schedule


class CSPChainNode:
    """
    Class to represent a node in the CSP Chain
    """

    def __init__(self, section_name, domain):
        """
        @param   section_name   variable to make node for, should only be one node for each variable
        @param   domain         list of sections for the section_name
        """
        self.section_name = section_name
        self.domain = domain
        self.index = 0  # which part of the domain you're on
        self.prev_node = None
        self.next_node = None

    def advance_assignment(self):
        """
        Attempts to advance assignment for this node's variable
        If the index exceeds domain length, reset index and attempt to advance a prior node
        First Node cannot reset since there are no nodes prior to it
        @param      assignments     assignments data structure to modify with new assignments
        @type       assignments     dict {K: V} ~ {variable: assignment}
        @return     boolean representing if assignment advancement was successful
        """
        can_advance_assignment = self.index + 1 < len(self.domain)
        if can_advance_assignment:
            self.index += 1
        return can_advance_assignment

    def get_section_name(self):
        return self.section_name

    def get_assignment(self):
        """
        Get the assignment for this node/variable
        @return the value currently assigned to the variable in this node
        """
        return self.domain[self.index]
