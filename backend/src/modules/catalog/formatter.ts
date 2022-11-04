import { CatalogModule } from "./generated-types/module-types";
import { CourseType } from "./model";

export function formatCatalogItem(course: CourseType): CatalogModule.CatalogItem {
    return {
        courseId: course._id.toString(),
        displayName: course.classDisplayName,
        courseTitle: course.title,
        classTitle: "hello",
        letterAverage: "hello",
        enrolled: 0,
        units: "hello",
    };
}