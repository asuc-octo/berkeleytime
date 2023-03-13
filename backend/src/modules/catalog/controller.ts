import { CatalogItem, Term } from "../../generated-types/graphql";
import { ClassModel, ClassType } from "../../db/class";
import { getTermStartMonth, stringToTerm, termToString } from "../../utils/term";
import { GradeModel, GradeType } from "../../db/grade";
import { getAverage } from "../grade/controller";
import { CourseModel, CourseType } from "../../db/course";
import { SectionModel, SectionType } from "../../db/section";
import { formatClass, formatCourse, formatSection } from "./formatter";
import { getCourseKey, getCsCourseId } from "../../utils/course";
import { isNil } from "lodash";
import { GraphQLResolveInfo } from "graphql";
import { getChildren } from "../../utils/graphql";

export async function getCatalog(args: { term: Term }, info: GraphQLResolveInfo) {
    const classes = await ClassModel
        .find({
            "session.term.name": termToString(args.term),
            "aggregateEnrollmentStatus.maxEnroll": { $gt: 0 },
        })
        .lean()

    const csCourseIds = new Set(classes.map(c => getCsCourseId(c.course as CourseType)))
    const courses = await CourseModel
        .find(
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
                fromDate: { $lte: getTermStartMonth(args.term) },
            },
            {
                _updated: 1,
                identifiers: 1,
                title: 1,
                description: 1,
                classSubjectArea: 1,
                catalogNumber: 1
            }
        )
        .sort({
            "classSubjectArea.code": 1,
            "catalogNumber.formatted": 1,
            fromDate: -1
        })
        .lean()

    /* Map grades to course keys for easy lookup */
    const gradesMap: { [key: string]: GradeType[] } = {}
    courses.forEach(c => gradesMap[getCourseKey(c)] = [])

    const children = getChildren(info)

    if (children.includes("gradeAverage")) {
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
        
        for (const g of grades) {
            const key = `${g.CourseSubjectShortNm as string} ${g.CourseNumber as string}`
            if (key in gradesMap) {
                gradesMap[key].push(g)
            }
        }
    }

    const catalog: { [key: string]: CatalogItem } = {}
    for (const c of courses) {
        const key = getCourseKey(c)
        const id = getCsCourseId(c)

        // skip duplicates
        if (id in catalog)
            continue

        catalog[id] = {
            classes: [],
            gradeAverage: await getAverage(gradesMap[key]),
            ...formatCourse(c, args.term),
        }
    }

    for (const c of classes) {
        const id = getCsCourseId(c.course as CourseType)

        if (!(id in catalog)) {
            throw new Error(`Class ${c.course?.subjectArea?.code} ${c.course?.catalogNumber?.formatted}`
                + ` has a course id ${id} that doesn't exist for the ${args.term.semester} ${args.term.year} term.`)
        }
        catalog[id].classes.push(formatClass(c))
    }

    return Object.values(catalog)
}


export async function getClass(args: {
    subject?: string, courseNumber?: string, csCourseId?: string, term: Term, classNumber: string
}, info: GraphQLResolveInfo): Promise<any> {

    const termStr = termToString(args.term)

    const filter: any = {
        "session.term.name": termStr,
        "number": args.classNumber
    }

    if (args.subject != undefined && args.courseNumber != undefined) {
        filter["course.subjectArea.code"] = args.subject
        filter["course.catalogNumber.formatted"] = args.courseNumber
    } else if (args.csCourseId != undefined) {
        filter["course.identifiers"] = {
            $elemMatch: {
                type: "cs-course-id",
                id: args.csCourseId
            }
        }
    } else {
        throw new Error("Class query requires either a subject and course number or a cs-course-id")
    }


    const cls = await ClassModel.findOne(filter).lean()

    if (cls == null) {
        throw new Error("Class not found")
    }

    return processClass(cls, info)
}

