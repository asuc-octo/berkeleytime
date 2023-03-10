import { CatalogModule } from "./generated-types/module-types";
import { getCatalog, getClass, getCourse, getSection } from "./controller"

const resolvers: CatalogModule.Resolvers = {
    Query: {
        catalog: (_, args) => getCatalog(args),
        course: (_, args) => getCourse(args),
        class: (_, args) => getClass(args),
        section: (_, args) => getSection(args)
    },

    Class: {
        course: (parent) => getCourse(parent.course as any),
        primarySection: (parent) => getSection(parent.primarySection as any),
        sections: (parent) => parent.sections.map((section) => getSection(section as any)),
    },
    Section: {
        class: (parent) => getClass(parent.class as any),
    },
    Course: {
        allClasses: (parent) => parent.allClasses.map((cls) => getClass(cls as any)),
        classes: (parent) => parent.classes.map((cls) => getClass(cls as any)),
        crossListing: (parent) => parent.crossListing?.map((course) => getCourse(course as any)) ?? [],
    }
}

export default resolvers;