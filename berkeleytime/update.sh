#!/bin/bash

export SIS_CLASS_APP_ID=***REMOVED***
export SIS_CLASS_APP_KEY=***REMOVED***
export SIS_COURSE_APP_ID=***REMOVED***
export SIS_COURSE_APP_KEY=***REMOVED***
python manage.py schedule
python manage.py playlist