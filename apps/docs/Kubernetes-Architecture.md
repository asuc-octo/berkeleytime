Berkelytime uses a microservices architecture. Microservices provide many benefits when it comes to scaling, independence, and control that Heroku lacks. The system is deployed with Kubernetes in Ubuntu 20.04 at the Open Computing Facility (OCF) at Berkeley, with Google Cloud Platform as a fallback just in case. Deploying at the OCF or GCP with our [init.sh file](https://github.com/asuc-octo/berkeleytime/blob/master/infra/init.sh) requires intimate knowledge of how to deploy an open-source Kubernetes distribution with kubeadm, as well as knowing how bare-metal Kubernetes works in general.

# Infrastructure Elephant in the Room: The Rationale Against Cloud
Our architecture, as of now, is single-node, yet we still run Kubernetes because it:
* is a standard and fast-growing medium for infrastructure engineers to express how resources exist
* provides for both cloud and non-cloud setups
* can handle adding+subtracting nodes when we decide to do so
* provides a lot of great utility out of the box that doesn't depend on bash scripts

Unless there is an extremely good reason, it's imperative we stay on Kubernetes and deploy our own self-hosted services that treat bare-metal or simple virtual machines such as OCF's hozer-55, AWS EC2, and GCP Compute Engine as first-class citizens and NOT managed Kubernetes like AWS AKS and GCP GKE

Having said all that, there are some big problems that arise from running the entire show ourselves such as dynamic storage provisioning

# Dynamic persistent volumes on self-hosted Kubernetes? What?

Usually in a Cloud™️ setup, you depend on the closed-source provider to provide a controller that can provision your persistent storage. Unless you want to make network requests across the internet with NFS or some other network-first storage server, the best we have come up with so far is to use block storage devices that we manually requested from the Open Computing Facility. There is a single 128GB block device on hozer-55 mapped to /dev/vdb and we use a Kubernetes implementation of Ceph (software for self-hosted fault-tolerant replicated data) called **Rook** and specifically we use Ceph's RADOS Block Devices (RBD) to dynamically provision persistent volume claims (PVC) in Kubernetes in the namespace **rook-ceph**. You can learn more about **rook-ceph** [here](https://web.archive.org/web/20210404171921/https://rook.io/docs/rook/v1.5/ceph-block.html) (archive.org link in case the URL ever changes)

Plus managed GCP GKE costs a ton and there isn't a great rationale for that considering the OCF is passionate about self-hosting, manages their resources well, and the university provides networking speeds better than or equal to Cloud speeds with a Berkeley public IP address per node

This is not without its issues and so some disaster help has been documented in the [Oh-Shit Pit](https://github.com/asuc-octo/berkeleytime/wiki/Infrastructure-Oh-Shit-Pit)

## System Design

    Request --> [ingress-nginx] 
                      |
                      |---------> [Django backend]
                      |                  |-------> [Connects Postgres for persistent database]
                      |                  |-------> [Connects Redis for cache]
                      |                  |-------> [Logs to Elasticsearch via Kubernetes container logs on STDOUT, STDERR]
                      |
                      |---------> [Node.JS frontend]
                      |
                      |---------> [GitLab]
                      |
                      |---------> [Kibana (protected)]
                                         |-------> [Elasticsearch database]

ingress-nginx serves as the entrypoint for all requests to our system

A normal request for `berkeleytime.com` will be first routed to the ingress, which will route it to either the frontend or the backend. All requests to the `/api/*` path are routed to the backend, `/kibana` and `/git` are routed appropriately, and everything else goes to the frontend.

A staging environment is hosted at `staging.berkeleytime.com`. It uses the same cache and database as the production environment, but is useful for testing out changes to the server. All requests that to this domain get routed to the staging version of the frontend or backend. Additionally, a configurable number of branches will be deployed automatically for development purposes (tricycle).

GitLab is available at `berkeleytime.com/git`. Requests to this path prefix route to GitLab

Kibana is available at `berkeleytime.com/kibana`. Requests to this path prefix route to Kibana

Elasticsearch is a backend database based on Lucene, and Kibana is the frontend that makes data easier to work with from the user perspective

## Kubernetes for the first-timers

Kubernetes is a container orchestrator, which is responsible for deploying and maintaining the services of your application on a multi node cluster. Kubernetes is a relativetly new concept but its very much the growing trend of industry today. Almost all new tech companies (Uber, Netflix, Lyft) are very invested in Kubernetes and use it to deploy all of their services. To get some background into microservices and containers, see these articles:

[Microservices](https://hackernoon.com/how-microservices-saved-the-internet-30cd4b9c6230)

[Containers](https://medium.freecodecamp.org/demystifying-containers-101-a-deep-dive-into-container-technology-for-beginners-d7b60d8511c1)

[Kubernetes](https://www.digitalocean.com/community/tutorials/an-introduction-to-kubernetes)

## Kubernetes Concepts

#### Service, Deployment, Pods

Each service is made of a **service** object and a **deployment** object. A **pod** is like a container, its a single instance of a web server or process that is running in the cluster. The service object provides load balancing amongst pods. For example, you may have 4 pods (i.e. 4 replicas) of a web server, each serving at localhost:8080. The service object gives an IP, like an internal **ClusterIP** 10.0.0.1, to the pods. Then if you go to 10.0.0.1:8080, the service load balances to one of the web servers for that service. The Deployment object manages the a group of pods - it allows you to specifiy how a pod should look and how many replicas of the pod there needs to be.

#### ConfigMaps and Secrets

The web server requires a number of environment variables to be set in order to properly run. These include URLs and IPs for Redis, Postgres, Sentry, etc along with configuration variables, usernames and password for services, tokens for Google and AWS. This information is stored in the **ConfigMaps** and **Secrets** objects. While both are essentially YAML dictionary objects, use configmaps for configuration and secrets for values that should be kept secret.

These objects are attached to deployments and can be used to set ENV variables inside the containers and also mounted as files that the processes can use. See the production server deployment manifest for an example of how its used.

#### Ingress

The **ingress** is central point where all requests enter into the cluster. It exposes an **ExternalIP** that users can access from the public internet. This external IP is used as the IP of `berkeleytime.com`, and thus all requests for `berkeleytime.com` will enter the cluster at the ingress. 

The **ingress controller** is a Kubernetes object that manages possibly several ingresses to the cluster. While we only have a single ingress, we still use an ingress controller that is deployed with Helm (see below).

The actual ingress for `berkeleytime.com` is also a Kubernetes object that is deployed through a manifest. This ingress allows writing rules to redirect requests, such as sending all requests for `berkeleytime.com` to the production server but requests for `staging.berkeleytime.com` to the staging server.

#### Helm

Helm is not a Kubernetes component but it is a package manager for Kubernetes. It automates the installation of frequently used Kubernetes services. We use Helm to install the Ingress, Cert Manager, and Redis.

## System Components

#### Berkeleytime API Server

The backend web server is the central component of the entire cluster. At any time, there is one staging deployment and one production deployment, each configured to run just one replica.

#### Frontend NodeJS Server

The frontend server is a Node server that returns a webpacked version of the React frontend. There is one single instance for production and one single instance for staging, each under its own services.

#### Postgres

Postgres is our source-of-truth data store. We used to run a GCP Cloud SQL instance, but we now run our own instance and maintain backups.

#### Redis

Redis is the caching server used by both the production and staging environments. In the future it might be a good idea to use a separate Redis for the staging enviornment. Redis is deployed with Helm with cluster mode turned off (just the Master, no Slave).

#### Nightly CRON Job

A 2 AM nightly cron job runs commands from the Django server that updates the database with the latest course and enrollment data from SIS. It simply executes the file located at `/berkeleytime/update-data.sh` of the production branch, which of writing executes

    python manage.py course
    python manage.py class
    python manage.py playlist --refresh

You can check out what each of these commands do specifically in `/backend/berkeleytime/management/commands/`. 

#### GitLab

GitLab runs as a separate service and pod in the cluster. It is responsible for building images and deploying pods whenever a change is detected in a source branch.

#### Elastic Stack

Read about the ELK/Elastic stack [here](https://www.elastic.co/what-is/elk-stack). We use the Elastic stack at Berkeleytime for application logging and monitoring.

#### Cert Manager

A component that is not often mentioned but is very important is the cert manager, which actually runs in a separate namespace. It is responsible for issuing the TLS certificates that allow secure connections to berkeleytime.com. We use a standard component that is deployed through Helm and our certificates are signed by Let's Encrypt. For more info, see [Kubernetes Playbook](https://github.com/asuc-octo/berkeleytime/wiki/Kubernetes-Playbook)