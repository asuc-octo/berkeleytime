FROM ubuntu:16.04
MAINTAINER ASUC OCTO octo.berkeleytime@asuc.org

RUN apt-get update
RUN apt-get install -y python2.7 python-pip build-essential libssl-dev \ 
		       libffi-dev libxml2-dev libxslt1-dev zlib1g-dev \ 
		       libjpeg-dev libncurses5-dev
RUN pip install --upgrade pip 

RUN mkdir berkeleytime
COPY . berkeleytime/

WORKDIR berkeleytime
RUN rm -r berkeleytime/static_media/
RUN pip install -r requirements.txt
ENTRYPOINT ["python", "manage.py", "runserver"]
