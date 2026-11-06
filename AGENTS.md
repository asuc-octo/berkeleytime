# Berkeleytime Codebase Rules

## Project Overview

Berkeleytime is a course discovery and planning tool for UC Berkeley students. It combines academic information from UC Berkeley's Office of the Registrar and Engineering Integration Services (EIS) to provide students with course data, schedules, ratings, and planning tools.

## Architecture

This is a **monorepo** using Turbo for build orchestration. The codebase is organized into:

- **Apps**: All stored in the `app/` directory (backend, frontend, datapuller are the main ones)
- **Packages**: Shared code in `packages/` (theme, common, gql-typedefs, sis-api, shared, etc.)
- **Infrastructure**: Kubernetes/Helm charts in `infra/`

## Tech Stack

### Backend (`apps/backend`)
- **Runtime**: Node.js (>=22.12.0) with TypeScript
- **Framework**: Express.js
- **API**: Apollo GraphQL Server
- **Database**: MongoDB (Mongoose ORM)
- **Cache**: Redis
- **Auth**: Passport.js

### Frontend (`apps/frontend`)
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **GraphQL Client**: Apollo Client
- **Styling**: SCSS Modules
- **UI Components**: Custom components from `@repo/theme` (Radix UI based)
- **Routing**: React Router

### Other Services
- **Datapuller**: Service for pulling data from UC Berkeley APIs
- **Docs**: mdBook documentation site
- **Staff/AG Frontends**: Admin interfaces

## Code Organization Patterns

### Backend Modules (`apps/backend/src/modules/`)

Backend follows a **module-based architecture**. Each module represents a domain (User, Course, Rating, etc.) and follows this structure:

```
modules/[domain]/
  ├── typedefs/           # GraphQL schema definitions
  ├── generated-types/    # Generated TypeScript types (DO NOT EDIT)
  ├── controller.ts       # Database querying functions (Mongoose)
  ├── formatter.ts        # Optional: DB models → GraphQL types
  ├── resolver.ts         # GraphQL resolvers
  └── index.ts            # Module entrypoint
```

**Pipeline**: Request → Resolver → Controller → Database → Formatter → Response

- **DO NOT** edit files in `generated-types/` directories - they are auto-generated
- Use GraphQL Code Generation: run `npm run generate` in backend after schema changes
- Controllers use Mongoose to query MongoDB
- Formatters translate DB models to GraphQL types (only if types differ)

### Frontend Structure (`apps/frontend/src/`)

```
src/
  ├── app/                # Views, pages, and scoped components
  ├── components/         # Reusable React components
  ├── contexts/           # React contexts
  ├── hooks/              # React hooks
  ├── lib/                # Utility functions and logic
  │   └── api/            # GraphQL queries, mutations, and types
  └── utils/              # Utility functions
```

- Use **SCSS Modules** for component styling: `[Component].module.scss`
- Component folders: `index.tsx` + `[Component].module.scss`
- Child components should be extracted when logic becomes complex or reusable
   - Reusable Berkeleytime-specific components (such as a ClassCard) should be put in `components/`
   - Reusable generic components (like a Select) should be put in the parent `packages/theme/src/components` folder

## Conventions

### TypeScript
- Use strict TypeScript
- Generate types from GraphQL schemas - don't write them manually for API query related types
- Use generated types from `generated-types/` directories

### GraphQL
- Overall schemas defined in `packages/gql-typedefs`
- **Backend**: Resolvers are defined in in `resolver.ts`
- **Frontend**: Define queries/mutations in `lib/api/`, use Apollo Client hooks
- Always run `npm run generate` after GraphQL schema changes
- Use GraphQL Code Generation for type safety

### Styling
- Use SCSS Modules (`.module.scss`) for component styles
- Use Bootstrap utility classes (`m-*`, `p-*`) for simple spacing when appropriate
- Import styles: `import styles from "./Component.module.scss"`
- Use `classNames` utility (or similar) when combining classes instead of manual string manipulation (e.g., `classNames(styles.base, { [styles.active]: isActive })` instead of `styles.base + (isActive ? ' ' + styles.active : '')`)
- Use/extend `@repo/theme` components when available instead of building custom ones

### File Naming
- Components: PascalCase (`RatingButton.tsx`)
- Utilities/hooks: camelCase (`ratingErrorMessages.ts`, `useReadClass.ts`)
- SCSS modules: `[Component].module.scss`

