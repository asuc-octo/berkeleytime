import { BaseDataType, BaseState, CourseSnapshotType, FormattedCourseType } from 'redux/types';

export const UPDATE_GRADE_CONTEXT = 'UPDATE_GRADE_CONTEXT';
export const GRADE_ADD_COURSE = 'GRADE_ADD_COURSE';
export const GRADE_REMOVE_COURSE = 'GRADE_REMOVE_COURSE';
export const UPDATE_GRADE_DATA = 'UPDATE_GRADE_DATA';
export const UPDATE_GRADE_SELECTED = 'UPDATE_GRADE_SELECTED';
export const GRADE_RESET = 'GRADE_RESET';

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

export type GradeState = BaseState & {
	gradesData: GradesDataType[];
	sections: GradeSelectedType[];
	graphData: { name: string }[];
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

export type GradeSelectedType = {
	grade_id: number;
	instructor: string;
	section_number: string;
	semester: string;
	year: string;
};

export type UpdatedClassType = {
	value: number;
	label: string;
	course: CourseSnapshotType;
};
