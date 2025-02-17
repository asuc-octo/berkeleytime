# Local Development

## Starting up the Application

Local development has a few local dependencies:
- [Python](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en)
- [Docker Desktop](https://www.docker.com/)
- [pre-commit](https://pre-commit.com/#install)

Next:
```sh
# ./berkeleytime

# Continue installation of dependencies.
pre-commit install
npm install
```

Currently, the main development occurs on the `gql` branch. Please make sure you are on this branch!

```sh
# ./berkeleytime
git switch gql

# Create .env from template file
cp .env.template .env

# Ensure Docker Desktop is running. Start up application
docker compose up -d
```

## Common Commands

Upon changing any [GraphQL](https://www.graphql-js.org/docs/) typedefs, the generated types must be regenerated:
```sh
# ./berkeleytime
npx turbo run generate
```

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
