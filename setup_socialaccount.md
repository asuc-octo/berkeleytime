# Reinstall pip requirements, there are more now

    python pip install -r requirements.txt

# Sync everything

    python manage.py syncddb --all

# Create site

    python manage.py shell
    from django.contrib.sites.models import Site
    Site.objects.create(pk=1, domain='www.berkeleytime.com', name='berkeleytime')
    exit()

# Set up social application

visit /admin

login

create new social application

APP = google

for ID and SECRET, use the client ID and SECRET provided in account/client_secret.json