export async function processClass(cls: ClassType, info: GraphQLResolveInfo): Promise<any> {
    const csCourseId = getCsCourseId(cls.course as CourseType)

    const children = getChildren(info)

    let sections = null
    let primarySection = null

    if (children.includes("sections")) {
        sections = await SectionModel
            .find({
                "class.course.identifiers": {
                    $elemMatch: {
                        type: "cs-course-id",
                        id: csCourseId
                    }
                },
                "class.session.term.name": cls.session?.term?.name,
            })
            .lean()
    }

    if (children.includes("primarySection")) {
        primarySection = await SectionModel
            .findOne({
                "class.course.identifiers": {
                    $elemMatch: {
                        type: "cs-course-id",
                        id: csCourseId
                    }
                },
                "class.session.term.name": cls.session?.term?.name,
                "association.primary": true
            })
            .lean()
    }

    return {
        sections: sections?.map(formatSection),
        primarySection: primarySection != null ? formatSection(primarySection) : null,
        ...formatClass(cls)
    }
}


export async function getSection(args: {
    subject?: string, courseNumber?: string, csCourseId?: string, term: Term, classNumber?: string, sectionNumber?: string, ccn?: number
}): Promise<any> {

    const termStr = termToString(args.term)

    const filter: any = {
        "class.session.term.name": termStr,
    }

    if (args.ccn != undefined) {
        filter["id"] = args.ccn
    } else if (args.classNumber != undefined && args.sectionNumber != undefined) {
        if (args.subject != undefined && args.courseNumber != undefined) {
            filter["class.course.subjectArea.code"] = args.subject
            filter["class.course.catalogNumber.formatted"] = args.courseNumber
        } else if (args.csCourseId != undefined) {
            filter["class.course.identifiers"] = {
                $elemMatch: {
                    type: "cs-course-id",
                    id: args.csCourseId
                }
            }
        } else {
            throw new Error("Section query missing subject and course number or cs-course-id")
        }
    } else {
        throw new Error("Class query missing ccn or class and section number")
    }


    const section = await SectionModel.findOne(filter).lean()

    if (section == null) {
        throw new Error("Section not found")
    }

    return formatSection(section)
}


export async function getCourse(args: {
    subject?: string, courseNumber?: string, term?: Term | null, csCourseId?: string, displayName?: string
}, info: GraphQLResolveInfo): Promise<any> {
    const filter: any = {}

    if (!isNil(args.term)) {
        /* 
            The SIS toDate is unreliable so we can only
            filter by fromDate and then sort to find the
            most recent course. 

            If no term is specified, we return the most
            recent course.
        */
        filter["fromDate"] = { $lte: getTermStartMonth(args.term) }
    }

    if (args.subject != undefined && args.courseNumber != undefined) {
        filter["classSubjectArea.code"] = args.subject
        filter["catalogNumber.formatted"] = args.courseNumber
    } else if (args.csCourseId != undefined) {
        filter["identifiers"] = {
            $elemMatch: {
                type: "cs-course-id",
                id: args.csCourseId
            }
        }
    } else if (args.displayName != undefined) {
        filter["displayName"] = args.displayName
    } else {
        throw new Error("Course query requires either a subject and course number, a cs-course-id, or a display name")
    }

    const course = await CourseModel.findOne(filter).sort({ fromDate: -1 }).lean()

    if (course == null) {
        throw new Error("Course not found")
    }

    const subject = course?.classSubjectArea?.code as string
    const courseNumber = course?.catalogNumber?.formatted as string

    const children = getChildren(info)

    let classes = null;
    if (children.includes("classes")) {
        classes = await ClassModel
            .find({
                "course.subjectArea.code": subject,
                "course.catalogNumber.formatted": courseNumber,
            })
            .lean()
    }

    return {
        classes,
        ...formatCourse(course, args.term),
    }
}

export async function getCourseList() {
    return await CourseModel.aggregate()
        .group({ _id: { subject: "$classSubjectArea.code", number: "$catalogNumber.formatted" } })
        .sort({ "_id.subject": 1, "_id.number": 1 })
        .project({ _id: 0, subject: "$_id.subject", number: "$_id.number" })
}
