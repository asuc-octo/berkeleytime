FROM ubuntu:16.04
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org

RUN apt-get update
RUN apt-get install -y python2.7 python-pip
RUN mkdir berkeleytime
COPY . berkeleytime/

WORKDIR berkeleytime
RUN rm -r berkeleytime/static_media/
RUN pip install -r requirements.txt

ENTRYPOINT ["python", "manage.py", "runserver"]
