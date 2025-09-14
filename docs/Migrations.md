1. Add a field to your models.py, or change it in some way.
2. Run `python3 manage.py makemigrations` to generate the migration files. Commit these files.
3. Local (optional, if you are using a local test database): Run `python manage.py migrate`.
4. Staging: With migration files in staging, point the DATABASE_URL to our staging database URL, then run the same command as above.
5. Production: With migration files in prod, get a shell into the production backend container, then run the same as above.