export const UPDATE_GRADE_CONTEXT = 'UPDATE_GRADE_CONTEXT';
export const GRADE_ADD_COURSE = 'GRADE_ADD_COURSE';
export const GRADE_REMOVE_COURSE = 'GRADE_REMOVE_COURSE';
export const UPDATE_GRADE_DATA = 'UPDATE_GRADE_DATA';
export const UPDATE_GRADE_SELECTED = 'UPDATE_GRADE_SELECTED';
export const GRADE_RESET = 'GRADE_RESET';

export const UPDATE_ENROLL_CONTEXT = 'UPDATE_ENROLL_CONTEXT';
export const ENROLL_ADD_COURSE = 'ENROLL_ADD_COURSE';
export const ENROLL_REMOVE_COURSE = 'ENROLL_REMOVE_COURSE';
export const UPDATE_ENROLL_DATA = 'UPDATE_ENROLL_DATA';
export const UPDATE_ENROLL_SELECTED = 'UPDATE_ENROLL_SELECTED';
export const ENROLL_RESET = 'ENROLL_RESET';

export type CourseSnapshotType = {
	abbreviation: string;
	course_number: string;
	id: number;
};

export type UnformattedCourseType = {
	colorId: string;
	courseID: number;
	id: string;
	instructor: string;
	sections: (number | string)[];
	semester: string;
};

export type FormattedCourseDataType = { course: string; title: string };

export type FormattedCourseType = UnformattedCourseType & FormattedCourseDataType;

export type BaseDataType = {
	colorId: string;
	course_id: number;
	id: string;
	instructor: string;
	subtitle: string;
	title: string;
};

export type GradesDataType = BaseDataType & {
	course_gpa: number;
	course_letter: string;
	denominator: number;
	section_gpa: number;
	section_letter: string;
	semester: string;
} & {
	[grade in GRADE]: {
		percent: number;
		numerator: number;
		percentile_high: number;
		percentile_low: number;
	};
};

export type EnrollmentDataType = BaseDataType & {
	data: {
		date: string;
		day: number;
		enrolled: number;
		enrolled_max: number;
		enrolled_percent: number;
		waitlisted: number;
		waitlisted_max: number;
		waitlisted_percent: number;
	}[];
	enrolled_max: number;
	enrolled_percent_max: number;
	enrolled_scale_max: number;
	section_id: number;
	section_name: string;
	telebears: {
		adj_start_date: string;
		adj_start_day: number;
		phase1_end_date: number;
		phase1_start_date: string;
		phase1_start_day: number;
		phase2_end_date: number;
		phase2_start_date: string;
		phase2_start_day: number;
	};
	title: string;
	waitlisted_max: number;
	waitlisted_percent_max: number;
	waitlisted_scale_max: number;
};

export enum GRADE {
	'A+' = 'A+',
	'A' = 'A',
	'A-' = 'A-',
	'B+' = 'B+',
	'B' = 'B',
	'B-' = 'B-',
	'C+' = 'C+',
	'C' = 'C',
	'C-' = 'C-',
	'D' = 'D',
	'F' = 'F',
	'P' = 'P',
	'NP' = 'NP'
}

export type GradeSelectedType = {
	grade_id: number;
	instructor: string;
	section_number: string;
	semester: string;
	year: string;
};

export type SectionType = {
	sections: { instructor: string; section_id: number; section_number: string }[];
	semester: string;
	year: string;
};

export type UpdatedClassType = {
	value: number;
	label: string;
	course: CourseSnapshotType;
};

export type GradeAction =
	| { type: typeof UPDATE_GRADE_CONTEXT; payload: { data: { courses: CourseSnapshotType[] } } }
	| { type: typeof GRADE_RESET }
	| {
			type: typeof GRADE_ADD_COURSE;
			payload: {
				formattedCourse: FormattedCourseType;
			};
	  }
	| {
			type: typeof GRADE_REMOVE_COURSE;
			payload: {
				id: string;
				color: string;
			};
	  }
	| {
			type: typeof UPDATE_GRADE_DATA;
			payload: {
				gradesData: GradesDataType[];
			};
	  }
	| {
			type: typeof UPDATE_GRADE_SELECTED;
			payload: {
				data: GradeSelectedType[];
			};
	  };

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

type BaseState = {
	context: { courses: CourseSnapshotType[] };
	selectedCourses: FormattedCourseType[];
	selectPrimary: string;
	selectSecondary: string | { value: string; label: string };
	usedColorIds: string[];
};

export type GradeState = BaseState & {
	gradesData: GradesDataType[];
	sections: GradeSelectedType[];
	graphData: { name: string }[];
};

export type EnrollmentState = BaseState & {
	enrollmentData: EnrollmentDataType[];
	sections: SectionType[];
	graphData: { name: number }[];
};
