export const schemaOptions = {
  id: false,
  timestamps: {
    createdAt: "_createdAt",
    updatedAt: "_updatedAt",
  },
};

export const SEMESTER_ENUM = ["Spring", "Summer", "Fall", "Winter"] as const;
