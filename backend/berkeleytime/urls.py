"""berkeleytime URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path

urlpatterns = [
    # Probably don't need this right now
    path('admin/', admin.site.urls),
    
    # Need to add these endpoints back later

    # # Catalog
    # path('catalog/catalog_json/', 'data.views.catalog_context_json'), # Thinking of keeping catalog_context_json for public api
    # path('catalog/catalog_json/filters/', 'data.views.catalog_filters_json'),
    # re_path(r'^catalog/catalog_json/filters/(?P<abbreviation>.*)/(?P<course_number>.*)/$', 'data.views.catalog_filters_json'),
    # re_path(r'^catalog/catalog_json/course/(?P<course_id>\d+)/$', 'catalog.views.course_json'),
    # path('catalog/catalog_json/course_box/', 'catalog.views.course_box_json'),
    # # legacy for Berkeleytime V1
    # path('catalog/filter/', 'catalog.views.filter'),
    # re_path(r'^catalog/(?P<abbreviation>.*)/(?P<course_number>.*)/$', 'catalog.views.catalog'),

    # # Grades
    # path('grades/', 'data.views.grade_render'),
    # path('grades/grades_json/', 'data.views.grade_context_json'),
    # re_path(r'^grades/course_grades/(?P<course_id>\d+)/$', 'data.views.grade_section_json'),
    # re_path(r'^grades/sections/(?P<grade_ids>.*)/$', 'data.views.grade_json'),

    # # Enrollment
    # path('enrollment/', 'data.views.enrollment_render'),
    # path('enrollment/enrollment_json/', 'data.views.enrollment_context_json'),
    # re_path(r'^enrollment/sections/(?P<course_id>\d+)/$', 'data.views.enrollment_section_render'),
    # re_path(r'^enrollment/aggregate/(?P<course_id>\d+)/(?P<semester>[a-z]+)/(?P<year>\d+)/$', 'data.views.enrollment_aggregate_json'),
    # re_path(r'^enrollment/data/(?P<section_id>\d+)/$', 'data.views.enrollment_json'),

    # # Forms
    # re_path(r'^forms/config/(?P<config_name>[\w\d]+)/$', 'forms.views.get_config'),
    # path('forms/submit/', 'forms.views.record_response'),
    # re_path(r'^forms/upload/(?P<config_name>[\w\d]+)/(?P<file_name>.+)/$', 'forms.views.upload_file_view'),
]
