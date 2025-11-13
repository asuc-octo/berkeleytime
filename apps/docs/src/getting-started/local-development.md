# Local Development

## Starting up the Application

Local development has a few local dependencies:
- [Node.js](https://nodejs.org/en)
- [Docker Desktop](https://www.docker.com/)
- pre-commit
    - [With pip](https://pre-commit.com/#install)
    - [With brew](https://formulae.brew.sh/formula/pre-commit)

Next:
```sh
# ./berkeleytime

# Continue installation of dependencies.
pre-commit install
```

Currently, the main development occurs on the `main` branch. Please make sure you are on this branch!

```sh
# ./berkeleytime
git switch main

# Create .env from template file
cp .env.template .env

# Setup local code editor intellisense.
npm install
npx turbo run generate

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
curl -f -o "prod-backup.gz" "https://backups.stanfurdtime.com/persistent/prod_backup-$(date +%Y%m01).gz"

# Copy the data and restore
docker cp ./prod-backup.gz berkeleytime-mongodb-1:/tmp/prod-backup.gz
docker exec berkeleytime-mongodb-1 mongorestore --drop --gzip --archive=/tmp/prod-backup.gz
```

> [!TIP]
> For the latest available snapshot of the production database, use:
> ```sh
> curl -f -o "prod-backup.gz" "https://backups.stanfurdtime.com/daily/prod_backup-$(date +%Y%m%d).gz"
> ```
