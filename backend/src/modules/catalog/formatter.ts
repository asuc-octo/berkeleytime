import { ClassType } from "../../models/class";
import { CourseType } from "../../models/course";
import { SectionType } from "../../models/section";
import { TermInput } from "../../generated-types/graphql";
import { getCsCourseId } from "../../utils/course";
import { stringToTerm } from "../../utils/term";

export function formatMetadata(data: any) {
    return {
        lastUpdated: (!data._updated) ? data._updatedAt as Date : data._updated as Date,
        raw: data,
    }
}

export function formatClass(cls: ClassType | null): any {
    if (cls == null) return null

    const term = stringToTerm(cls.session?.term?.name as string)
    const id = getCsCourseId(cls.course as CourseType)

    return {
        course: {
            id,
            term
        },
        primarySection: {
            id,
            term,
            classNumber: cls.number,
        },
        sections: {
            id,
            term,
            classNumber: cls.number,
        },

        description: cls.classDescription,
        enrollCount: cls.aggregateEnrollmentStatus?.enrolledCount as number,
        enrollMax: cls.aggregateEnrollmentStatus?.maxEnroll as number,
        number: cls.number as string,
        semester: term.semester,
        session: cls.session?.name as string,
        status: cls.status?.description as string,
        title: cls.classTitle,
        unitsMax: cls.allowedUnits?.maximum as number,
        unitsMin: cls.allowedUnits?.minimum as number,
        waitlistCount: cls.aggregateEnrollmentStatus?.waitlistedCount as number,
        waitlistMax: cls.aggregateEnrollmentStatus?.maxWaitlist as number,
        year: term.year,

        ...formatMetadata(cls),
    }
}

export function formatSection(section: SectionType | null): any {
    if (section == null) return null

    const term = stringToTerm(section.class?.session?.term?.name as string)

    /* All of the section data we have only have one meeting time so this is safe to do */
    const meeting = section.meetings != undefined ? section.meetings[0] : null;
    const instructors = meeting?.assignedInstructors?.
        filter(i => (i.printInScheduleOfClasses && i.instructor?.names != undefined)).
        map(i => {
            // Primary name has precedence over preferred name
            let nameInfo = i.instructor?.names?.find(n => n.type?.code === "PRI")
            if (nameInfo == undefined) {
                nameInfo = i.instructor?.names?.find(n => n.type?.code === "PRF")
            }

            return { givenName: nameInfo?.givenName, familyName: nameInfo?.familyName }
        });

    const id = getCsCourseId(section.class?.course as CourseType)

    return {
        class: {
            id,
            term,
            classNumber: section.class?.number,
        },
        course: { 
            id,
            term 
        },

        ccn: section.id as number,
        dateEnd: meeting?.endDate,
        dateStart: meeting?.startDate,
        days: meeting != null ? [
            meeting.meetsSunday,
            meeting.meetsMonday,
            meeting.meetsTuesday,
            meeting.meetsWednesday,
            meeting.meetsThursday,
            meeting.meetsFriday,
            meeting.meetsSaturday
        ] as boolean[] : null,
        enrollCount: section.enrollmentStatus?.enrolledCount as number,
        enrollMax: section.enrollmentStatus?.maxEnroll as number,
        instructors,
        kind: section.component?.description as string,
        location: meeting?.location?.description,
        notes: section.sectionAttributes?.find(a => a.attribute?.code === "NOTE")?.value?.formalDescription,
        number: section.number as string,
        primary: section.association?.primary as boolean,
        timeEnd: meeting?.endTime as string,
        timeStart: meeting?.startTime as string,
        waitlistCount: section.enrollmentStatus?.waitlistedCount as number,
        waitlistMax: section.enrollmentStatus?.maxWaitlist as number,

        ...formatMetadata(section),
    }
}

export function formatCourse(course: CourseType | null, term?: TermInput | null): any {
    if (course == null) return null

    return {
        classes: getCsCourseId(course),
        crossListing: {
            displayNames: course.crossListing?.courses,
            term
        },
        
        description: course.description as string,
        fromDate: course.fromDate,
        gradingBasis: course.gradingBasis?.description as string,
        level: course.academicCareer?.description as string,
        number: course.catalogNumber?.formatted as string,
        prereqs: course.preparation?.requiredText,
        subject: course.classSubjectArea?.code as string,
        subjectName: course.classSubjectArea?.description as string,
        title: course.title as string,
        toDate: course.toDate,

        ...formatMetadata(course),
    }
}