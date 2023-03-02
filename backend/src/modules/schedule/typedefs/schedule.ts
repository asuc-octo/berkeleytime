import { gql } from "graphql-tag";

const typedef = gql`
  type Schedule {
    _id: ID
    name: String
    created_by: String!
    date_created: String!
    last_updated: String!
    term: String!
    public: Boolean!
    class_IDs: [String]
    section_IDs: [String]
    custom_events: [CustomEvent]
  }

  type CustomEvent {
    start_time: String!
    end_time: String!
    title: String
    location: String
    description: String
    days_of_week: String
  }

  type Query {
    schedulesByUser(created_by: String!): [Schedule]
    scheduleByID(id: String!): Schedule
  }

  type Mutation {
    removeScheduleByID(id: ID!): ID
    createNewSchedule(created_by: String!, term: String!, schedule_name: String, is_public: Boolean, class_IDs: [String!]!, section_IDs: [String!]!): Schedule
    editExistingSchedule(id: ID!, created_by: String, term: String, schedule_name: String, is_public: Boolean, class_IDs: [String!]!, section_IDs: [String!]!): Schedule
    setSelectedSections(id: ID!, section_IDs: [String!]!): Schedule
    setSelectedClasses(id: ID!, class_IDs: [String!]!): Schedule
  }
`;

export default typedef;
