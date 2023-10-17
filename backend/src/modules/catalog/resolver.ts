import { CatalogModule } from "./generated-types/module-types";
import { getCatalog, getClass, getClassById, getClassSections, getCourse, getCourseById, getCourseClasses, getCourseList, getCrossListings, getPrimarySection, getSection } from "./controller"
import { cache } from "../../redis";
import { getChildren } from "../../utils/graphql";

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog: (_, args, __, info) => cache(getCatalog, args.term, getChildren(info).includes("gradeAverage")),
        course: (_, args) => getCourse(args.subject, args.courseNumber, args.term),
        class: (_, args) => getClass(args.subject, args.courseNumber, args.term, args.classNumber),
        section: (_, args) => getSection(args.subject, args.courseNumber, args.term, args.classNumber, args.sectionNumber),
        courseList: getCourseList,
    },

    /*
        TODO: Figure out how to better type the parent objects.
        Apollo likes to assume they are the GraphQL types, but they are actually 
        the information from formatter.ts that is then used to get the GraphQL types.
    */
    Class: {
        course: (parent) => {
            const c = parent.course as any
            return getCourseById(c.id, c.term)
        },
        sections: (parent) => {
            const s = parent.sections as any
            return getClassSections(s.id, s.term, s.classNumber)
        },
        primarySection: (parent) => {
            const s = parent.primarySection as any
            return getPrimarySection(s.id, s.term, s.classNumber)
        },
    },

    Section: {
        class: (parent) => {
            const c = parent.class as any
            return getClassById(c.id, c.term, c.classNumber)
        },
        course: (parent) => {
            const c = parent.course as any
            return getCourseById(c.id, c.term)
        }
    },

    Course: {
        classes: (parent, { term }) => {
            const c = parent.classes as any
            return getCourseClasses(c, term)
        },
        crossListing: (parent) => {
            const cl = parent.crossListing as any
            return getCrossListings(cl.displayNames, cl.term)
        }
    }
}

export default resolvers;