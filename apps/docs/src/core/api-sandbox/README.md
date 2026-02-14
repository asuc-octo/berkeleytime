# API Sandbox

The API Sandbox is a local development tool for testing and exploring UC Berkeley's Student Information System (SIS) APIs. It provides an interactive UI to make API requests and inspect responses without writing any code.

## Quick Start

### Running Locally

```bash
# From the repository root
docker compose -f docker-compose.api-sandbox.yml up --build
```

The sandbox will be available at [http://localhost:3009](http://localhost:3009), assuming your `DEV_BASE_PORT` environment variable is `30`.

```

## Features

- **Multiple API Support**: Test Classes, Courses, and Terms APIs
- **All Endpoints**: Access all available SIS API endpoints
- **Dynamic Parameters**: Input fields for all query parameters
- **Pagination**: Navigate through paginated results with Previous/Next buttons
- **JSON Response Viewer**: Formatted, syntax-highlighted response display
- **Response Metrics**: View response time and item counts

## API Credentials

The sandbox requires SIS API credentials (`app_id` and `app_key`) to make requests.

### Automatic Loading from .env

When running via Docker, credentials are automatically loaded from your `.env` file:

```bash
# .env
SIS_CLASS_APP_ID=your_class_api_id
SIS_CLASS_APP_KEY=your_class_api_key
SIS_COURSE_APP_ID=your_course_api_id
SIS_COURSE_APP_KEY=your_course_api_key
SIS_TERM_APP_ID=your_term_api_id
SIS_TERM_APP_KEY=your_term_api_key
```

The sandbox uses the appropriate credentials based on the selected API type:
- **Classes API** uses `SIS_CLASS_APP_ID` / `SIS_CLASS_APP_KEY`
- **Courses API** uses `SIS_COURSE_APP_ID` / `SIS_COURSE_APP_KEY`
- **Terms API** uses `SIS_TERM_APP_ID` / `SIS_TERM_APP_KEY`

### Manual Entry

You can also enter credentials manually in the UI. Any manual changes will override the `.env` values until you click "Reset to .env".

> [!NOTE]
> Credentials are injected at build time and only work for local development. Never deploy this app publicly as it would expose your API keys.

## Available APIs

### Classes API (`/v1/classes`)

| Endpoint | Description |
|----------|-------------|
| `getClasses` | Get class data (requires term-id or cs-course-id) |
| `getClassSections` | Get class section data |
| `getClassDescriptors` | Get allowable code/descriptor pairs |
| `getClassSectionDescriptors` | Get class section descriptors |

### Courses API (`/v5/courses`)

| Endpoint | Description |
|----------|-------------|
| `getCourses` | Get course catalog data |
| `getCourseById` | Get course by ID or display name |
| `getCoursesV4` | Get courses using v4 API (more parameters) |

### Terms API (`/v2/terms`)

| Endpoint | Description |
|----------|-------------|
| `getTerms` | Get terms by query parameters |
| `getTermById` | Get term by ID |

## Pagination

Many endpoints support pagination with these parameters:

- **page-number**: The page to retrieve (default: 1)
- **page-size**: Results per page (default: 50, max: 100)

Use the Previous/Next buttons in the response header to navigate pages. The sandbox automatically tracks the current page number.

## Example Queries

### Get all CS classes for a term

1. Select **Classes API** > **getClasses**
2. Set **Term ID**: `2248` (Fall 2024)
3. Set **Subject Area Code**: `COMPSCI`
4. Click **Send Request**

### Search for a specific course

1. Select **Courses API** > **getCourseById**
2. Set **Course ID**: `COMPSCI 61A`
3. Click **Send Request**

### Get current term information

1. Select **Terms API** > **getTerms**
2. Set **Temporal Position**: `Current`
3. Click **Send Request**

## Troubleshooting

### Credentials not loading

Make sure your `.env` file has the correct variable names and rebuild the Docker container:

```bash
docker compose -f docker-compose.api-sandbox.yml up --build
```

### API returns 401 Unauthorized

Your credentials may be invalid or expired. Verify them in [API Central](https://api-central.berkeley.edu/).

### CORS errors

The SIS API should allow requests from localhost. If you encounter CORS issues, try running via Docker as the container handles this properly.

## Related Documentation

- [@repo/sis-api](../packages/sis-api.md) - Generated TypeScript clients
- [Data Documentation](../data/README.md) - Data sources overview
- [Datapuller](../datapuller/README.md) - Production data fetching
