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

export type BaseState = {
	context: { courses: CourseSnapshotType[] };
	selectedCourses: FormattedCourseType[];
	selectPrimary: string | { value: string; label: string };
	selectSecondary: string | { value: string; label: string };
	usedColorIds: string[];
};

export type BaseDataType = {
	colorId: string;
	course_id: number;
	id: string;
	instructor: string;
	subtitle: string;
	title: string;
};
