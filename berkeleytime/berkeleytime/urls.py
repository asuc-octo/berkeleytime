from django.conf.urls import patterns, include, url
from django.contrib.auth import views as auth_views
from account.forms import (BerkeleytimeUserCreationForm, BerkeleytimeAuthenticationForm,
    BerkeleytimePasswordResetForm, SetBerkeleytimePasswordForm)
from django.views.generic import TemplateView, RedirectView
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # May need to redirect directly to catalog
    # url(r'^$', 'catalog.views.catalog'),
    # url(r'^$', 'berkeleytime.views.home_page'),

    # Developer Admin
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Account
    url(r'^accounts/profile/$', 'account.views.render_profile'),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^accounts/email/$', 'django.views.defaults.page_not_found'),
    url(r'^accounts/confirm-email/$', 'django.views.defaults.page_not_found'),
    url(r'^accounts/inactive/$', 'django.views.defaults.page_not_found'),
    url(r'^accounts/signup/$', 'django.views.defaults.page_not_found'),
    url(r'^accounts/password/$', 'django.views.defaults.page_not_found'),

                       # TODO (Yuxin)
    url(r'^exception/$', 'catalog.views.test'),

    # Catalog
    url(r'^catalog/$', 'catalog.views.catalog'),
    url(r'^catalog_json/$', 'data.views.catalog_context_json'),
    url(r'^catalog_json/course/(?P<course_id>\d+)/$', 'catalog.views.course_json'),
    url(r'^catalog_json/(?P<abbreviation>.*)/(?P<course_number>.*)/$', 'data.views.catalog_context_json'),
    url(r'^catalog_json/course_box/$', 'catalog.views.course_box_json'),
    # legacy for Berkeleytime V1
    url(r'^courses/$', 'catalog.views.catalog'),
    url(r'^catalog/filter/$', 'catalog.views.filter'),
    url(r'^catalog/course/(?P<course_id>\d+)/$', 'catalog.views.course'),
    url(r'^catalog/favorite/$', 'catalog.views.favorite'),
    url(r'^catalog/course_box/$', 'catalog.views.course_box'),
    url(r'^catalog/(?P<abbreviation>.*)/(?P<course_number>.*)/$', 'catalog.views.catalog'),


    # Grades
    url(r'^grades/$', 'data.views.grade_render'),
    url(r'^grades/course_grades/(?P<course_id>\d+)/$', 'data.views.grade_section_json'),
    url(r'^grades/sections/(?P<grade_ids>.*)/$', 'data.views.grade_json'),

    # Enrollment
    url(r'^enrollment/$', 'data.views.enrollment_render'),
    url(r'^enrollment_json/$', 'data.views.enrollment_context_json'),
    url(r'^enrollment/sections/(?P<course_id>\d+)/$', 'data.views.enrollment_section_render'),
    url(r'^enrollment/aggregate/(?P<course_id>\d+)/(?P<semester>[a-z]+)/(?P<year>\d+)/$', 'data.views.enrollment_aggregate_json'),
    url(r'^enrollment/data/(?P<section_id>\d+)/$', 'data.views.enrollment_json'),
    # (r'^facebook/', include('django_facebook.urls')),

    # Campus
    url(r'^campus/$', 'campus.views.render'),
    url(r'^campus/state/$', 'campus.views.state'),
    url(r'^campus/buildings/$', 'campus.views.buildings'),
    url(r'^campus/building/$', 'campus.views.building'),
    url(r'^campus/search/$', 'campus.views.search'),
    url(r'^campus/rooms/sections/$', 'campus.views.room_sections'),
    url(r'^campus/ongoing/$', 'campus.views.ongoing'),

    #Scheduler
    url(r'^scheduler/$', 'scheduler.views.schedule_render'),
    url(r'^scheduler/select_classes/$', 'scheduler.views.select_classes'),
    url(r'scheduler/select_sections/$', TemplateView.as_view(template_name="scheduler/select_section.html")),
    url(r'^scheduler/select_sections_params/$', 'scheduler.views.select_sections_params'),
    url(r'^scheduler/select_sections/$', 'scheduler.views.select_sections'),
    url(r'^scheduler/select_sections_json/(?P<course_id>\d+)/$', 'scheduler.views.select_sections_json'),
    url(r'^scheduler/view_schedules_params/$', 'scheduler.views.view_schedules_params'),
    url(r'^scheduler/view_schedules/$', 'scheduler.views.view_schedules'),
    url(r'^scheduler/save_schedule/$', 'scheduler.views.save_schedule'),
    url(r'^scheduler/delete_schedule/$', 'scheduler.views.delete_schedule'),
    url(r'^scheduler/export_schedule/$', 'scheduler.views.export_schedule'),
    url(r'scheduler/view_schedules/$', TemplateView.as_view(template_name="scheduler/view_schedules.html")),

    # Direct to Template
    (r'^legal/terms/$', TemplateView.as_view(template_name="legal/terms.html")),
    (r'^legal/privacy/$', TemplateView.as_view(template_name="legal/privacy.html")),
    url(r'^about/$', 'berkeleytime.views.about_page'),

    # DEPRECATE
    (r'^advertise/$', RedirectView.as_view(url='/about')),
    (r'^about/$', RedirectView.as_view(url='/about')),
    (r'^contact/$', RedirectView.as_view(url='/about')),

    # For Testing
    (r'^404/$', TemplateView.as_view(template_name="404.html")),
    (r'^500/$', TemplateView.as_view(template_name="500.html")),

)

from django.conf import settings

#to serve static files with gunicorn
if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    # static files (images, css, javascript, etc.)
    urlpatterns += patterns('',
        url(r'^test/$', 'berkeleytime.views.test'),
        (r'^static_media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT}))

if settings.IS_LOCALHOST:
    urlpatterns += patterns(url(r'^robots\.txt$', lambda r: HttpResponse("User-agent: *\nDisallow: /", content_type="text/plain")))
