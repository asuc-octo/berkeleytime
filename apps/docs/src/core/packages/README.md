# Packages

<!-- toc -->

Berkeleytime uses a monorepo architecture managed by [Turborepo](https://turbo.build/repo/docs). The `packages/` directory contains shared code and configurations used across multiple applications.

## Overview

| Package | Description |
|---------|-------------|
| [@repo/common](./common.md) | Shared database models, TypeScript types, and utilities |
| [@repo/theme](./theme.md) | React design system with Radix UI components |
| [@repo/shared](./shared.md) | Shared utilities, metrics, and rating configurations |
| [@repo/gql-typedefs](./gql-typedefs.md) | GraphQL type definitions shared across apps |
| [@repo/sis-api](./sis-api.md) | Auto-generated TypeScript client for UC Berkeley SIS APIs |
| [@repo/eslint-config](./eslint-config.md) | Shared ESLint configuration |
| [@repo/typescript-config](./typescript-config.md) | Shared TypeScript configuration presets |

## Package Dependencies

The following diagram shows how packages relate to each other and to the apps:

```
┌─────────────────────────────────────────────────────────────────┐
│                           Apps                                   │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│  frontend   │   backend   │  datapuller │  staff-frontend, etc.  │
└──────┬──────┴──────┬──────┴──────┬──────┴──────────┬──────────────┘
       │             │             │                 │
       ▼             ▼             ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Packages                                 │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│   @repo/    │   @repo/    │   @repo/    │       @repo/           │
│   theme     │   common    │   sis-api   │    gql-typedefs        │
├─────────────┼─────────────┼─────────────┼─────────────────────────┤
│   @repo/    │   @repo/    │             │                        │
│   shared    │   eslint-   │             │                        │
│             │   config    │             │                        │
└─────────────┴─────────────┴─────────────┴─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│               @repo/typescript-config                            │
│         (Base configuration for all packages)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Using Packages

Packages are referenced in `package.json` using the workspace protocol:

```json
{
  "dependencies": {
    "@repo/common": "*",
    "@repo/theme": "*"
  },
  "devDependencies": {
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*"
  }
}
```

Turborepo handles building packages in the correct order based on their dependencies.
