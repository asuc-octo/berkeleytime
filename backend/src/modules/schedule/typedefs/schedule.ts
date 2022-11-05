import { gql } from "apollo-server-express";

const typedef = gql`
  type Schedule {
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
    days_of_week: [String]
  }

  type Query {
    schedules(created_by: String!): [Schedule]
  }
`;

export default typedef;
