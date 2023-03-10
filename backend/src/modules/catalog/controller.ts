import { CatalogItem, Term } from "../../generated-types/graphql";
import { ClassModel } from "../../db/class";
import { getTermStartMonth, termToString } from "../../utils/term";
import { GradeModel, GradeType } from "../../db/grade";
import { getAverage } from "../grade/controller";
import { CourseModel, CourseType } from "../../db/course";

/**
 * Used to map between courses and grades
 */
function getCourseKey(course: CourseType) {
    return `${course.subjectArea?.description} ${course.catalogNumber?.formatted}`;
}

function getCsCourseId(course: CourseType) {
    return course.identifiers.find(i => i.type == "cs-course-id")?.id as string
}

export async function getCatalog(term: Term): Promise<CatalogItem[]> {
    const classes = await ClassModel.find({
        "session.term.name": termToString(term),
        "aggregateEnrollmentStatus.maxEnroll": { $gt: 0 },
    }).lean()

    const csCourseIds = new Set(classes.map(c => getCsCourseId(c.course as CourseType)))
    const courses = await CourseModel.find(
        {
            identifiers: {
                $elemMatch: {
                    type: "cs-course-id",
                    id: { $in: Array.from(csCourseIds) }
                }
            },
            /* 
                The SIS toDate is unreliable so we can only
                filter by fromDate and then sort to find the
                most recent course.
            */
            fromDate: { $lte: getTermStartMonth(term) },
        },
        {
            identifiers: 1,
            title: 1,
            description: 1,
            subjectArea: 1,
            catalogNumber: 1
        }
    ).sort({ fromDate: -1 }).lean()

    const grades = await GradeModel.find(
        {
            /* 
                No filters because an appropriately large filter 
                is actually significantly slower than no filter.
            */
        },
        {
            CourseSubjectShortNm: 1,
            CourseNumber: 1,
            GradeNm: 1,
            EnrollmentCnt: 1
        }
    ).lean()

    /* Map grades to course keys for easy lookup */
    const gradesMap: { [key: string]: GradeType[] } = {}
    courses.forEach(c => gradesMap[getCourseKey(c)] = [])
    grades.forEach(g => {
        const key = `${g.CourseSubjectShortNm as string} ${g.CourseNumber as string}`
        if (key in gradesMap) {
            gradesMap[key].push(g)
        }
    })

    const catalog: { [key: string]: any } = {}
    courses.forEach(c => {
        const key = getCourseKey(c)
        const id = getCsCourseId(c)

        // skip duplicates
        if (id in catalog)
            return

        catalog[id] = {
            subject: c.subjectArea?.code as string,
            number: c.catalogNumber?.formatted as string,
            title: c.title as string,
            description: c.description as string,
            classes: [],
            gradeAverage: getAverage(gradesMap[key]),
        }
    })

    classes.forEach(c => {
        const id = getCsCourseId(c.course as CourseType)

        if (!(id in catalog)) {
            throw new Error(`Class ${c.course?.subjectArea?.code} ${c.course?.catalogNumber?.formatted}`
                + ` has a course id ${id} that doesn't exist for the ${term.semester} ${term.year} term.`)
        }
        catalog[id].classes.push({
            number: c.number as string,
            title: c.classTitle,
            description: c.classDescription,
            enrollCount: c.aggregateEnrollmentStatus?.enrolledCount as number,
            enrollMax: c.aggregateEnrollmentStatus?.maxEnroll as number,
            unitsMin: c.allowedUnits?.minimum as number,
            unitsMax: c.allowedUnits?.maximum as number,
        })
    })

    return Object.values(catalog)
}