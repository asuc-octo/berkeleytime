.PHONY: build up down frontend backend

# The following commands control the docker compose component of the stack.

# Builds the cluster, particularly the search component.
build:
	docker-compose -f build/docker-compose.yml build

# Up brings the cluster up by booting a redis, postgres, and server.
up:
	docker-compose -f build/docker-compose.yml up --build

# Down removes the existing cluster. Make sure you kill your cluster with down!
down:
	docker-compose -f build/docker-compose.yml down

frontend:
	docker-compose -f build/docker-compose.yml up frontend

backend:
	docker-compose -f build/docker-compose.yml up backend redis nginx

postgres: 
	docker-compose -f build/docker-compose.yml up postgres
