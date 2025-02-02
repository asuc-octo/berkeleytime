# Local & Remote Development

## Local Development

The `datapuller` inserts data into the Mongo database. Thus, to test locally, a Mongo instance must first be running locally and be accessible to the `datapuller` container. To run a specific puller, the `datapuller` must first be built, then the specific puller must be passed as a command[^1]. After modifying any code, the container *must* be re-built for changes to be reflected.

```sh
# ./berkeleytime

# Start up docker-compose.yml
docker compose up -d

# Build the datapuller-dev image
docker build --target datapuller-dev --tag "datapuller-dev" .

# Run the desired puller. The default puller is main.
docker run --volume ./.env:/datapuller/apps/datapuller/.env --network bt \
    "datapuller-dev" "--puller=courses"
```

The valid pullers are `courses`, `classes`, `sections`, `grades`, `enrollments`, and `main`.

> [!TIP]
>  If you do not need any other services (backend, frontend), then you can run a Mongo instance independently from the `docker-compose.yml` configuration. However, the below commands do not allow data persistence.
> ```sh
> # Run a Mongo instance. The name flag changes the MONGO_URI.
> # Here, it would be mongodb://mongodb:27017/bt?replicaSet=rs0.
> docker run --name mongodb --network bt --detach "mongo:7.0.5" \
>     mongod --replSet rs0 --bind_ip_all
>
> # Initiate the replica set.
> docker exec mongodb mongosh --eval \
>     "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongodb:27017'}]})"
> ```

[^1]: Here, I reference the Docker world's terminology. In the Docker world, the `ENTRYPOINT` instruction denotes the the executable that cannot be overriden after the image is built. The `CMD` instruction denotes an argument that can be overriden after the image is built. In the Kubernetes world, the `ENTRYPOINT` analogous is the `command` field, while the `CMD` equivalent is the `args` field.

## Remote Development

The development CI/CD pipeline marks all `datapuller` CronJobs as [suspended](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/cron-job-v1/#CronJobSpec), preventing the `datapuller` jobs to be scheduled. To test a change, [manually run the desired puller](../infrastructure/runbooks.md#manually-run-datapuller).
