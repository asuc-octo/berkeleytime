FROM python:3.8

EXPOSE 5000

WORKDIR app

COPY . /app/

RUN pip install -r requirements.txt

CMD python python3/flask/app.py
