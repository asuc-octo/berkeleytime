# Local Development

## Seeding Local Database

A seeded database is required for some pages on the frontend.

```sh
# ./berkeleytime

# Ensure the MongoDB instance is already running.
docker compose up -d

# Download the data
curl -O https://storage.googleapis.com/berkeleytime/public/stage_backup.gz

# Copy the data and restore
docker cp ./stage_backup.gz berkeleytime-mongodb-1:/tmp/stage_backup.gz
docker exec berkeleytime-mongodb-1 mongorestore --drop --gzip --archive=/tmp/stage_backup.gz
```
