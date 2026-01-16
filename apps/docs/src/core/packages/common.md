# @repo/common

The `@repo/common` package contains shared database models, TypeScript types, and utility functions used across the backend and datapuller applications.

## Local Development

This package is automatically built as part of the Turborepo build pipeline. No separate build step is required for local development.

## Structure

```
packages/common/
├── src/
│   ├── models/           # Mongoose models and TypeScript interfaces
│   │   ├── class.ts
│   │   ├── course.ts
│   │   ├── section.ts
│   │   ├── term.ts
│   │   ├── user.ts
│   │   ├── rating.ts
│   │   ├── grade-distribution.ts
│   │   ├── schedule.ts
│   │   ├── plan.ts
│   │   └── ...
│   ├── utils/            # Shared utility functions
│   │   └── grade-distribution.ts
│   ├── lib/              # Common library functions
│   │   ├── common.ts
│   │   └── sis.ts
│   └── index.ts          # Package entrypoint
└── package.json
```

## Usage

Import models and types from the package:

```typescript
import { CourseModel, ICourseItem, ClassModel, IClassItem } from "@repo/common";

// Query courses
const courses = await CourseModel.find({ subject: "COMPSCI" });

// Use TypeScript interfaces
const course: ICourseItem = {
  // ...
};
```

## Database Models

Each model file typically contains:

1. **TypeScript interfaces** - Define the shape of documents
2. **Mongoose schema** - Define validation and structure
3. **Database indexes** - Optimize query performance
4. **Mongoose model** - Export the model for querying

Example model structure:

```typescript
// Interface for the document
export interface ITermItem {
  termId: string;
  name: string;
  // ...
}

// Mongoose schema
const termSchema = new Schema<ITermItem>({
  termId: { type: String, required: true },
  name: { type: String, required: true },
  // ...
});

// Database indexes
termSchema.index({ termId: 1 }, { unique: true });

// Export model
export const TermModel: Model<ITermItem> = model<ITermItem>("Term", termSchema);
```

## Available Models

| Model | Description |
|-------|-------------|
| `ClassModel` | Individual class offerings per semester |
| `CourseModel` | Course information (subject, number, title, description) |
| `SectionModel` | Class sections with meetings and instructors |
| `TermModel` | Academic terms and sessions |
| `UserModel` | User accounts and authentication |
| `RatingModel` | Course ratings submitted by students |
| `GradeDistributionModel` | Historical grade distributions |
| `ScheduleModel` | User-created schedules |
| `PlanModel` | Multi-year academic plans |
| `EnrollmentHistoryModel` | Enrollment data over time |
| `CollectionModel` | User-curated course collections |
