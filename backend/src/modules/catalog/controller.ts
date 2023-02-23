import { CatalogModule } from "./generated-types/module-types";
import { formatCatalogItem } from "./formatter";
import { CourseModel } from "./model";
import { CourseType } from "./model";

export async function catalog(args: {courseId?: string}): Promise<CatalogModule.CatalogItem[] | undefined> {
    if (args.courseId) {
        const course = await CourseModel.findOne({identifiers: {$elemMatch: {"cs-course-id": args.courseId}}});
        return [formatCatalogItem(course as CourseType)];
    }
    else {
        const courses = await CourseModel.find();
        return courses.map(formatCatalogItem);
    }
}