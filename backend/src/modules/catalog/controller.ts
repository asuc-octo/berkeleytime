import { CatalogModule } from "./generated-types/module-types";
import { formatCatalogItem } from "./formatter";
import { CourseModel } from "./model";
import { CourseType } from "./model";
import { InputMaybe } from "../../generated-types/graphql";

export async function catalog(args: {courseId?: InputMaybe<String>}) {
    if ("courseId" in args) {
        const course = await CourseModel.findOne({identifiers: { $elemMatch: {type: "cs-course-id", id: args.courseId}}});
        return [formatCatalogItem(course as CourseType)];
    }

    const courses = await CourseModel.find();
    return courses.map(formatCatalogItem);
}