## Shared Packages

- **`@repo/theme`**: UI component library (Radix UI primitives + Berkeleytime-specific)
- **`@repo/common`**: Shared utilities and types
- **`@repo/gql-typedefs`**: Shared GraphQL type definitions
- **`@repo/sis-api`**: Auto-generated TypeScript clients for UC Berkeley APIs
- **`@repo/shared`**: Shared business logic

Use these packages rather than duplicating code across apps.

## Development Workflow

1. **Type Generation**: Always run `npm run generate` after GraphQL changes
2. **Type-Check**: Uses `tsc` (`npm run type-check`)
3. **Linting**: Use ESLint (configured in `packages/eslint-config`, `npm run lint`)
4. **Formatting**: Prettier with import sorting (configured in `.prettierrc`)
5. **Docker**: Development uses Docker Compose. `docker compose up` will setup all services. Use the `--build` flag after significant changes, otherwise hot-reload is enabled.
6. **Turbo**: Use `npm run dev`, `npm run build`, etc. from root (Turbo handles orchestration)

## Pull Requests and Linear Tickets

Every pull request must link to a Linear ticket. No ticket means no pull request.

If you receive a pull request with no ticket, do not review it. Ask the author to add the ticket first.

The ticket is the durable record of reasoning. Pull request discussion is not durable. Write the ticket for the next person, who joins with no context.

**The ticket must contain:**
- The problem, in the user's words
- What the change does

**Add these only when the change has them:**
- Why you chose this approach, and which alternatives you rejected
- Known limits, and scope you deliberately left out

**Keep these out of the ticket:**
- A restatement of the diff
- Review comments and replies
- Anything that goes stale

**How to link:**
- Search the Berkeleytime workspace (`https://linear.app/berkeleytime/`), team key `BER`, before you create anything. Reuse a ticket that already covers the change. If you cannot reach Linear, stop and ask the author for the ticket link.
- Otherwise, create the ticket yourself.
- Skip this step for dependabot pull requests. A bot cannot own a ticket.
- Title the pull request `[BER-NNNN] <outcome>`, for example `[BER-123] Catalog Lists Load Faster`. Write the outcome, not the implementation.
- Put the identifier and URL in the pull request body before you open it, for example `Linear: https://linear.app/berkeleytime/issue/BER-95`.
- Put the identifier in the branch name when practical, for example `fix/BER-95-catalog-sort`.

**The test:** a new reader must explain why the change exists. Ask this reader to read only the ticket. If the reader cannot explain it, the ticket is not finished.

## Important Notes

- **Generated Code**: Never edit `generated-types/`, `generated-typedefs/`, or `generated/` directories
- **Database Models**: Defined in `packages/common/src/models/` (Mongoose schemas)
- **Environment Variables**: Use `.env` files (see `.env.template`)
- **Monorepo**: Changes to packages may require rebuilding dependent apps
- **Public GraphQL boundary**: `/api/graphql` accepts only generated persisted-operation IDs; never mount raw Apollo HTTP middleware

## When Adding Features

### Backend (GraphQL API)
1. Add GraphQL type definitions in module's `typedefs/`
2. Add controller functions for database queries
3. Add resolver functions that call controllers
4. Add formatter if DB model differs from GraphQL type
5. Run `npm run generate` to generate types
6. Export module in `src/modules/index.ts`

### Frontend (React Components)
1. Add GraphQL queries/mutations in `lib/api/`
2. Create components in `app/` (page-specific) or `components/` (reusable)
3. Use Apollo Client hooks (`useQuery`, `useMutation`). With these, always use the generated `...Document` types, NEVER the raw exported string.
4. Use SCSS Modules for styling
5. Use components from `@repo/theme` when possible
6. Try to use Apollo GraphQL's caching patterns when possible
7. Use color CSS variables defined in `packages/theme/src/components/ThemeProvider/ThemeProvider.scss` for consistency with light and dark mode

## Common Patterns

- **Error Handling**: Use GraphQL error codes (UNAUTHENTICATED, BAD_USER_INPUT, etc.)
- **Authentication**: Handled by Passport.js in backend, check auth status in resolvers
- **Caching**: Redis is used for caching - check backend code for cache patterns
- **Data Sources**: UC Berkeley APIs accessed via `@repo/sis-api` package

