# Architecture

Berkelytime is built using microservice architecture. Microservies provide many benefits when it comes to scaling, independece, and control that Heroku lacks. The system is deployed with Kubernetes on the Google Kubernetes Engine. 

## System Design

    Request --> [Nginx Ingess] 
                      |
                      |---------> [Django Web Server]
                      |                  |-------> [Postgres Database]
                      |                  |-------> [Redis Cache]
                      |
                      |---------> [Search Engine]
                      |                  |-------> [Elasticsearch Database]
                      |
                      |---------> [Dashboard]
                                         |-------> [CI/CD]
                                         |-------> [Kubernetes Dashboard]
                                         |-------> [Kibana]
                                         |-------> [Prometheus Dashboard]

A normal request for `berkeleytime.com` will be first routed to the ingress, which will route it to one of serveral replicas of the web server.

A search request for `search.berkeleytime.com` will be routed by the ingress to the earch engine, built ontop of Elasticsearch.

Team members can log into `dashboard.berkeleytime.com` in order to access the CI/CD and also the Kubernetes dashboard, Kiabana for viewing logs, and Prometheus for viewing health timeseries.

## Components