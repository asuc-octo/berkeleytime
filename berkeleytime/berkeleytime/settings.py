"""Django settings for berkeleytime project!""" # noqa

import os, os.path, sys
import urlparse
from config.general import *
from config.ongoing import *
from config.bookstore import *

# Change every semester to update Catalog!
import raven
from config.semesters.spring2019 import *

settings_dir = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.dirname(settings_dir))

IS_LOCALHOST = not "DATABASE_URL" in os.environ
IS_STAGING = "IS_STAGING" in os.environ
IS_PRODUCTION = "IS_PRODUCTION" in os.environ

DEBUG = IS_LOCALHOST
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ("ASUC OCTO Berkeleytime Team", "octo.berkeleytime@asuc.org"),
    ("Michael Li", "michael.li@berkeley.edu"),
    ("Will Wang", "hwang97@berkeley.edu"),
)

INTERNAL_IPS = ('0.0.0.0',)

MANAGERS = ADMINS
# SOCIALACCOUNT_ADAPTER = 'account.socialaccount.SocialAccountAdapter'
AUTH_PROFILE_MODULE = 'account.BerkeleytimeUserProfile'

if IS_LOCALHOST or IS_STAGING:
    ALLOWED_HOSTS = ['*']
elif IS_PRODUCTION:
    ALLOWED_HOSTS = [
        ".berkeleytime.com",
        "berkeleytime-production.herokuapp.com",
        "berkeleytime.com",
        "asuc-berkeleytime-production.herokuapp.com",
        # berkeleytimeinternal is our DNS alias for the ASUC transfer
        ".berkeleytimeinternal.com",
        "berkeleytimeinternal.com",
    ]
else:
    # will never happen, but it we configure environment variables wrong
    # then we want to default to no hosts instead of all hosts
    ALLOWED_HOSTS = []

if IS_PRODUCTION or IS_STAGING:
    redis_url = urlparse.urlparse(os.environ.get('REDIS_URL'))
    CACHES = {
        "default": {
            "BACKEND": "redis_cache.RedisCache",
            "LOCATION": "{0}:{1}".format(redis_url.hostname, redis_url.port),
            "OPTIONS": {
                "PASSWORD": redis_url.password,
                "DB": 0,
            }
        }
    }

elif IS_LOCALHOST:
    CACHES = {
        'default': {
            'BACKEND': "redis_cache.RedisCache",
            'LOCATION': 'redis:6379',
        }
    }

if IS_LOCALHOST:
    FACEBOOK_APP = 'local'
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': 'bt_main',
            'USER': 'bt',
            'PASSWORD': 'yuxinsucks',
            'HOST': 'postgres',
            'PORT': '',
        }
    }
else:
    import dj_database_url
    DATABASES = {'default': dj_database_url.config(default='postgres://localhost')}

STATIC_ROOT = '/static_media/'
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')

if IS_LOCALHOST:
    MEDIA_ROOT = os.path.join(os.path.dirname(__file__), 'static_media/').replace('\\','/')
    MEDIA_URL = '/static_media/'
    STATIC_URL = os.path.join(os.path.dirname(__file__), 'static_media/').replace('\\','/')

    # Email Configuration
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    EMAIL_HOST = "localhost"
    EMAIL_PORT = 1025
    EMAIL_HOST_USER = ""
    EMAIL_HOST_PASSWORD = ""
    EMAIL_USE_TLS = False
    DEFAULT_FROM_EMAIL = "admin@berkeleytime.com"
    DOMAIN_NAME = "berkeleytime.com"
    SITE_ID = 3

elif IS_STAGING:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'

    AWS_STORAGE_BUCKET_NAME = 'berkeleytime-static'
    AWS_PRELOAD_METADATA = True # necessary to fix manage.py collectstatic command to only upload changed files instead of all file
    AWS_LOCATION = "static_media"
    MEDIA_URL = 'https://berkeleytime-static.s3.amazonaws.com/static_media/'
    STATIC_URL = 'https://berkeleytime-static.s3.amazonaws.com/static_media/'
    ADMIN_MEDIA_PREFIX = 'https://berkeleytime-static.s3.amazonaws.com/static_media/admin/'

    EMAIL_HOST_USER = os.environ['SENDGRID_USERNAME']
    EMAIL_HOST= 'smtp.sendgrid.net'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_PASSWORD = os.environ['SENDGRID_PASSWORD']

    DEFAULT_FROM_EMAIL = "admin@berkeleytime.com"
    DOMAIN_NAME = "berkeleytime.com"
    SITE_ID = 3

    AWS_HEADERS = {
        'Cache-Control': 'max-age=0',
    }
    AWS_QUERYSTRING_AUTH = False

elif IS_PRODUCTION:
    PREPEND_WWW = True
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    AWS_STORAGE_BUCKET_NAME = 'berkeleytime-static-prod'
    AWS_PRELOAD_METADATA = True # necessary to fix manage.py collectstatic command to only upload changed files instead of all file
    AWS_LOCATION = "static_media"

    MEDIA_URL = 'https://berkeleytime-static-prod.s3.amazonaws.com/static_media/'
    STATIC_URL = 'https://berkeleytime-static-prod.s3.amazonaws.com/static_media/'
    ADMIN_MEDIA_PREFIX = 'https://berkeleytime-static-prod.s3.amazonaws.com/static_media/admin/'

    EMAIL_HOST_USER = os.environ['SENDGRID_USERNAME']
    EMAIL_HOST= 'smtp.sendgrid.net'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_PASSWORD = os.environ['SENDGRID_PASSWORD']

    DEFAULT_FROM_EMAIL = "admin@berkeleytime.com"
    DOMAIN_NAME = "berkeleytime.com"
    SITE_ID = 3

    AWS_HEADERS = {
        'Cache-Control': 'max-age=0',
    }
    AWS_QUERYSTRING_AUTH = False

