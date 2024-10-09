import { gql } from "graphql-tag";

const typedef = gql`
  type TermOutput {
    year: Int!
    semester: String!
  }

  type SelectedClass {
    class: Class!
    selectedSections: [String!]
  }

  type Event {
    startTime: String!
    endTime: String!
    days: [Boolean!]!
    location: String
    title: String!
    description: String
  }

  type Schedule {
    _id: ID
    name: String!
    createdBy: String!
    term: TermOutput!
    public: Boolean!
    classes: [SelectedClass!]
    events: [Event!]
  }

  type Query {
    schedules: [Schedule] @auth
    schedule(id: String!): Schedule
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
    courseNumber: String!
    classNumber: String!
    sections: [String!]!
  }

  input UpdateScheduleInput {
    name: String
    events: [EventInput]
    classes: [SelectedClassInput]
    public: Boolean
  }

  input CreateScheduleInput {
    name: String!
    term: TermInput!
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
