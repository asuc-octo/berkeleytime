web: newrelic-admin run-program python berkeleytime/manage.py run_gunicorn -b "0.0.0.0:$PORT" -w 3 -k gevent --max-requests 250 --preload --log-file=-
