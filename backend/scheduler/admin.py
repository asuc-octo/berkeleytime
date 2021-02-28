from django.contrib import admin
from scheduler.models import Schedule, TimeBlock, SectionSelection

# Register your models here.
admin.site.register(Schedule)
admin.site.register(TimeBlock)
admin.site.register(SectionSelection)
