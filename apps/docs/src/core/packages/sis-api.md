# @repo/sis-api

The `@repo/sis-api` package contains auto-generated TypeScript clients for UC Berkeley's Student Information System (SIS) APIs. These clients are used by the datapuller to fetch course, class, and term data.

## Local Development

The API clients are pre-generated from OpenAPI specifications. To regenerate after spec updates:

```bash
cd packages/sis-api && npm run build
```

> [!WARNING]
> The SIS API specs are rate-limited. Specs are stored locally in the `specs/` directory rather than fetched at build time.

## Structure

```
packages/sis-api/
├── src/
│   └── index.ts          # Generation script
├── specs/                # OpenAPI specification files
│   ├── courses.json
│   ├── classes.json
│   └── terms.json
├── dist/                 # Generated TypeScript clients
│   ├── courses.ts
│   ├── classes.ts
│   └── terms.ts
└── package.json
```

## Usage

Import and use the generated API clients:

```typescript
import { CoursesAPI } from "@repo/sis-api/courses";
import { ClassesAPI } from "@repo/sis-api/classes";
import { TermsAPI } from "@repo/sis-api/terms";

// Initialize client with API credentials
const coursesApi = new CoursesAPI({
  headers: {
    "app_id": process.env.SIS_APP_ID,
    "app_key": process.env.SIS_APP_KEY,
  },
});

// Fetch courses
const response = await coursesApi.getCourses({
  "subject-area-code": "COMPSCI",
});
```

## Generation Process

The package uses [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) to generate TypeScript clients from OpenAPI specifications:

```typescript
import { generateApi } from "swagger-typescript-api";

generateApi({
  fileName: `${name}.ts`,
  output: path.resolve(process.cwd(), "./dist"),
  input: path.resolve(process.cwd(), "./specs", spec),
  singleHttpClient: false,
  apiClassName: `${name[0].toUpperCase()}${name.slice(1)}API`,
});
```

## Available APIs

| API | Description | Primary Use |
|-----|-------------|-------------|
| `CoursesAPI` | Course catalog data | Course information, descriptions, prerequisites |
| `ClassesAPI` | Class offerings | Sections, instructors, meeting times |
| `TermsAPI` | Academic terms | Term dates, sessions |

## API Credentials

Access to SIS APIs requires credentials from UC Berkeley's API Central:

- `SIS_APP_ID` - Application identifier
- `SIS_APP_KEY` - Secret key

These are configured in the environment and should never be committed to version control.

> [!NOTE]
> For more information about data sources and API access, see the [Data documentation](../data/README.md).
