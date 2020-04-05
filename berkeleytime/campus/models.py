from __future__ import division
from django.db import models
# from catalog.haste.generate.location import get_buildings, get_rooms, get_custom_rooms
# import sys, datetime

# def create_buildings():
#     for building in get_buildings():
#         obj, created = Building.objects.get_or_create(
#             abbreviation=building.get("abbreviation", None),
#             defaults=building
#         )
#         if not created:
#             update(obj, building)

# def create_rooms():
#     for abbreviation, rooms in get_rooms().items():
#         building = Building.objects.get(abbreviation=abbreviation)
#         for r in rooms:
#             name, seats = r.get("name", None), r.get("seats", None)
#             if name and seats:
#                 entries = {"building": building, "name": name, "seats": int(seats), "abbreviation": None}
#                 obj, created = Room.objects.get_or_create(building=building, name=name, defaults=entries)
#                 if not created:
#                     update(obj, entries)

# def create_custom_rooms():
#     for building_abbreviation, rooms in get_custom_rooms().items():
#         try:
#             building = Building.objects.get(abbreviation=building_abbreviation)
#             for r in rooms:
#                 name, abbreviation = r[0], r[1]
#                 entries = {"building": building, "name": name, "abbreviation": abbreviation, "seats": None}
#                 obj, created = Room.objects.get_or_create(building=building, abbreviation=abbreviation, defaults=entries)
#                 if not created:
#                     update(obj, entries)
#         except Exception as e:
#             print e

# def update(obj, entries):
#     for (key, value) in entries.items():
#         setattr(obj, key, value)
#     obj.save()

class Building(models.Model):
    name = models.CharField(max_length = 200, null=True, blank=True)
    abbreviation = models.CharField(max_length = 100, null=True, blank=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)

    # def __unicode__(self):
    #     return self.name + " @ (" + unicode(self.latitude) + " " + unicode(self.longitude) + ")"

class Room(models.Model):
    """
    Represents a classroom on the UC Berkeley campus (ie. 1 Pimental Hall (PIMENTEL))
    
    """
    building = models.ForeignKey(Building)
    name = models.CharField(max_length=200, null=True, blank=True)
    abbreviation = models.CharField(max_length=100, null=True, blank=True)
    seats = models.IntegerField(null=True)

    # def __unicode__(self):
    #     return "(Classroom) " + self.full_name

    # @property
    # def full_name(self):
    #     if self.abbreviation:
    #         return self.name
    #     if not self.name:
    #         return self.building.name
    #     return "%s %s" % (self.name, self.building.name)

    # @property
    # def short_name(self):
    #     if self.abbreviation:
    #         return self.name
    #     if not self.name:
    #         return self.building.abbreviation
    #     return "%s %s" % (self.name, self.building.abbreviation)
