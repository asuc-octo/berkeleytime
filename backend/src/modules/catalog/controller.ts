import { CatalogItem, Term } from "../../generated-types/graphql";
import { ClassModel } from "../../db/class";
import { getTermStartMonth, stringToTerm, termToString } from "../../utils/term";
import { GradeModel, GradeType } from "../../db/grade";
import { getAverage } from "../grade/controller";
import { CourseModel, CourseType } from "../../db/course";
import { SectionModel, SectionType } from "../../db/section";
import { formatClass, formatCourse, formatSection } from "./formatter";
import { getCourseKey, getCsCourseId } from "../../utils/course";

export async function getCatalog(args: { term: Term }) {
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
    for (const g of grades) {
        const key = `${g.CourseSubjectShortNm as string} ${g.CourseNumber as string}`
        if (key in gradesMap) {
            gradesMap[key].push(g)
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
        catalog[id].classes.push(formatClass(c, args.term))
    }

    return Object.values(catalog)
}


export async function getClass(args: {
    term: Term, subject?: string, courseNumber?: string, csCourseId?: string, classNumber: string
}): Promise<any> {

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

    const csCourseId = getCsCourseId(cls.course as CourseType)


    const sections = await SectionModel.find(
        {
            "class.course.identifiers": {
                $elemMatch: {
                    type: "cs-course-id",
                    id: csCourseId
                }
            },
            "class.session.term.name": termStr,
        },
        {
            id: 1,
            association: 1
        }
    ).lean()

    return formatClass(cls, args.term, sections)
}


export async function getSection(args: {
    term: Term, subject?: string, courseNumber?: string, csCourseId?: string, classNumber?: string, sectionNumber?: string, ccn?: number
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

    return formatSection(section, args.term)
}


export async function getCourse(args: {
    term: Term, subject?: string, courseNumber?: string, csCourseId?: string, displayName?: string
}): Promise<any> {
    const filter: any = {
        /* 
            The SIS toDate is unreliable so we can only
            filter by fromDate and then sort to find the
            most recent course.
        */
        fromDate: { $lte: getTermStartMonth(args.term) },
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

    const classData = await ClassModel.find(
        {
            "course.subjectArea.code": subject,
            "course.catalogNumber.formatted": courseNumber,
        },
        {
            "session.term.name": 1,
            "number": 1,
        }
    ).lean()

    const allClasses = classData.map(c => ({
        term: stringToTerm(c.session?.term?.name as string),
        subject,
        courseNumber,
        classNumber: c.number as string,
    }))

    return {
        allClasses,
        classes: allClasses.filter(c => c.term.year == args.term.year && c.term.semester == args.term.semester),
        ...formatCourse(course, args.term),
    }
}

export async function getCourseList() {
    return await CourseModel.aggregate()
        .group({ _id: { subject: "$classSubjectArea.code", number: "$catalogNumber.formatted" } })
        .sort({ "_id.subject": 1, "_id.number": 1 })
        .project({ _id: 0, subject: "$_id.subject", number: "$_id.number" })
}

export async function getClasses(args: { subject: string, courseNumber: string }): Promise<any> {
    const classes = await ClassModel
        .find({
            "course.subjectArea.code": args.subject,
            "course.catalogNumber.formatted": args.courseNumber,
        })
        .lean()

    const sections = await SectionModel
        .find({
            "class.course.subjectArea.code": args.subject,
            "class.course.catalogNumber.formatted": args.courseNumber,
        })
        .lean()

    const sectionMap: any = {}
    sections.forEach(s => {
        const displayName = s.class?.displayName as string
        if (sectionMap[displayName] == undefined) {
            sectionMap[displayName] = []
        }
        sectionMap[displayName].push(s)
    })

    return classes.map(c => {
        const term = stringToTerm(c.session?.term?.name as string)
        const classSections = sectionMap[c.displayName as string] as SectionType[]

        return formatClass(c, term, classSections)
    })
}