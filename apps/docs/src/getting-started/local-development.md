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

The Berkeleytime application should now be running locally at `http://localhost:3000`! Make sure that each page (catalog, grades, etc.) is working as expected.

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

## Ports
`docker compose up` will automatically setup certain services on your localhost ports. By default, `DEV_PORT_PREFIX` is set to `30`, which means services will be available on ports starting with `30XX`. You can adjust this by setting the `DEV_PORT_PREFIX` environment variable if you need to run multiple instances of the repository in parallel (e.g., for git worktree setups).

The following ports are used by default (`DEV_PORT_PREFIX=30`):

- **3000**: Main frontend and backend API (via nginx)
- **3001**: AG frontend (via nginx)
- **3002**: Staff frontend (via nginx)
- **3003**: Docs
- **3004**: Redis
- **3005**: Storybook
- **3006**: MinIO API (requires `--profile dev`)
- **3007**: MinIO Console (requires `--profile dev`)
- **3008**: MongoDB

To use a different port prefix, set the `DEV_PORT_PREFIX` environment variable before running `docker compose up`:
```sh
DEV_PORT_PREFIX=80 docker compose up -d
```

> **Note:** Currently only `DEV_PORT_PREFIX=30` (default) and `DEV_PORT_PREFIX=80` are fully supported. Additional port prefixes require updating the Google Cloud OAuth authorized redirect URIs.

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
