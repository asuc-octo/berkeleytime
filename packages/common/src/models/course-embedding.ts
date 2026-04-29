import { InferSchemaType, Model, Schema, model } from "mongoose";

const courseEmbeddingSchema = new Schema({
  // References courses.courseId (identifiers[type=cs-course-id])
  courseId: { type: String, required: true },
  subject: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: String, required: true },
  embedding: { type: [Number], required: true },
  refreshedAt: { type: Date, required: true },
});

// for term-based queries and deletions
courseEmbeddingSchema.index({ year: 1, semester: 1 });

// prevent duplicate embeddings per course per term
courseEmbeddingSchema.index(
  { courseId: 1, year: 1, semester: 1 },
  { unique: true }
);

export type CourseEmbeddingType = InferSchemaType<typeof courseEmbeddingSchema>;

export const CourseEmbeddingModel: Model<CourseEmbeddingType> =
  model<CourseEmbeddingType>("courseEmbeddings", courseEmbeddingSchema);
