import { gql } from "graphql-tag";

export const scheduleTypeDef = gql`
  enum Color {
    slate
    gray
    zinc
    neutral
    stone
    red
    orange
    amber
    yellow
    lime
    green
    emerald
    teal
    cyan
    sky
    blue
    indigo
    violet
    purple
    fuchsia
    pink
    rose
  }

  type SelectedClass {
    class: Class!
    selectedSections: [Section!]!
    color: Color
    hidden: Boolean
    locked: Boolean
    blockedSections: [SectionIdentifier!]
    lockedComponents: [Component!]
  }

  type Event {
    startTime: String!
    endTime: String!
    days: [Boolean!]!
    _id: ID!
    location: String
    title: String!
    description: String
    color: Color
    hidden: Boolean
  }

  type Schedule @cacheControl(maxAge: 1) {
    _id: ID!
    name: String!
    createdBy: String!
    term: Term!
    year: Int!
    semester: Semester!
    sessionId: SessionIdentifier!
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
    color: Color
    hidden: Boolean
  }

  input SelectedClassInput {
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
    sectionIds: [SectionIdentifier!]!
    color: Color
    hidden: Boolean
    locked: Boolean
    blockedSections: [SectionIdentifier!]
    lockedComponents: [Component!]
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
    sessionId: SessionIdentifier!
    events: [EventInput!]
    classes: [SelectedClassInput!]
    public: Boolean
  }

  type Mutation {
    deleteSchedule(id: ID!): ID @auth
    createSchedule(schedule: CreateScheduleInput!): Schedule! @auth
    updateSchedule(id: ID!, schedule: UpdateScheduleInput!): Schedule! @auth
  }
`;
