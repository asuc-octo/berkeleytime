FROM python:2.7.15-alpine

RUN apt-get update
RUN apt-get install -y python2.7 python-pip build-essential libssl-dev \
		       libffi-dev libxml2-dev libxslt1-dev zlib1g-dev \
		       libjpeg-dev libncurses5-dev
RUN pip install --upgrade pip

RUN mkdir berkeleytime
WORKDIR berkeleytime

RUN apk update
RUN apk add postgresql-dev gcc python3-dev musl-dev

RUN \
 apk add --no-cache python3 postgresql-libs && \
 apk add --no-cache --virtual .build-deps gcc python3-dev musl-dev postgresql-dev && \
 python3 -m pip install -r requirements.txt --no-cache-dir && \
 apk --purge del .build-deps

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .
RUN rm -r berkeleytime/static_media/

ENTRYPOINT ["python", "manage.py", "runserver"]
