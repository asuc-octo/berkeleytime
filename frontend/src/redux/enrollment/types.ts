import { BaseDataType, BaseState, CourseSnapshotType, FormattedCourseType } from 'redux/types';

export const UPDATE_ENROLL_CONTEXT = 'UPDATE_ENROLL_CONTEXT';
export const ENROLL_ADD_COURSE = 'ENROLL_ADD_COURSE';
export const ENROLL_REMOVE_COURSE = 'ENROLL_REMOVE_COURSE';
export const UPDATE_ENROLL_DATA = 'UPDATE_ENROLL_DATA';
export const UPDATE_ENROLL_SELECTED = 'UPDATE_ENROLL_SELECTED';
export const ENROLL_RESET = 'ENROLL_RESET';

export type EnrollAction =
	| {
			type: typeof UPDATE_ENROLL_CONTEXT;
			payload: { data: { courses: CourseSnapshotType[] } };
	  }
	| {
			type: typeof UPDATE_ENROLL_DATA;
			payload: { enrollmentData: EnrollmentDataType[] };
	  }
	| {
			type: typeof UPDATE_ENROLL_SELECTED;
			payload: {
				sections: SectionType[];
			};
	  }
	| {
			type: typeof ENROLL_RESET;
	  }
	| {
			type: typeof ENROLL_ADD_COURSE;
			payload: {
				formattedCourse: FormattedCourseType;
			};
	  }
	| {
			type: typeof ENROLL_REMOVE_COURSE;
			payload: {
				id: string;
				color: string;
			};
	  };

export type EnrollmentState = BaseState & {
	enrollmentData: EnrollmentDataType[];
	sections: SectionType[];
	graphData: { name: number }[];
};

export type EnrollmentStatusType = {
	date: string;
	day: number;
	enrolled: number;
	enrolled_max: number;
	enrolled_percent: number;
	waitlisted: number;
	waitlisted_max: number;
	waitlisted_percent: number;
};

export type TelebearsType = {
	adj_start_date: string;
	adj_start_day: number;
	phase1_end_date: number;
	phase1_start_date: string;
	phase1_start_day: number;
	phase2_end_date: number;
	phase2_start_date: string;
	phase2_start_day: number;
};

export type EnrollmentDataType = BaseDataType & {
	data: EnrollmentStatusType[];
	enrolled_max: number;
	enrolled_percent_max: number;
	enrolled_scale_max: number;
	section_id: number;
	section_name: string;
	telebears: TelebearsType;
	title: string;
	waitlisted_max: number;
	waitlisted_percent_max: number;
	waitlisted_scale_max: number;
};

export type SectionType = {
	sections: { instructor: string; section_id: number; section_number: string }[];
	semester: string;
	year: string;
};
