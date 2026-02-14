# @repo/gql-typedefs

The `@repo/gql-typedefs` package contains the GraphQL type definitions (schemas) shared across the backend and frontend applications. These definitions serve as the single source of truth for the GraphQL API schema.

## Local Development

When modifying GraphQL schemas, you need to regenerate types in both the backend and frontend. This can be done with a single command:

```bash
npx turbo run generate
```

## Structure

```
packages/gql-typedefs/
├── index.ts              # Package entrypoint (re-exports all typedefs)
├── common.ts             # Common types (scalars, enums)
├── course.ts             # Course-related types
├── class.ts              # Class-related types
├── section.ts            # Section types
├── term.ts               # Term types
├── user.ts               # User types
├── rating.ts             # Rating types
├── enrollment.ts         # Enrollment types
├── grade-distribution.ts # Grade distribution types
├── schedule.ts           # Schedule types
├── plan.ts               # Academic plan types
├── collection.ts         # Collection types
├── catalog.ts            # Course catalog types
├── analytics.ts          # Analytics types
└── ...
```

## Usage

The type definitions are written using the `gql` template literal tag:

```typescript
// packages/gql-typedefs/course.ts
import { gql } from "graphql-tag";

export const courseTypeDefs = gql`
  type Course {
    courseId: CourseIdentifier!
    subject: String!
    number: CourseNumber!
    title: String!
    description: String
    units: Float
    gradeDistribution: GradeDistribution
  }

  type Query {
    course(subject: String!, number: CourseNumber!): Course
    courses: [Course!]!
  }
`;
```

## How It Works

1. **Schema Definition**: Type definitions are written in GraphQL SDL format
2. **Frontend Codegen**: The frontend's `codegen.ts` reads these schemas and generates TypeScript types for queries
3. **Backend Codegen**: The backend's `codegen.ts` generates resolver types from these schemas

```
┌─────────────────────┐
│  @repo/gql-typedefs │
│   (GraphQL SDL)     │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│ Backend │ │Frontend │
│ codegen │ │ codegen │
└────┬────┘ └────┬────┘
     ▼           ▼
┌─────────┐ ┌─────────┐
│Resolver │ │ Query   │
│ Types   │ │ Types   │
└─────────┘ └─────────┘
```

## Adding New Types

1. Create or modify a type definition file in `packages/gql-typedefs/`
2. Export it from `index.ts` if it's a new file
3. Run codegen in both backend and frontend
4. Implement the resolver in the backend
5. Use the generated types in the frontend

> [!TIP]
> Keep related types together in the same file. For example, all enrollment-related types should be in `enrollment.ts`.
