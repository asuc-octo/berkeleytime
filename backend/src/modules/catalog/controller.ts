import { CatalogModule } from "./generated-types/module-types";
import { formatCatalogItem } from "./formatter";
import { CourseModel } from "./model";
import { CourseType } from "./model";

export async function catalog(courseId?: string) {
    if (courseId) {
        const course = await CourseModel.findById(courseId);
        return [formatCatalogItem(course as CourseType)];
    }
    else {
        return await (await CourseModel.find()).map(formatCatalogItem);
    }
}