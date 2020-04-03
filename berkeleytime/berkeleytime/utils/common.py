"""Common utils for all of Berkeleytime."""
from collections import namedtuple
from threading import Lock

CourseOffering = namedtuple(
    'CourseOffering',
    ['semester', 'year', 'abbreviation', 'course_number']
)

class AtomicInteger:
    def __init__(self, value=0):
        self._value = value
        self._lock = Lock()

    def inc(self):
        with self._lock:
            self._value += 1
            return self._value

    def dec(self):
        with self._lock:
            self._value -= 1
            return self._value

    def value(self):
        with self._lock:
            return self._value

class BColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'