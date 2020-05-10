# ts-graphql-starter

A GraphQL API starter using NodeJS, TypeScript and Apollo Server

## Folder structure

#### Overview

```
.
├── src                        # Where your source code lives
│   ├── bootstrap              # Bootstrapping and loading of the API dependencies (Express, Apollo, Database, ...)
│   ├── entities               # Used to generate typing, schemas and ORM models
│   ├── modules                # Business logic of the app divided by domain (eg: User, Post, Todo)
│   ├── config.ts              # Config of the app, sourced by environment variables
│   └── index.ts               # Entry point of the API
│
├── .gitignore                 # Standard gitignore file
├── package.json               # Node module dependencies
├── README.md                  # Simple readme file
└── tsconfig.json              # TypeScript compiler options
```

#### Module example (Domain)

```
.
├── src
│   └── modules
│       └── user               # Module name
│           ├── input.ts       # Input validation for mutations and queries using class-validator
│           ├── model.ts       # Database model
│           ├── resolver.ts    # GraphQL revolver
│           └── service.ts     # Business logic of your app
```
