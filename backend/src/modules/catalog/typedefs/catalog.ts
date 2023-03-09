import { gql } from "graphql-tag";

export default gql`
type Course { 
    id: String!
    title: String!
    gradeAverage: Float!
    letterAverage: String!
    classes: [Class]!
    crossListing: [Course]
    prereqs: String
    units: String
    displayName: String!
}

type Class {
    course: Course!
    displayName: String!
    number: String!
    subjectArea: SubjectArea!
    term: String!
    title: String!
    description: String
    instructors: [Instructor]!
    sections: [Section]!
}

type Section {
    instructors: [Instructor]!
    class: Class!
    course: Course!
    number: String!
    ccn: String!
    type: String!
    location: String!
    instructionMode: String!
    associatedSections: [Section]
    times: SectionTimes!
    primary: Boolean!
}

type SectionTimes {
    days: [String]!
    start: String!
    end: String!
}

type SubjectArea {
    code: String!
    description: String!
}

type Instructor {
    name: String!
    id: String!
}

type Query {
    catalog(term: Term!): [CatalogItem]
}

type CatalogItem {
    subject: String!
    courseNum: String!
    courseTitle: String!
    classes: [CatalogClass]!
    gradeAverage: Float
}

type CatalogClass {
    classNum: String!
    classTitle: String
    enrolledCount: Int!
    maxEnrollment: Int!
    minUnits: Float!
    maxUnits: Float!
}
`;