"""Enumeration of level playlist names."""
from mondaine.service.enumeration import PlaylistName


class LevelPlaylistName(PlaylistName):
    """Level Playlist Name."""

    lower_division = 'Lower Division'
    upper_division = 'Upper Division'
    graduate = 'Graduate'
    professional = 'Professional'

    freshmen_sophomore_seminars = 'Freshmen/Sophomore Seminars'
    directed_group_study = 'Directed Group Study'
    supervised_independent_study = 'Supervised Independent Study'
    field_study = 'Field Study'
