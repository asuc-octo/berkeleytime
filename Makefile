# The following commands build the images for various components of the Berkeleytime stack
# and pushes them to Dockerhub. Make sure you are logged in as the berkeleytime user.

backend:
	docker build -t berkeleytime/berkeleytime -f berkeleytime/Dockerfile berkeleytime
	docker push berkeleytime/berkeleytime
	
frontend:
	docker build -t berkeleytime/frontend -f frontend/Dockerfile frontend
	docker push berkeleytime/frontend

# The database image is used to create the postgres data directory. It loads a dump of the
# production data into postgres, and thus creates a data directory. This directory is tarballed
# and saved in a bucket. Local devs will download this directory to get a copy of postgres data
# for their own local postgres containers.
db:
	docker build -t berkeleytime/db -f build/Dockerfile.db build
	docker push berkeleytime/db

# -----------------------------------------------------------------------------------------------
 
# The following commands control the docker compose component of the stack.

# Up brings the cluster up by booting a redis, postgres, and server.
up:
	docker-compose -f build/docker-compose.yml up
	
# Down removes the existing cluster. Make sure you kill your cluster with down!
down:
	docker-compose -f build/docker-compose.yml down

# Init is run only once and downloads the postgres data directory into /build.
init:
	wget https://storage.googleapis.com/berkeleytime-dev-db/postgres-data.tar.gz
	tar -zxvf postgres-data.tar.gz
	rm postgres-data.tar.gz
	
