# @repo/shared

The `@repo/shared` package contains shared utilities, constants, and configurations used across both frontend and backend applications.

## Local Development

This package is automatically available to all apps in the monorepo. No separate build step is required.

## Structure

```
packages/shared/
├── index.ts                   # Package entrypoint
├── metrics.ts                 # Rating metric definitions
├── ratingsConfig.ts           # Rating system configuration
├── persistedOperationFetch.ts # fetch() wrapper that sends persisted-operation IDs instead of GraphQL text
└── staff.ts                   # Staff-related utilities
```

## Usage

```typescript
import { MetricName, METRIC_MAPPINGS, METRIC_ORDER } from "@repo/shared";

// Access metric configuration
const usefulnessConfig = METRIC_MAPPINGS[MetricName.Usefulness];
console.log(usefulnessConfig.tooltip);
// "This refers to how beneficial the course is..."

// Get status label from average rating
const status = usefulnessConfig.getStatus(4.5);
// "Very Useful"
```

## Rating Metrics

The package defines the rating metrics used throughout Berkeleytime:

| Metric | Description | Rating Scale |
|--------|-------------|--------------|
| `Usefulness` | Course benefit for growth | Very Useful → Not Useful |
| `Difficulty` | Challenge level | Very Hard → Very Easy |
| `Workload` | Time/effort required | Very Heavy → Very Light |
| `Attendance` | Attendance requirement | Required / Not Required |
| `Recording` | Lecture recording availability | Recorded / Not Recorded |
| `Recommended` | Overall recommendation | Recommended / Not Recommended |

## Metric Configuration

Each metric includes:

- `tooltip` - Description shown to users
- `getStatus(avg)` - Converts numeric average to display label
- `isRating` - Whether it uses a 1-5 rating scale
- `isInverseRelationship` - Whether lower values are "better"

```typescript
export const METRIC_MAPPINGS = {
  [MetricName.Usefulness]: {
    tooltip: "This refers to how beneficial the course is...",
    getStatus: (avg: number) =>
      avg >= 4.3 ? "Very Useful" : avg >= 3.5 ? "Useful" : /* ... */,
    isRating: true,
    isInverseRelationship: false,
  },
  // ...
};
```

## Persisted-operation transport

`persistedOperationFetch` is the client half of the public GraphQL boundary. Every frontend's Apollo `HttpLink` uses it as its `fetch`: it hashes the GraphQL document and sends `{ id, variables }` to `/api/graphql`. The backend only executes documents whose hash is in its generated allowlist. See [the security guide](https://github.com/asuc-octo/berkeleytime/blob/main/docs/security/public-graphql-boundary.md).
