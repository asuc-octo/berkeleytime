# berkeleytime-gql

New playground for the node/graphql rewrite

## Before you start

- Duplicate the `.env.example` file and rename it `.env`
- Run `npm install`

## Development

- Run `npm run dev`
- Start you docker container from the berkeleytime repo node branch

#### Access to the GraphQL Playground (Dev only)

- `http://localhost:5001/graphql`

## Folder structure

#### Overview

```
.
├── src                        # Where your source code lives
│   ├── bootstrap              # Bootstrapping and loading of the API dependencies (Express, Apollo, Database, ...)
│   ├── modules                # Business logic of the app divided by domain (eg: User, Post, Todo)
│   ├── tests                  # Where all our testing strategy lives
│   ├── utils                  # Collection of utils function that we use in the project
│   ├── config.ts              # Config of the app, sourced by environment variables
│   └── index.ts               # Entry point of the API
│
├── jest-mongodb-config.js     # Optional if you don't use MongoDB!
├── jest.config.js             # Jest configuration
├── docker-compose.yml         # Docker compose configuration (Optional !)
├── .env.example               # Example of what your .env file should look like
├── .gitignore                 # Standard gitignore file
├── package.json               # Node module dependencies
├── README.md                  # Simple readme file
└── tsconfig.json              # TypeScript compiler options
```

#### Module example (FOR NOW)

```
.
├── src
│   └── modules
│       └── user               # Module name
│           ├── index.ts       # Entrypoint to the module
│           ├── controller.ts  # Your crud controller methods
│           ├── fixture.ts     # Object used for testing (can ignore)
│           ├── formatter.ts   # Formats your db models to your controller/gql models
│           ├── model.ts       # Mongo schemas, models and types
│           ├── resolver.ts    # Your resolver
│           ├── schema.ts      # Your gql schemas (and potentially typscript interfaces associated to the schemas)
│           └── service.ts     # Business logic of your app
```

#### Build and start server for production

- Run `npm start`

#### Technologies used

- NodeJS and TypeScript
- GraphQL with Apollo Server
- MongoDB Database integrated with Mongoose
