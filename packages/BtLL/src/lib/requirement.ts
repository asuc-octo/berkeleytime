// no constructor
import { argSplit } from "../helper";
import { evaluate } from "../interpreter";
import {
  BtLLConfig,
  Data,
  FunctionMapEntry,
  Type,
  Variables,
} from "../types";

export type Requirement = {
  result: Data<boolean>;
  description: Data<string>;
  type: Data<string>;
};

export type BooleanRequirement = Requirement & {
  value: Data<boolean>;
};

export type NCoursesRequirement = Requirement & {
  courses: Data<Array<any>>;
  required_count: Data<number>;
};

export type CourseListRequirement = Requirement & {
  required_courses: Data<Array<any>>;
  met_status: Data<Array<boolean>>;
};

export type AndRequirement = Requirement & {
  requirements: Data<Array<Requirement>>;
};

export type OrRequirement = Requirement & {
  requirements: Data<Array<Requirement>>;
};

export type NumberRequirement = Requirement & {
  actual: Data<number>;
  required: Data<number>;
};

export const constructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<Requirement> => {
  const [result, description] = argSplit(v.substring(1, v.length - 1));
  return {
    data: {
      result: evaluate(result, "boolean", variables, config),
      description: evaluate(description, "string", variables, config),
      type: { data: "Requirement", type: "string" },
    },
    type: "Requirement",
  };
};

export const definedFields = ["result", "description", "type"];

// Helper function to create BooleanRequirement from evaluated Data objects
const createBooleanRequirement = (
  value: Data<boolean>,
  description: Data<string>
): Data<BooleanRequirement> => {
  return {
    data: {
      value,
      result: value,
      description,
      type: { data: "BooleanRequirement", type: "string" },
    },
    type: "BooleanRequirement",
  };
};

// BooleanRequirement constructor and fields
export const booleanRequirementConstructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<BooleanRequirement> => {
  const [value, description] = argSplit(v.substring(1, v.length - 1));
  const valueData: Data<boolean> = evaluate(
    value,
    "boolean",
    variables,
    config
  );
  const descriptionData = evaluate(description, "string", variables, config);
  return createBooleanRequirement(valueData, descriptionData);
};

export const booleanRequirementDefinedFields = [
  "result",
  "description",
  "value",
  "type",
];

// Helper function to create NCoursesRequirement from evaluated Data objects
const createNCoursesRequirement = (
  courses: Data<Array<any>>,
  required_count: Data<number>,
  description: Data<string>
): Data<NCoursesRequirement> => {
  const result = {
    data: courses.data.length >= required_count.data,
    type: "boolean" as Type,
  };
  return {
    data: {
      courses,
      required_count,
      result,
      description,
      type: { data: "NCoursesRequirement", type: "string" },
    },
    type: "NCoursesRequirement",
  };
};

// NCoursesRequirement constructor and fields
export const nCoursesRequirementConstructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<NCoursesRequirement> => {
  const [courses, required_count, description] = argSplit(
    v.substring(1, v.length - 1)
  );
  const coursesData = evaluate(courses, "List<Course>", variables, config);
  const requiredCountData = evaluate(
    required_count,
    "number",
    variables,
    config
  );
  const descriptionData = evaluate(description, "string", variables, config);
  return createNCoursesRequirement(
    coursesData,
    requiredCountData,
    descriptionData
  );
};

export const nCoursesRequirementDefinedFields = [
  "result",
  "description",
  "courses",
  "required_count",
  "type",
];

// Helper function to create CourseListRequirement from evaluated Data objects
const createCourseListRequirement = (
  required_courses: Data<Array<any>>,
  met_status: Data<Array<boolean>>,
  description: Data<string>
): Data<CourseListRequirement> => {
  const result = {
    data: met_status.data.every((status: boolean) => status),
    type: "boolean" as Type,
  };
  return {
    data: {
      required_courses,
      met_status,
      result,
      description,
      type: { data: "CourseListRequirement", type: "string" },
    },
    type: "CourseListRequirement",
  };
};

// CourseListRequirement constructor and fields
export const courseListRequirementConstructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<CourseListRequirement> => {
  const [required_courses, met_status, description] = argSplit(
    v.substring(1, v.length - 1)
  );
  const requiredCoursesData = evaluate(
    required_courses,
    "List<Course>",
    variables,
    config
  );
  const metStatusData = evaluate(
    met_status,
    "List<boolean>",
    variables,
    config
  );
  const descriptionData = evaluate(description, "string", variables, config);
  return createCourseListRequirement(
    requiredCoursesData,
    metStatusData,
    descriptionData
  );
};

export const courseListRequirementDefinedFields = [
  "result",
  "description",
  "required_courses",
  "met_status",
  "type",
];

// Helper function to create AndRequirement from evaluated Data objects
const createAndRequirement = (
  requirements: Data<Array<Requirement>>,
  description: Data<string>
): Data<AndRequirement> => {
  const result = {
    data: requirements.data.every((req: Requirement) => req.result.data),
    type: "boolean" as Type,
  };
  return {
    data: {
      requirements,
      result,
      description,
      type: { data: "AndRequirement", type: "string" },
    },
    type: "AndRequirement",
  };
};

