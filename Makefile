.PHONY: frontend

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

# The following commands are used to deploy the staging and prodctuon environments
# TODO: replace with jenkins

deploy-prod:
	kubectl delete -f kubernetes/manifests/berkeleytime/backend-deploy-prod.yaml
	kubectl delete -f kubernetes/manifests/berkeleytime/frontend-deploy-prod.yaml
	kubectl apply -f kubernetes/manifests/berkeleytime/frontend-deploy-prod.yaml
	kubectl apply -f kubernetes/manifests/berkeleytime/backend-deploy-prod.yaml

deploy-stage:
	kubectl delete -f kubernetes/manifests/berkeleytime/backend-deploy-stage.yaml
	kubectl delete -f kubernetes/manifests/berkeleytime/frontend-deploy-stage.yaml
	kubectl apply -f kubernetes/manifests/berkeleytime/frontend-deploy-stage.yaml
	kubectl apply -f kubernetes/manifests/berkeleytime/backend-deploy-stage.yaml

# Minimal makefile for Sphinx documentation

SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = .
BUILDDIR      = _build

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)



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
