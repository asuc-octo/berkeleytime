#!/bin/bash

export SIS_CLASS_APP_ID=***REMOVED***
export SIS_CLASS_APP_KEY=***REMOVED***
export SIS_COURSE_APP_ID=***REMOVED***
export SIS_COURSE_APP_KEY=***REMOVED***
python manage.py course
python manage.py playlist
python manage.py schedule