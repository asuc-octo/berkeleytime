# Local Development

The nature of the `datapuller` separates it from the backend and frontend services. Thus, when testing locally, it is quicker and easier to build and run the `datapuller` separately from the backend/frontend stack.

To run a specific puller, the datapuller must first be built, then the specific puller must be passed as a command[^1]. In addition, a Mongo instance should be running in the same network and the correct `MONGO_URI` in `.env`.

```sh
# ./berkeleytime

# Run a Mongo instance. The name flag changes the MONGO_URI.
# Here, it would be mongodb://mongodb:27017/bt.
docker run --name mongodb --network bt --detach "mongo:7.0.5"

# Build the datapuller-dev image
docker build --target datapuller-dev --tag "datapuller-dev" .

# Run the desired puller. The default puller is main.
docker run --volume ./.env:/datapuller/apps/datapuller/.env --network bt \
    "datapuller-dev" "--puller=courses"
```

The possible pullers are `courses`, `classes`, `sections`, `grade-distributions`, and `main`.

[^1]: Here, I reference the Docker world's terminology. In the Docker world, the `ENTRYPOINT` instruction denotes the the executable that cannot be overriden after the image is built. The `CMD` instruction denotes an argument that can be overriden after the image is built. In the Kubernetes world, the `ENTRYPOINT` analogous is the `command` field, while the `CMD` equivalent is the `args` field.
