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

A staging environment is hosted at `staging.berkeleytime.com`. It uses the same cache and database as the production environment, but is useful for testing out changes to the server.

A search request for `search.berkeleytime.com` will be routed by the ingress to the earch engine, built ontop of Elasticsearch.

Team members can log into `dashboard.berkeleytime.com` in order to access the CI/CD and also the Kubernetes dashboard, Kiabana for viewing logs, and Prometheus for viewing health timeseries.

## Kubernetes

Kubernetes is a container orchestrator, which is responsible for deploying and maintaining the services of your application on a multi node cluster. Kubernetes is a relativetly new concept but its very much the growing trend of industry today. Almost all new tech companies (Uber, Netflix, Lyft) are very invest in Kubernetes and use it to deploy all of their services. To get some background into microservices and containers, see these articles:

[Microservices](https://hackernoon.com/how-microservices-saved-the-internet-30cd4b9c6230)

[Containers](https://medium.freecodecamp.org/demystifying-containers-101-a-deep-dive-into-container-technology-for-beginners-d7b60d8511c1)

[Kubernetes](https://www.digitalocean.com/community/tutorials/an-introduction-to-kubernetes)

## Components

### Django Web Server

The web server is the central component of the entire cluster. At any time, there are 4 or more contianers, each running an identical version of the production server. Most requests to Berkeleytime will be serviced by one of the servers. A good rule of thumb is to have 2 servers per core in the cluster. During busy season, it may be a good idea to scale to 8 replicas running on 2 VMs (4 total cores).

The server is made of a **service** and a **deployment**. The service object provides a ClusterIP, which is an internal IP from which any of the replicas can be accessed. Requests are passed to the **ClusterIP** and internally load balanced to one of the replicas under that service. The Deployment object manages the number of replicas, called **pods**, and what container to run for each pod.

### ConfigMaps and Secrets

The web server requires a number of environment variables to be set in order to properly run. These include URLs and IPs for Redis, Postgres, Sentry, etc along with configuration variables, usernames and password for services, tokens for Google and AWS. This information is stored in the **ConfigMaps** and **Secrets** objects. While both are essentially YAML dictionary objects, use configmaps for configuration and secrets for values that should be kept secret.

These objects are attached to deployments and can be used to set ENV variables inside the containers and also mounted as files that the processes can use. See the production server deployment manifest for an example of how its used.

### Ingress

The **ingress** is central point where all requests enter into the cluster. It exposes an **ExternalIP** that users can access from the public internet. This external IP is used as the IP of `berkeleytime.com`, and thus all requests for `berkeleytime.com` will enter the cluster at the ingress. 

The **ingress controller** is a Kubernetes object that manages possibly several ingresses to the cluster. While we only have a single ingress, we still use an ingress controller that is deployed with Helm. **Helm** is a package manager and templater for Kubernetes and makes the flow of installing services into Kubernetes much easier.

The actual ingress for `berkeleytime.com` is also a Kubernetes object that is deployed through a manifest. This ingress allows writing rules to redirect requests, such as sending all requests for `berkeleytime.com` to the production server but requests for `staging.berkeleytime.com` to the staging server.

### Postgres

Postgres is a central component of Django and is the backing object datastore that is used to store Django models. We used a hosted version of Django run on Google Cloud SQL instead of running Postgres ourselves. This provides safety as we never want to delete this Postgres server in the event we delete the cluster. This also provides snap shotting of the data in order to maintain backups.

### Redis

Redis is the caching server used by both the production and staging environments. In the future it might be a good idea to use a separate Redis for the staging enviornment. Redis is deployed with Helm with cluster mode turned off (just the Master, no Slave).

### Dashboard & CI/CD

You might have noticed that it is quite difficult to deploy everything as there are multiple steps involved. Contiunous Integration and Contiunous Deployment as a process that abstracts the deployment pipeline away from the developer's day to day responsibilties. This dashboard will container buttons that will build and deploy the master branch to the staging envionment and also later to the production environment. 

There will also be links to the logging (Kibana + Elasticsearch) and monitoring (Grafana + Prometheus) services that provide insight into the number and kind of requests and status of the servers.

### Search

A ambitious project is to move the entire search side to Elasticsearch under the domain `search.berkeleytime.com`. Using elasticsearch is not only faster, but provides better ways to search through the large number of courses and grades in the database.