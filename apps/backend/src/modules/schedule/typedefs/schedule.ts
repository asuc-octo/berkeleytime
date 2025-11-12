import { gql } from "graphql-tag";

const typedef = gql`
  enum Color {
    "slate"
    slate

    "gray"
    gray

    "zinc"
    zinc

    "neutral"
    neutral

    "stone"
    stone

    "red"
    red

    "orange"
    orange

    "amber"
    amber

    "yellow"
    yellow

    "lime"
    lime

    "green"
    green

    "emerald"
    emerald

    "teal"
    teal

    "cyan"
    cyan

    "sky"
    sky

    "blue"
    blue

    "indigo"
    indigo

    "violet"
    violet

    "purple"
    purple

    "fuchsia"
    fuchsia

    "pink"
    pink

    "rose"
    rose
  }

  type SelectedClass {
    class: Class!
    selectedSections: [Section!]!
    color: Color
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
  }

  input SelectedClassInput {
    subject: String!
    courseNumber: CourseNumber!
    number: ClassNumber!
    sectionIds: [SectionIdentifier!]!
    color: Color
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

export default typedef;
