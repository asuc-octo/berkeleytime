from enum import Enum


class PrintableEnum(Enum):
    """Abstract class."""

    def __repr__(self):
        return self.value


class PlaylistCategory(PrintableEnum):
    """Playlist categories."""

    haas = 'haas'
    ls = 'ls'
    reading = 'reading'
    university = 'university'
    units = 'units'
    level = 'level'
    engineering = 'engineering'
    department = 'department'
    semester = 'semester'


class HaasPlaylistName(PrintableEnum):
    """Haas Playlist Name."""

    arts_and_literature = 'Haas Arts and Literature'
    biological_science = 'Haas Biological Sciences'
    historical_studies = 'Haas Historical Studies'
    international_studies = 'Haas International Studies'
    philosophy_and_values = 'Haas Philosophy and Values'
    physical_science = 'Haas Physical Science'
    social_and_behavior_sciences = 'Haas Social and Behavioral Sciences'


class LevelPlaylistName(PrintableEnum):
    """Level Playlist Name."""

    lower_division = 'Lower Division'
    upper_division = 'Upper Division'
    graduate = 'Graduate'
    professional = 'Professional'

    freshmen_sophomore_seminars = 'Freshmen/Sophomore Seminars'
    directed_group_study = 'Directed Group Study'
    supervised_independent_study = 'Supervised Independent Study'
    field_study = 'Field Study'


class LSPlaylistName(PrintableEnum):
    """LS Playlist Name."""

    arts_and_literature = 'Arts and Literature'
    biological_science = 'Biological Sciences'
    historical_studies = 'Historical Studies'
    international_studies = 'International Studies'
    philosophy_and_values = 'Philosophy and Values'
    physical_science = 'Physical Science'
    social_and_behavior_sciences = 'Social and Behavioral Sciences'


class ReadingPlaylistName(PrintableEnum):
    """Reading Playlist Name."""

    reading_and_composition_a = 'Reading and Composition A'
    reading_and_composition_b = 'Reading and Composition B'


class UniversityPlaylistName(PrintableEnum):
    """University Playlist Name."""

    american_cultures = 'American Cultures'
    american_history = 'American History'
    american_institutions = 'American Institutions'
    quantitative_reasoning = 'Quantitative Reasoning'
    college_writing = 'College Writing'