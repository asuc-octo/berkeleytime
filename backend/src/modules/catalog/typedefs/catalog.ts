import { gql } from "graphql-tag";

export default gql`
type Query {
    course(subject: String!, courseNumber: String!, term: TermInput): Course
    class(subject: String!, courseNumber: String!, term: TermInput!, classNumber: String!): Class
    section(subject: String!, courseNumber: String!, term: TermInput!, classNumber: String!, sectionNumber: String!): Section

    """
    Get info about all courses and their corresponding classes for a given semester. 
    
    Used primarily in the catalog page.
    """
    catalog(term: TermInput!): [CatalogItem]

    """
    Get a list of all course names across all semesters. 
    
    Useful for searching for courses.
    """
    courseList: [CourseListItem]
}

"""
Info shared between Classes within and across semesters.
"""
type Course {
    classes(term: TermInput): [Class]!
    crossListing: [Course]
    sections(term: TermInput, primary: Boolean): [Section]!

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

"""
Data for a specific class in a specific semester. There may be more than one Class for a given Course in a given semester.
"""
type Class {
    course: Course!
    primarySection: Section!
    sections: [Section]!

    description: String
    enrollCount: Int!
    enrollMax: Int!
    number: String!
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

"""
Sections are each associated with one Class. 
"""
type Section {
    class: Class!
    course: Course!
    enrollmentHistory: [EnrollmentDay]

    ccn: Int!
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

type EnrollmentDay {
    enrollCount: Int!
    enrollMax: Int!
    waitlistCount: Int!
    waitlistMax: Int!
}

type CatalogItem @cacheControl(maxAge: 3000) {
    subject: String!
    number: String!
    title: String!
    description: String!
    classes: [CatalogClass]!
    gradeAverage: Float

    lastUpdated: ISODate!
}

type CatalogClass @cacheControl(inheritMaxAge: true) {
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