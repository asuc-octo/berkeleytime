import { Semester } from "@/lib/generated/graphql";

export interface CollectionClass {
  subject: string;
  courseNumber: string;
  number: string;
  title: string;
  year: number;
  semester: Semester;
  unitsMin: number;
  unitsMax: number;
  gradeDistribution?: {
    average: number | null;
  };
  primarySection?: {
    enrollment?: {
      latest?: {
        enrolledCount: number;
        maxEnroll: number;
        endTime: string;
        activeReservedMaxCount?: number;
      };
    };
  };
}

export const dummyCollection = {
  name: "CS Upper Divs",
  classes: [
    {
      subject: "COMPSCI",
      courseNumber: "61A",
      number: "001",
      title: "Structure and Interpretation of Computer Programs",
      year: 2024,
      semester: Semester.Fall,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.1 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 1800,
            maxEnroll: 1800,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "61B",
      number: "001",
      title: "Data Structures",
      year: 2024,
      semester: Semester.Fall,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.3 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 1200,
            maxEnroll: 1200,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "61C",
      number: "001",
      title: "Machine Structures",
      year: 2025,
      semester: Semester.Spring,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 2.9 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 650,
            maxEnroll: 700,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "70",
      number: "001",
      title: "Discrete Mathematics and Probability Theory",
      year: 2025,
      semester: Semester.Spring,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 2.8 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 680,
            maxEnroll: 750,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "170",
      number: "001",
      title: "Efficient Algorithms and Intractable Problems",
      year: 2024,
      semester: Semester.Fall,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.1 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 450,
            maxEnroll: 500,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "162",
      number: "001",
      title: "Operating Systems and System Programming",
      year: 2024,
      semester: Semester.Fall,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.0 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 380,
            maxEnroll: 400,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "186",
      number: "001",
      title: "Introduction to Database Systems",
      year: 2025,
      semester: Semester.Spring,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.2 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 20,
            maxEnroll: 500,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "188",
      number: "001",
      title: "Introduction to Artificial Intelligence",
      year: 2025,
      semester: Semester.Spring,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.4 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 50,
            maxEnroll: 600,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "COMPSCI",
      courseNumber: "189",
      number: "001",
      title: "Introduction to Machine Learning",
      year: 2025,
      semester: Semester.Spring,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.2 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 520,
            maxEnroll: 550,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "EECS",
      courseNumber: "127",
      number: "001",
      title: "Optimization Models in Engineering",
      year: 2025,
      semester: Semester.Spring,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 2.9 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 280,
            maxEnroll: 300,
            endTime: new Date().toISOString(),
            activeReservedMaxCount: 50,
          },
        },
      },
    },
    {
      subject: "DATA",
      courseNumber: "100",
      number: "001",
      title: "Principles and Techniques of Data Science",
      year: 2024,
      semester: Semester.Fall,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 3.3 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 1100,
            maxEnroll: 1100,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
    {
      subject: "MATH",
      courseNumber: "110",
      number: "001",
      title: "Linear Algebra",
      year: 2024,
      semester: Semester.Fall,
      unitsMin: 4,
      unitsMax: 4,
      gradeDistribution: { average: 2.8 },
      primarySection: {
        enrollment: {
          latest: {
            enrolledCount: 295,
            maxEnroll: 300,
            endTime: new Date().toISOString(),
          },
        },
      },
    },
  ] as CollectionClass[],
};
