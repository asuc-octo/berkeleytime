import { CatalogModule } from "./generated-types/module-types";
import { CourseType } from "./model";

export function formatCatalogItem(course: CourseType): CatalogModule.CatalogItem {
    return {
        courseId: course.identifiers.find((identifier) => identifier.type == "cs-course-id")?.id,
        displayName: course.classDisplayName,
        courseTitle: course.title,
        classTitle: "hello",
        letterAverage: "hello",
        enrolled: 0,
        units: "hello",
    };
}