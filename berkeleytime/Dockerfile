FROM berkeleytime/base

COPY . .
RUN rm -r berkeleytime/static_media/

ENTRYPOINT ["python", "manage.py", "runserver"]
