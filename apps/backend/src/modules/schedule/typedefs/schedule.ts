import { gql } from "graphql-tag";

const typedef = gql`
  type SelectedClass {
    class: Class!
    selectedSections: [SectionIdentifier!]
  }

  type Event {
    startTime: String!
    endTime: String!
    days: [Boolean!]!
    _id: ID!
    location: String
    title: String!
    description: String
  }

  type Schedule {
    _id: ID!
    name: String!
    createdBy: String!
    year: Int!
    semester: Semester!
    term: Term!
    public: Boolean!
    classes: [SelectedClass!]!
    events: [Event!]!
  }

  type Query {
    schedules: [Schedule] @auth
    schedule(id: ID!): Schedule
  }

  input EventInput {
    startTime: String!
    endTime: String!
    days: [Boolean!]!
    location: String
    title: String!
    description: String
  }

  input SelectedClassInput {
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
    sections: [SectionIdentifier!]!
  }

  input UpdateScheduleInput {
    name: String
    events: [EventInput]
    classes: [SelectedClassInput]
    public: Boolean
  }

  input CreateScheduleInput {
    name: String!
    year: Int!
    semester: Semester!
    events: [EventInput!]
    classes: [SelectedClassInput!]
    public: Boolean
  }

  type Mutation {
    deleteSchedule(id: ID!): ID @auth
    createSchedule(schedule: CreateScheduleInput!): Schedule @auth
    updateSchedule(id: ID!, schedule: UpdateScheduleInput!): Schedule @auth
  }
`;

export default typedef;
