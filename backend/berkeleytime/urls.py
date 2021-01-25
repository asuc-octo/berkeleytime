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
from graphene_django.views import GraphQLView
from graphql_jwt.decorators import jwt_cookie

import catalog.views
import enrollment.views
import forms.views
import grades.views
import user.views
from berkeleytime.graphql_cache import cache_graphql

# Note: We will begin to deprecate the endpoints seen here in favor of using GraphQL.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', user.views.login),
    path('oauth2callback/', user.views.oauth2callback),

    path('graphql', jwt_cookie(cache_graphql(GraphQLView.as_view(graphiql=True)))),

    # Catalog
    ## List all courses with catalog data
    path('catalog/catalog_json/', catalog.views.catalog_context_json),
    ## List filtered courses
    path('catalog/filter/', catalog.views.filter),
    ## List playlists (aka filters)
    path('catalog/catalog_json/filters/', catalog.views.catalog_filters_json),
    ## Same as above, but returns default_course (id of currently selected course)
    re_path(r'^catalog/catalog_json/filters/(?P<abbreviation>.*)/(?P<course_number>.*)/$', catalog.views.catalog_filters_json),
    ## Get basic info for given course
    re_path(r'^catalog/catalog_json/course/(?P<course_id>\d+)/$', catalog.views.course_json),
    ## Get detailed info for given course
    path('catalog/catalog_json/course_box/', catalog.views.course_box_json),

    # Grades
    ## List courses with grade data
    path('grades/grades_json/', grades.views.grade_context_json),
    ## List grades after course has been selected
    re_path(r'^grades/course_grades/(?P<course_id>\d+)/$', grades.views.grade_section_json),
    ## Get grade data for given grades
    re_path(r'^grades/sections/(?P<grade_ids>.*)/$', grades.views.grade_json),

    # Enrollment
    ## List courses with enrollment data
    path('enrollment/enrollment_json/', enrollment.views.enrollment_context_json),
    ## List sections after course has been selected
    re_path(r'^enrollment/sections/(?P<course_id>\d+)/$', enrollment.views.enrollment_section_render),
    ## Get enrollment data of a course for a given semester
    re_path(r'^enrollment/aggregate/(?P<course_id>\d+)/(?P<semester>[a-z]+)/(?P<year>\d+)/$', enrollment.views.enrollment_aggregate_json),
    ## Get enrollment data for a given section
    re_path(r'^enrollment/data/(?P<section_id>\d+)/$', enrollment.views.enrollment_json),

    # Forms
    re_path(r'^forms/config/(?P<config_name>[\w\d]+)/$', forms.views.get_config),
    path('forms/submit/', forms.views.record_response),
    re_path(r'^forms/upload/(?P<config_name>[\w\d]+)/(?P<file_name>.+)/$', forms.views.upload_file_view),
]
