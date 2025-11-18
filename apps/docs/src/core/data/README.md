# Data


<!-- toc -->

## Why is Data Important at Berkeleytime?

At its core, Berkeleytime serves as a data aggregation platform. We work directly with the [Office of the Registrar](https://registrar.berkeley.edu/) and the [Engineering and Integration Services department](https://integration-services.berkeley.edu/home) (EIS) to pull data from multiple sources and provide students with the most accurate experience possible. Because data involving students can contain [personally-identifiable information](https://en.wikipedia.org/wiki/Personal_data) (PII), we must ensure we follow any and all data storage and use guidelines imposed by the university.

Understanding the data sources Berkeleytime has access to is imperative for building streamlined services.

## API Central

The EIS maintains many [RESTful](https://en.wikipedia.org/wiki/REST) APIs that consolidate data from various other sources, and provides documentation in the form of [Swagger OpenAPI v3 specifications](https://swagger.io/specification/) for each API. [API Central](https://developers.api.berkeley.edu/) serves as a portal for requesting access to individual APIs, interactive documentation, and managing API usage. Berkeleytime only has access to and utilizes the APIs necessary for servicing students.

### Accessing APIs

HTTP requests to APIs must be authenticated with a client identifier and secret key pair and are rate limited to minimize unauthorized access and preserve system health.

> [!WARNING]
> Client identifiers and secret keys **should be treated as sensitive information** and **should never be shared with third-parties**.

TypeScript API clients and types are automatically generated from the specifications using [swagger-typescript-api](https://www.npmjs.com/package/swagger-typescript-api) and are provided as a [local package](https://github.com/asuc-octo/berkeleytime/tree/gql/packages/sis-api) for Berkeleytime apps to access.

```ts
import { Class, ClassesAPI } from "@repo/sis-api/classes";

const classesAPI = new ClassesAPI();

classesAPI.v1.getClassesUsingGet(...);
```

### Class API

The [Class API](https://developers.api.berkeley.edu/api/18) provides data about classes, sections, and enrollment.

- **Classes** are offerings of a course in a specific term. There can be many classes for a given course, and even multiple classes for a given course in the same semester. Not all classes for a course need to include the same content either. An example of a class would be COMPSCI 61A Lecture 001 offered in Spring 2024. Classes themselves do not have facilitators, locations, or times associated with them. Instead, they are most always associated with a primary section.
- **Sections** are associated with classes and are combinations of meetings, locations, and facilitators. There are many types of sections, such as lectures, labs, discussions, and seminars. Each class most always has a primary section and can have any number of secondary sections.

Students don't necessarily enroll only in classes, but also a combination of sections.

### Course API

The [Course API](https://developers.api.berkeley.edu/api/100) provides data about courses.

- **Courses** are subject offerings that satisfy specific requirements or include certain curriculum. An example of a course would be COMPSCI 61A. However, multiple COMPSCI 61A courses might exist historically changing requirements and curriculum require new courses to be created and old courses to be deprecated. Only one course may be active for any given subject and number at a time.

### Term API v2

The [Term API v2](https://developers.api.berkeley.edu/api/232) provides data about terms and sessions.

- **Terms** are time periods during which classes are offered. Terms at Berkeley typically fall under the Spring and Fall semesters, but Berkeley also offers a Summer term and previously offered a Winter term (in the 1900s). Terms are most always associated with at least one session.
- **Sessions** are more granular time periods within a semester during which groups of classes are offered. The Spring and Fall semesters at Berkeley consist only of a single session that spans the entire semester, but the Summer term consists of [multiple sessions of varying lengths](https://summer.berkeley.edu/registration/schedule#deadlines) depending on the year.

