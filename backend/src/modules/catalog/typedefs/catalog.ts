import { gql } from "graphql-tag";

export default gql`
type Query {
    catalog(term: Term!): [CatalogItem]
    course(term: Term!, subject: String!, courseNumber: String!): Course
    class(term: Term!, subject: String!, courseNumber: String!, classNumber: String!): Class
    section(term: Term!, subject: String!, courseNumber: String!, classNumber: String!, sectionNumber: String!): Section
    courseList: [CourseListItem]
    classes(subject: String!, courseNumber: String!): [Class]
}

type Course {
    allClasses: [Class]!
    classes: [Class]!
    crossListing: [Course]
    description: String!
    fromDate: String!
    gradeAverage: Float
    gradingBasis: String!
    level: String!
    number: String!
    prereqs: String
    subject: String!
    subjectName: String!
    title: String!
    toDate: String!
    
    raw: JSONObject!
    lastUpdated: ISODate!
}

type Class {
    course: Course!
    description: String
    enrollCount: Int!
    enrollMax: Int!
    number: String!
    primarySection: Section!
    sections: [Section]!
    semester: Semester!
    session: String!
    status: String!
    title: String
    unitsMax: Float!
    unitsMin: Float!
    waitlistCount: Int!
    waitlistMax: Int!
    year: Int!
    
    raw: JSONObject!
    lastUpdated: ISODate!
}

type Section {
    ccn: Int!
    class: Class!
    course: Course!
    dateEnd: String
    dateStart: String
    days: [Boolean!]
    enrollCount: Int!
    enrollMax: Int!
    instructors: [Instructor]
    kind: String!
    location: String
    notes: String
    number: String!
    primary: Boolean!
    timeEnd: String
    timeStart: String
    waitlistCount: Int!
    waitlistMax: Int!

    raw: JSONObject!
    lastUpdated: ISODate!
}

type Instructor {
    familyName: String!
    givenName: String!
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
    unitsMax: Float!
    unitsMin: Float!

    lastUpdated: ISODate!
}

type CourseListItem {
    subject: String!
    number: String!
}
`;