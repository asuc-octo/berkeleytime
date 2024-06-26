# Setting up Berkeleytime

## For Local Developers

This project uses [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/).
If you don't know what containers are, read this [article](https://medium.freecodecamp.org/demystifying-containers-101-a-deep-dive-into-container-technology-for-beginners-d7b60d8511c1).
Docker is a container platform and Docker Compose is a a tool for defining and running multi-container 
Docker applications. Make sure you have both install on your computer before you start. Docker Compose
comes with Docker in most cases (such as MacOS).

### Seeding the Local Database
To run Berkeleytime, make sure this repo is cloned. From the top level, first download the development
Postgres data:
1. `make postgres` - start up the postgres container
2. `curl -O https://storage.googleapis.com/berkeleytime/public/bt_seed.sql.gz` - download the database as a GZip file
3. `gzip -d bt_seed.sql.gz` - unzip this file
4. `cat bt_seed.sql | docker exec -i bt_postgres psql -U bt -d bt_main` - see Postgres container with the data

Before starting the server, make sure the `DATABASE_URL` entry in your `.env.dev` is `postgres://bt:bt@postgres:5432/bt_main` so that the backend connects to the local DB.

### Starting the local server
To boot the services, run `make up`. This will boot 6 containers (redis, postgres, nginx, Django, Node.js). Wait for both
Postgres and Django to be running before you proceed. Django will say 

    Starting development server at http://0.0.0.0:8000/
    
And Postgres will say

    LOG:  database system is ready to accept connections
    
And the Node server will stop spitting errors.
    
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
`pg_dump` and should be saved as `build/bt_main.sql`. This sql dump is then used by the db build container to
be loaded into postgres and stored as a `tar` file of the postgres directory.

Once `pg_dump` completes, run `make db`. This commands builds an image and copies `bt_main.sql` into it.
It also pushes the image, but this step is not necessary. The next goal is to run the image, which will
automatically run a script `init_db.sh` that loads `bt_main.sql`. After you see that the db is ready
to accept connections, the container is now ready and will be a completed db. 
However to save the db so that other users do not have to load the dump every time they
boot a cluster, we will save a copy of the data folder, which backs Postgres.

The entire list of commands is

    pg_dump -h <public-ip-of-prod-db> -U bt -d bt_main > build/bt_main.sql
    make db
    docker run berkeleytime/db
    
    # In another terminal window, without closing the first window
    docker cp XXXX:/var/lib/postgresql/data build/postgres-data
    tar czf postgres-data.tar.gz build/postgres-data

where `XXXX` is the container ID resulting from the previous `docker run` command. The `tar` command
will tar up the data directory. Then you can upload it to the same Google [bucket](https://console.cloud.google.com/storage/browser/berkeleytime-dev-db?project=berkeleytime-218606). 
The user will then use `make init` to download and untar this directory and save it into `build/` 
so that Docker Compose can use it as a volume for Postgres.
