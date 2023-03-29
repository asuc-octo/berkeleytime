import { gql } from "graphql-tag";

const typedef = gql`

  type TermOutput {
    year: Int!
    semester: String!
  }

  input ScheduleInput {
    name: String
    created_by: String!,
    class_IDs: [String!],
    primary_section_IDs: [String!],
    secondary_section_IDs: [String!],
    is_public: Boolean,
    term: TermInput!
  }

  type Schedule {
    """
    The ObjectID associated with the schedule record
    """
    _id: ID
    """
    The name of the schedule, such as "Oski's Fall schedule <3"
    """
    name: String
    """
    Identifier (probably email) for the user who created the schedule (such as oski@bereley.edu).
    """
    created_by: String!
    """
    Term corresponding to the schedule, such as "Fall 1986"
    """
    term: TermOutput!
    """
    Whether the user would like the schedule to be viewable by others.
    """
    is_public: Boolean!
    """
    Identifiers (probably cs-course-ids) for the classes the user has added to their schedule.
    """
    class_IDs: [String!]
    """
    Identifiers (probably the "003" in "2022 Spring STAT 97 003") for the primary sections (typically lectures) the user has added to their schedule.
    """
    primary_section_IDs: [String!]
    """
    Identifiers (probably the "103" in "103 DIS") for the secondary sections (typically discussions) the user has added to their schedule.
    """
    secondary_section_IDs: [String!]
    """
    Custom events, such as club meetings, that the user has added to their schedule.
    """
    custom_events: [CustomEvent!]
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
    """
    Takes in a user's email and returns all the schedules they created.
    """
    schedulesByUser(created_by: String!): [Schedule]
    """
    Takes in a schedule's ObjectID and returns a specific schedule.
    """
    scheduleByID(id: String!): Schedule
  }

  type Mutation {
    """
    Takes in a schedule's ObjectID, deletes the schedule with that ID, and returns the ID.
    """
    removeScheduleByID(id: ID!): ID
    """
    Takes in schedule fields, creates a new schedule record in the database, and returns the schedule.
    """
    createNewSchedule(main_schedule: ScheduleInput!): Schedule
    """
    Takes in schedule fields, finds the schedule record in the database corresponding to the provided ID, updates the record, and returns the updated schedule.
    """
    editExistingSchedule(id: ID!, main_schedule: ScheduleInput!): Schedule
    """
    For the schedule specified by the ID, modifies the section ID field and returns the updated schedule.
    """
    setSelectedSections(id: ID!, section_IDs: [String!]!): Schedule
    """
    For the schedule specified by the ID, modifies the class ID field and returns the updated schedule.
    """
    setSelectedClasses(id: ID!, class_IDs: [String!]!): Schedule
  }
`;

export default typedef;
