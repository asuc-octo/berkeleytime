import { CatalogModule } from "./generated-types/module-types";
import { getCatalog, getClass, getCourse, getCourseList, getSection, processClass } from "./controller"
import { isNil } from "lodash";
import { ClassType } from "../../db/class";
import { termToString } from "../../utils/term";
import { getChildren } from "../../utils/graphql";

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog: (_, args, __, info) => getCatalog(args, info),
        course: (_, args, __, info) => getCourse(args, info),
        class: (_, args, __, info) => getClass(args, info),
        section: (_, args) => getSection(args),
        courseList: getCourseList,
    },

    Class: {
        course: (parent, _, __, info) => getCourse(parent.course as any, info),
    },

    Section: {
        class: (parent, _, __, info) => getClass(parent.class as any, info),
    },

    Course: {
        classes: (parent, { term }, _, info) => {
            /* Get all classes if no term is specified, otherwise get only classes in that term */
            return parent.classes
                .filter(c => {
                    const cls = c as any as ClassType
                    return isNil(term) || (cls.session?.term?.name == termToString(term))
                })
                .map(c => processClass(c as any as ClassType, info))
        },
        crossListing: (parent, _, __, info) => parent.crossListing?.map((course) => getCourse(course as any, info)) ?? [],
    }
}

export default resolvers;