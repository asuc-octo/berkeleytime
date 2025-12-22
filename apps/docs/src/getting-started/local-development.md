# Local Development

## Starting up the Application

Local development has a few local dependencies:
- [Git](https://git-scm.com/install/)
- Node version manager
    - [With download script](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
    - [With brew](https://formulae.brew.sh/formula/nvm)
- [Docker Desktop](https://www.docker.com/)
- pre-commit
    - [(Preferred for MacOS users): With brew](https://formulae.brew.sh/formula/pre-commit)
    - [With pip](https://pre-commit.com/#install)

First, set up Node locally:
```sh
nvm install --lts
```

After installing these dependencies, make sure you are on the `main` branch:
```sh
# ./berkeleytime
git pull
git switch main

# Continue installation of dependencies.
pre-commit install

# Create .env from template file
cp .env.template .env

# Setup local code editor intellisense.
npm install
npx turbo run generate
```

Open the docker desktop application, then run:
```sh
# Start up application
docker compose up -d
```

The Berkeleytime application should now be running locally at `http://localhost:8080`! Make sure that each page (catalog, grades, etc.) is working as expected.

## Common Commands

Upon changing any [GraphQL](https://www.graphql-js.org/docs/) typedefs in the backend, the generated types must be regenerated:
```sh
# ./berkeleytime
npx turbo run generate
```

Errors can occur when installing new `npm` packages. If they aren't automatically reflected in an already running docker compose:
```sh
docker compose down
docker compose up --build -d
```

## Seeding Local Database

A seeded database is required for some pages on the frontend.

```sh
# ./berkeleytime

# Ensure the MongoDB instance is already running.
docker compose up -d

# Download the data
curl -f -o "prod-backup.gz" "https://backups.berkeleytime.com/daily/prod_backup-$(date -v -6H +%Y%m%d).gz"

# Copy the data and restore
docker cp ./prod-backup.gz berkeleytime-mongodb-1:/tmp/prod-backup.gz
docker exec berkeleytime-mongodb-1 mongorestore --drop --gzip --archive=/tmp/prod-backup.gz
```
