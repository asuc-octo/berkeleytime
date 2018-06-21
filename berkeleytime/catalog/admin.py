"""This registers these models at /admin."""

from catalog.models import Section, Course
from django.contrib import admin

admin.site.register(Section)
admin.site.register(Course)
