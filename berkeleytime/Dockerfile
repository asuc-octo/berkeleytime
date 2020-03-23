FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y python2.7 python-pip build-essential libssl-dev \
		       libffi-dev libxml2-dev libxslt1-dev zlib1g-dev \
		       libjpeg-dev libncurses5-dev
RUN pip install --upgrade pip

RUN mkdir berkeleytime
WORKDIR berkeleytime

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .
RUN rm -r berkeleytime/static_media/

ENTRYPOINT ["python", "manage.py", "runserver"]
