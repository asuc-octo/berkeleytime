FROM python:3
ENV DEBIAN_FRONTEND=noninteractive

RUN mkdir /backend
WORKDIR /backend
COPY requirements.txt /backend/
# load requirements.txt first so set up python environment

RUN pip install -r /backend/requirements.txt
