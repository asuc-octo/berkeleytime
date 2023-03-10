import { gql } from "graphql-tag";

export default gql`
type Query {
    catalog(term: Term!): [CatalogItem]
    course(term: Term!, subject: String!, number: String!): Course
    class(term: Term!, subject: String!, courseNumber: String!, classNumber: String!): Class
    section(term: Term!, subject: String!, courseNumber: String!, classNumber: String!, sectionNumber: String!): Section
}

type Course {
    classes: [Class]!
    crossListing: [Course]!
    department: String!
    description: String!
    gradeAverage: Float
    gradingBasis: String!
    level: String!
    number: String!
    prereqs: String!
    subject: String!
    subjectName: String!
    title: String!
    
    raw: JSONObject!
}

type Class {
    course: Course!
    description: String
    enrollCount: Int!
    enrollMax: Int!
    number: String!
    sections: [Section]!
    session: String!
    status: String!
    title: String
    unitsMax: Float!
    unitsMin: Float!
    waitlistCount: Int!
    waitlistMax: Int!
    lastUpdated: String!

    raw: JSONObject!
}

type Section {
    class: Class!
    course: Course!
    days: [Boolean]
    enrollCount: Int!
    enrollMax: Int!
    instructors: [String]!
    location: String
    notes: String
    number: String!
    primary: Boolean!
    timeStart: String
    timeEnd: String
    type: String!
    waitlistCount: Int!
    waitlistMax: Int!

    raw: JSONObject!
}

type CatalogItem {
    subject: String!
    number: String!
    title: String!
    description: String!
    classes: [CatalogClass]!
    gradeAverage: Float
    lastUpdated: ISODate!
}

type CatalogClass {
    number: String!
    title: String
    description: String
    enrollCount: Int!
    enrollMax: Int!
    lastUpdated: ISODate!
    unitsMin: Float!
    unitsMax: Float!
}
`;