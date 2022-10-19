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

## Typesafety

The main concern for typesafety comes from the potential inconsistency between `typedefs` (GraphQL SDL) and your actual resolvers. To maintain typesafety, we use [GraphQL Code Generation](https://www.the-guild.dev/graphql/codegen/docs/getting-started) to generate types for schemas, resolvers and more.

To generate types, run `npm run generate`

### Typesafety with Modules

Type safety is also set up within modules, see the [documentation](https://www.the-guild.dev/graphql/codegen/docs/guides/graphql-modules) for more details.

## Folder structure

#### Overview

```
.
├── src                        # Where your source code lives
│   ├── bootstrap              # Bootstrapping and loading of the API dependencies (Express, Apollo, Database, ...)
│   ├── generated-types        # Generated types from codegen
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
└── codegen.ts                 # Code generation configurations
├── package.json               # Node module dependencies
├── README.md                  # Simple readme file
└── tsconfig.json              # TypeScript compiler options
```

#### Module example (FOR NOW)

```
.
├── src
│   └── modules
│       └── user                      # Module name
│           ├── index.ts              # Entrypoint to the module
│           └── generated-types       # Generated types from codegen
│               └── module-types.ts   # Relevant GraphQL typescript types
│           └── typedefs              # Typedefs
│               └── [schema].ts       # A typedef for a schema
│           ├── controller.ts         # Your crud controller methods
│           ├── fixture.ts            # Object used for testing (can ignore)
│           ├── formatter.ts          # Formats your db models to your controller/gql models
│           ├── model.ts              # Mongo schemas, models and types
│           ├── resolver.ts           # Your resolver
│           ├── schema.ts             # Your gql schemas (and potentially typscript interfaces associated to the schemas)
│           └── service.ts            # Business logic of your app
```

#### Build and start server for production

- Run `npm start`

#### Technologies used

- NodeJS and TypeScript
- GraphQL with Apollo Server
- MongoDB Database integrated with Mongoose