// AndRequirement constructor and fields
export const andRequirementConstructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<AndRequirement> => {
  const [requirements, description] = argSplit(v.substring(1, v.length - 1));
  const requirementsData = evaluate(
    requirements,
    "List<Requirement>",
    variables,
    config
  );
  const descriptionData = evaluate(description, "string", variables, config);
  return createAndRequirement(requirementsData, descriptionData);
};

export const andRequirementDefinedFields = [
  "result",
  "description",
  "requirements",
  "type",
];

// Helper function to create OrRequirement from evaluated Data objects
const createOrRequirement = (
  requirements: Data<Array<Requirement>>,
  description: Data<string>
): Data<OrRequirement> => {
  const result = {
    data: requirements.data.some((req: Requirement) => req.result.data),
    type: "boolean" as Type,
  };
  return {
    data: {
      requirements,
      result,
      description,
      type: { data: "OrRequirement", type: "string" },
    },
    type: "OrRequirement",
  };
};

// OrRequirement constructor and fields
export const orRequirementConstructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<OrRequirement> => {
  const [requirements, description] = argSplit(v.substring(1, v.length - 1));
  const requirementsData = evaluate(
    requirements,
    "List<Requirement>",
    variables,
    config
  );
  const descriptionData = evaluate(description, "string", variables, config);
  return createOrRequirement(requirementsData, descriptionData);
};

export const orRequirementDefinedFields = [
  "result",
  "description",
  "requirements",
  "type",
];

// Helper function to create NumberRequirement from evaluated Data objects
const createNumberRequirement = (
  actual: Data<number>,
  required: Data<number>,
  description: Data<string>
): Data<NumberRequirement> => {
  const result = {
    data: actual.data >= required.data,
    type: "boolean" as Type,
  };
  return {
    data: {
      actual,
      required,
      result,
      description,
      type: { data: "NumberRequirement", type: "string" },
    },
    type: "NumberRequirement",
  };
};

// NumberRequirement constructor and fields
export const numberRequirementConstructor = (
  _: Type,
  v: string,
  variables: Variables,
  config: BtLLConfig = {}
): Data<NumberRequirement> => {
  const [actual, required, description] = argSplit(
    v.substring(1, v.length - 1)
  );
  const actualData = evaluate(actual, "number", variables, config);
  const requiredData = evaluate(required, "number", variables, config);
  const descriptionData = evaluate(description, "string", variables, config);
  return createNumberRequirement(actualData, requiredData, descriptionData);
};

export const numberRequirementDefinedFields = [
  "result",
  "description",
  "actual",
  "required",
  "type",
];

export const extendedByType = [
  "BooleanRequirement",
  "NCoursesRequirement",
  "CourseListRequirement",
  "AndRequirement",
  "OrRequirement",
  "NumberRequirement",
];

export const functions: FunctionMapEntry[] = [
  [
    "BooleanRequirement",
    {
      type: "Function<Requirement>(boolean, string)",
      data: {
        eval: (
          _: Variables,
          value: Data<boolean>,
          description: Data<string>
        ) => {
          return createBooleanRequirement(value, description);
        },
        args: ["boolean", "string"],
      },
    },
  ],
  [
    "NCoursesRequirement",
    {
      type: "Function<Requirement>(List<Course>, number, string)",
      data: {
        eval: (
          _: Variables,
          courses: Data<Array<any>>,
          required_count: Data<number>,
          description: Data<string>
        ) => {
          return createNCoursesRequirement(
            courses,
            required_count,
            description
          );
        },
        args: ["List<Course>", "number", "string"],
      },
    },
  ],
  [
    "CourseListRequirement",
    {
      type: "Function<Requirement>(List<Course>, List<boolean>, string)",
      data: {
        eval: (
          _: Variables,
          required_courses: Data<Array<any>>,
          met_status: Data<Array<boolean>>,
          description: Data<string>
        ) => {
          return createCourseListRequirement(
            required_courses,
            met_status,
            description
          );
        },
        args: ["List<Course>", "List<boolean>", "string"],
      },
    },
  ],
  [
    "AndRequirement",
    {
      type: "Function<Requirement>(List<Requirement>, string)",
      data: {
        eval: (
          _: Variables,
          requirements: Data<Array<Requirement>>,
          description: Data<string>
        ) => {
          return createAndRequirement(requirements, description);
        },
        args: ["List<Requirement>", "string"],
      },
    },
  ],
  [
    "OrRequirement",
    {
      type: "Function<Requirement>(List<Requirement>, string)",
      data: {
        eval: (
          _: Variables,
          requirements: Data<Array<Requirement>>,
          description: Data<string>
        ) => {
          return createOrRequirement(requirements, description);
        },
        args: ["List<Requirement>", "string"],
      },
    },
  ],
  [
    "NumberRequirement",
    {
      type: "Function<Requirement>(number, number, string)",
      data: {
        eval: (
          _: Variables,
          actual: Data<number>,
          required: Data<number>,
          description: Data<string>
        ) => {
          return createNumberRequirement(actual, required, description);
        },
        args: ["number", "number", "string"],
      },
    },
  ],
];
