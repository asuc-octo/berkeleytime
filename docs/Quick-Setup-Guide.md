## Local Dev Setup

This project uses [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/) locally. If you don't know what containers are, read this [article](https://medium.freecodecamp.org/demystifying-containers-101-a-deep-dive-into-container-technology-for-beginners-d7b60d8511c1). Docker is a container platform and Docker Compose is a a tool for defining and running multi-container Docker applications. Make sure you have both installed on your computer before you start. Docker Compose comes with Docker in most cases (such as MacOS).

To run Berkeleytime, make sure this repo is cloned. To boot the services, run `make up`. This will boot 3 containers (nginx, Django backend, and Node.js frontend). Wait for all containers to be ready before you proceed.

Django will say 

    Starting development server at http://0.0.0.0:8000/
    
And the frontend Node server will say

    Search for the keywords to learn more about each warning.
    To ignore, add // eslint-disable-next-line to the line before.

Once the containers are up and running, you can check that the frontend is running at [http://localhost:8080](http://localhost:8080).

To stop the cluster, **DO NOT USE CONTROL-C** or anything to stop or terminate the docker compose process. Instead use `make down` from another window to safely kill the cluster.

If you modify the source code, you will not have to do anything to restart the cluster or services. Django will automatically detect a change and restart itself and as will the frontend. If only exception is if you make changes to a YAML or configuration file that is not part of the source code (not `.py`, `.css`, `.scss`, `.jsx`, etc). Especially on the backend, you may have to force reload the backend with a `make down && make up`. 

If you need to run a command, from another terminal window you can SSH into the container running the process you want. Use `docker ps` to list all containers running. It will look like

```
CONTAINER ID   IMAGE                        COMMAND                  CREATED       STATUS       PORTS                              NAMES
908a18bdaa3c   nginx                        "nginx -g 'daemon of…"   2 hours ago   Up 2 hours   80/tcp, 0.0.0.0:8080->8080/tcp     build_nginx_1
fe23d7b00b4a   build_backend                "python manage.py ru…"   2 hours ago   Up 2 hours   build_backend_1
4423ff07f191   build_frontend               "npm start"              2 hours ago   Up 2 hours   build_frontend_1
00f4a37ec055   docker.elastic.co/elast...   "/usr/local/bin/dock…"   3 hours ago   Up 2 hours   0.0.0.0:9200->9200/tcp, 9300/tcp   elasticsearch
6a9c220cf124   redis:alpine                 "docker-entrypoint.s…"   3 hours ago   Up 2 hours   6379/tcp                           build_redis_1
```

Note the container ID of the container you want. For example if you want the backend Django container, you want the ID associated with the image `build_backend` which here is `fe23d7b00b4a`. This ID changes every time you `make up`. Then to SSH, run

    docker exec -it <container_id> bash

This executes the `bash` command inside the container. Sometimes, these containers may not have bash in which case you can try replacing it with `sh`.

This is very useful when running Django commands, since Django needs a fully set up environment to run. Once you are inside a Django container, you can run a Django command like `python manage.py shell`. 

Alternatively, if you are using VSCode, you can check out the Docker extension, which is really useful for monitoring the status of your containers and for getting a shell into them.
