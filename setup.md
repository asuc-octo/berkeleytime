# Setting up Berkeleytime

## For Local Developers

This project uses [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/).
If you don't know what containers are, read this [article](https://medium.freecodecamp.org/demystifying-containers-101-a-deep-dive-into-container-technology-for-beginners-d7b60d8511c1).
Docker is a container platform and Docker Compose is a a tool for defining and running multi-container 
Docker applications. Make sure you have both install on your computer before you start. Docker Compose
comes with Docker in most cases (such as MacOS).

To run Berkeleytime, make sure this repo is clone. From the top level, first download the development
Postgres data with `make init`. This will create a folder `build/postgres-data`. Don't try to push it to Github - 
its a local copy of the production data. 

To boot the services, run `make up`. This will boot 3 containers (redis, postgres, Django). Wait for both
Postgres and Django to be running before you proceed. Django will say 

    Starting development server at http://0.0.0.0:8000/
    
And Postgres will say

    LOG:  database system is ready to accept connections
    
To remove the cluster, **DO NOT USE CONTROL-C** or anything to stop or terminate the docker compose
process. Instead use `make down` to safely kill the cluster.

If you modify the source code, you will not have to do anything to restart the cluster or services.
Django will automatically detect a change and restart itself. 

## For Maintainers

The Makefile provides some descriptions of how the commands work together. `make base`, `make prod`, 
and `make db` are used to build the images and push them to Dockerhub. The local dev image uses the base
image and them attaches the local copy of the source code as a volume. The prod image packages the local
copy of the code into the image itself. 

The database image is the most unique. `make db` produces an image that is used solely to set up
a database to load the dumped SQL data. This SQL data is dumped from the production database using
`pg_dump` and is saved into the `berkeleytime-dev-db` Google Storage Bucket. To run `make db`, you must
first create your own dump or download a previous one from the [bucket](https://storage.googleapis.com/berkeleytime-dev-db/bt_main.sql)
and save it into `build/`.
 
After running `make db`, you must run `docker run berkeleytime/db` to initialize the database. This
will load the data into the actual database and could take a while. After this finishes, the container
will be a completed db. However to save the db so that other users do not have to load the dump every time they
boot a cluster, we will save a copy of the data folder, which backs Postgres. Run

    docker cp XXXX:/var/lib/postgresql/data build/postgres-data
    tar czf postgres-data.tar.gz build/postgres-data

where `XXXX` is the container ID resulting from the previous `docker run` command. The `tar` command
will tar up the data directory. Then you can upload it to the same Google bucket. The user will then use
`make init` to download and untar this directory and save it into `build/` so that Docker Compose can
use it as a volume for Postgres.