if "SIS_COURSE_APP_ID" in os.environ:
    SIS_COURSE_APP_ID = os.environ["SIS_COURSE_APP_ID"]
    SIS_COURSE_APP_KEY = os.environ["SIS_COURSE_APP_KEY"]
else:
    SIS_COURSE_APP_ID = ""
    SIS_COURSE_APP_KEY = ""

if "SIS_CLASS_APP_ID" in os.environ:
    SIS_CLASS_APP_ID = os.environ["SIS_CLASS_APP_ID"]
    SIS_CLASS_APP_KEY = os.environ["SIS_CLASS_APP_KEY"]
else:
    SIS_CLASS_APP_ID = ""
    SIS_CLASS_APP_KEY = ""

if "AWS_AFFILIATE_ACCESS_KEY_ID" in os.environ:
    AWS_AFFILIATE_ACCESS_KEY_ID = os.environ["AWS_AFFILIATE_ACCESS_KEY_ID"]
    AWS_AFFILIATE_SECRET = os.environ["AWS_AFFILIATE_SECRET"]
else:
    AWS_AFFILIATE_ACCESS_KEY_ID = ""
    AWS_AFFILIATE_SECRET = ""

# Please replace with Amazon Affiliate tag
AMAZON_AFFILIATE_TAG = 'berkeleytim06-20'

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Los_Angeles'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = False


# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(os.path.dirname(__file__), 'static_media/').replace('\\','/'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'pvcj7&amp;6&amp;(s1u27i*xtize46-dx1oxpv4)s%!8wm^(e51tu9@sz'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

if not IS_LOCALHOST:
    MIDDLEWARE_CLASSES = (
        'djangosecure.middleware.SecurityMiddleware',
    )
else:
    MIDDLEWARE_CLASSES = ()

MIDDLEWARE_CLASSES += (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

if IS_LOCALHOST or IS_STAGING:
    MIDDLEWARE_CLASSES += (
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    )

ROOT_URLCONF = 'berkeleytime.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'berkeleytime.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(os.path.dirname(__file__), 'templates').replace('\\', '/'),
    os.path.join('templates'), os.path.join('templates', 'allauth')
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    'django.contrib.admindocs',
    'djangosecure',
    'catalog',
    'berkeleytime',
    'scheduler',
    'south',
    'marketplace',
    'django_facebook',
    'account',
    'data',
    'campus',
    'gunicorn',
    'storages',
    'collectfast',
    'raven.contrib.django.raven_compat',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google'
)

ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_UNIQUE_EMAIL = False
SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_EMAIL_REQUIRED = True

ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = False

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar'
        ],
        'AUTH_PARAMS': {
            'access_type': 'offline',
        }
    }
}

if IS_LOCALHOST or IS_STAGING:
    INSTALLED_APPS += (
        'debug_toolbar',
    )

# copied from teh django-facebook docs page
TEMPLATE_CONTEXT_PROCESSORS = (
    'django_facebook.context_processors.facebook',
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'account.context_processors.facebook_info',
    'account.context_processors.semester_info',
    'account.context_processors.domain_name',
    'account.context_processors.is_production',
    'allauth.socialaccount.context_processors.socialaccount'
)
AUTHENTICATION_BACKENDS = (
    'django_facebook.auth_backends.FacebookBackend',
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend'
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        },
    },
    'formatters': {
        'verbose': {
            'format': '[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s',  # noqa
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
            'stream': sys.stdout,
        },
        'sentry': {
            'level': 'WARN',
            'filters': ['require_debug_false'],
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',  # noqa
        },
    },
    'root': {
        'handlers': ['sentry'],
        'level': 'INFO',
    },
    'loggers': {
        'catalog': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'mondaine': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django_facebook.models': {
            'handlers': ['mail_admins', 'console'],
            'level': 'ERROR',
            'propagate': True,
        },
        # https://docs.sentry.io/hosted/clients/python/integrations/django/
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
    }
}

if IS_LOCALHOST or IS_STAGING:
    # Django Debugging Toolbar
    DEBUG_TOOLBAR_PANELS = (
        'debug_toolbar.panels.versions.VersionsPanel',
        'debug_toolbar.panels.timer.TimerPanel',
        'debug_toolbar.panels.settings.SettingsPanel',
        'debug_toolbar.panels.headers.HeadersPanel',
        'debug_toolbar.panels.request.RequestPanel',
        'debug_toolbar.panels.sql.SQLPanel',
        'debug_toolbar.panels.templates.TemplatesPanel',
        'debug_toolbar.panels.signals.SignalsPanel',
        'debug_toolbar.panels.logging.LoggingPanel',
    )

FACEBOOK_LOGIN_DEFAULT_REDIRECT = "/login"
LOGIN_URL = '/login'
LOGOUT_URL = '/logout'

# Sentry Configuration
if IS_LOCALHOST:
    RAVEN_CONFIG = {
        'dsn': '',
    }
else:
    RAVEN_CONFIG = {
        'dsn': os.environ['SENTRY_DSN'],
    }

# SSL
if not IS_LOCALHOST:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    os.environ['HTTPS'] = "on"

# Specify the context processors as follows:
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                # Already defined Django-related contexts here

                # `allauth` needs this from django
                'django.template.context_processors.request',
            ],
        },
    },
]

ACCOUNT_LOGOUT_ON_GET = True
