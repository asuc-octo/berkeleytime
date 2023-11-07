/* eslint-disable */
import axios, { AxiosResponse } from 'axios';
import hash from 'object-hash';
import { NavigateFunction } from 'react-router-dom';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
	CourseSnapshotType,
	ENROLL_ADD_COURSE,
	ENROLL_REMOVE_COURSE,
	ENROLL_RESET,
	EnrollmentDataType,
	FormattedCourseDataType,
	FormattedCourseType,
	GRADE_ADD_COURSE,
	GRADE_REMOVE_COURSE,
	GRADE_RESET,
	GradeSelectedType,
	GradesDataType,
	SectionType,
	UPDATE_ENROLL_CONTEXT,
	UPDATE_ENROLL_DATA,
	UPDATE_ENROLL_SELECTED,
	UPDATE_GRADE_CONTEXT,
	UPDATE_GRADE_DATA,
	UPDATE_GRADE_SELECTED,
	UnformattedCourseType,
	UpdatedClassType
} from './actionTypes';
import { ReduxState } from './store';

axios.defaults.baseURL = import.meta.env.PROD
	? axios.defaults.baseURL
	: 'https://staging.berkeleytime.com';

// update grade list
const updateGradeContext = (data: { courses: CourseSnapshotType[] }) => ({
	type: UPDATE_GRADE_CONTEXT,
	payload: {
		data
	}
});

export const gradeReset = () => ({
	type: GRADE_RESET
});

// add displayed course to the grade page
const gradeAddCourse = (formattedCourse: FormattedCourseType) => ({
	type: GRADE_ADD_COURSE,
	payload: {
		formattedCourse
	}
});

export const gradeRemoveCourse = (id: string, color: string) => ({
	type: GRADE_REMOVE_COURSE,
	payload: {
		id,
		color
	}
});

const updateGradeData = (gradesData: GradesDataType[]) => ({
	type: UPDATE_GRADE_DATA,
	payload: {
		gradesData
	}
});

const updatedGradeSelected = (data: GradeSelectedType[]) => ({
	type: UPDATE_GRADE_SELECTED,
	payload: {
		data
	}
});

// update enroll list
const updateEnrollContext = (data: { courses: CourseSnapshotType[] }) => ({
	type: UPDATE_ENROLL_CONTEXT,
	payload: {
		data
	}
});

export const enrollReset = () => ({
	type: ENROLL_RESET
});

// add displayed course to the enroll page
const enrollAddCourse = (formattedCourse: FormattedCourseType) => ({
	type: ENROLL_ADD_COURSE,
	payload: {
		formattedCourse
	}
});

export const enrollRemoveCourse = (id: string, color: string) => ({
	type: ENROLL_REMOVE_COURSE,
	payload: {
		id,
		color
	}
});

export const updateEnrollData = (enrollmentData: EnrollmentDataType[]) => ({
	type: UPDATE_ENROLL_DATA,
	payload: {
		enrollmentData
	}
});

const updatedEnrollSelected = (sections: SectionType[]) => ({
	type: UPDATE_ENROLL_SELECTED,
	payload: {
		sections
	}
});

export function fetchGradeContext(): ThunkAction<void, ReduxState, unknown, Action> {
	return (dispatch) =>
		axios.get('/api/grades/grades_json/').then(
			(res) => {
				dispatch(updateGradeContext(res.data));
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchGradeClass(
	course: UnformattedCourseType
): ThunkAction<void, ReduxState, unknown, Action> {
	return (dispatch) =>
		axios.get(`/api/catalog/catalog_json/course/${course.courseID}/`).then(
			(res) => {
				const courseData = res.data;
				const formattedCourse = {
					id: course.id,
					course: courseData.course,
					title: courseData.title,
					semester: course.semester,
					instructor: course.instructor,
					courseID: course.courseID,
					sections: course.sections,
					colorId: course.colorId
				};
				dispatch(gradeAddCourse(formattedCourse));
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchGradeData(
	classData: FormattedCourseType[]
): ThunkAction<void, ReduxState, unknown, Action> {
	const promises = classData.map((course) => {
		const { sections } = course;
		const url = `/api/grades/sections/${sections.join('&')}/`;
		return axios.get(url);
	});
	return (dispatch) =>
		axios.all(promises).then(
			(data) => {
				let gradesData = data.map((res, i) => {
					let gradesData = res.data;
					gradesData['id'] = classData[i].id;
					gradesData['instructor'] =
						classData[i].instructor === 'all' ? 'All Instructors' : classData[i].instructor;
					gradesData['semester'] =
						classData[i].semester === 'all' ? 'All Semesters' : classData[i].semester;
					gradesData['colorId'] = classData[i].colorId;
					return gradesData;
				});
				dispatch(updateGradeData(gradesData));
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchGradeSelected(
	updatedClass: UpdatedClassType
): ThunkAction<void, ReduxState, unknown, Action> {
	const url = `/api/grades/course_grades/${updatedClass.value}/`;
	return (dispatch) =>
		axios.get(url).then(
			(res) => {
				dispatch(updatedGradeSelected(res.data));
				// if (updatedClass.addSelected) {
				//   this.addSelected();
				//   this.handleClassSelect({value: updatedClass.value, addSelected: false});
				// }
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchGradeFromUrl(
	url: string,
	navigate: NavigateFunction
): ThunkAction<void, ReduxState, unknown, Action> {
	const toUrlForm = (string: string) => string.replace('/', '_').toLowerCase().split(' ').join('-');
	const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

	let courseUrls = url.split('/')[2].split('&');
	const urlData = courseUrls.map((course) => {
		let courseUrl = course.split('-');
		let semester, instructor;
		if (courseUrl[2] === 'all') {
			semester = courseUrl[2];
			instructor = courseUrl.slice(3).join('-');
		} else if (courseUrl[4] === '_') {
			semester = capitalize(courseUrl[2]) + ' ' + courseUrl[3] + ' / ' + courseUrl[5];
			instructor = courseUrl.slice(6).join('-').replace('_', '/');
		} else {
			semester = capitalize(courseUrl[2]) + ' ' + courseUrl[3];
			instructor = courseUrl.slice(4).join('-').replace('_', '/');
		}
		return {
			colorId: courseUrl[0],
			courseID: courseUrl[1],
			semester: semester,
			instructor: instructor
		};
	});
	let promises = urlData.map(({ courseID }) => {
		const u = `/api/grades/course_grades/${courseID}/`;
		return axios.get<GradeSelectedType[]>(u);
	});

	let success = true;

	return (dispatch) =>
		axios
			.all(promises)
			.then((data) => {
				const courses = data.map((res, i) => {
					let instructor = urlData[i].instructor;
					let semester = urlData[i].semester;
					let sections: number[] = [];
					if (instructor === 'all') {
						res.data.map((item, i) => (sections[i] = item.grade_id));
					} else {
						let matches = [];
						if (instructor.includes('/')) {
							matches = res.data.filter(
								(item) => instructor === toUrlForm(item.instructor) + '-/-' + item.section_number
							);
							matches.map((item, i) => (sections[i] = item.grade_id));
							instructor = matches[0].instructor + ' / ' + matches[0].section_number;
						} else {
							matches = res.data.filter((item) => instructor === toUrlForm(item.instructor));
							matches.map((item, i) => (sections[i] = item.grade_id));
							instructor = matches[0].instructor;
						}
					}
					if (semester !== 'all') {
						let matches = [];
						if (semester.split(' ').length > 2) {
							matches = res.data.filter(
								(item) =>
									semester ===
									capitalize(item.semester) + ' ' + item.year + ' / ' + item.section_number
							);
						} else {
							matches = res.data.filter(
								(item) => semester === capitalize(item.semester) + ' ' + item.year
							);
						}
						let allSems = matches.map((item) => item.grade_id);
						sections = sections.filter((item) => allSems.includes(item));
					}
					const formattedCourse = {
						courseID: parseInt(urlData[i].courseID),
						instructor: instructor,
						semester: semester,
						sections: sections
					};

					return {
						...formattedCourse,
						id: hash(formattedCourse),
						colorId: urlData[i].colorId
					};
				});
				return courses;
			})
			.catch((error) => {
				success = false;
				navigate('/error');
				console.log('An error occurred.', error);
			})
			.then((courses) => {
				if (success && courses) {
					const promises = courses.map((course) => {
						const u = `/api/catalog/catalog_json/course/${course.courseID}/`;
						return axios.get<FormattedCourseDataType>(u);
					});
					axios.all(promises).then(
						(data) => {
							data.map((res, i) => {
								const courseData = res.data;
								const course = courses[i];
								const formattedCourse = {
									id: course.id,
									course: courseData.course,
									title: courseData.title,
									semester: course.semester,
									instructor: course.instructor,
									courseID: course.courseID,
									sections: course.sections,
									colorId: course.colorId
								};
								dispatch(gradeAddCourse(formattedCourse));
							});
						},
						(error) => console.log('An error occurred.', error)
					);
				}
			});
}

export function fetchEnrollContext(): ThunkAction<void, ReduxState, unknown, Action> {
	return async (dispatch, getState) => {
		// Avoid fetching enrollment data twice.
		if (getState().enrollment.context.courses) {
			return;
		}

		const res = await axios.get('/api/enrollment/enrollment_json/');
		dispatch(updateEnrollContext(res.data));
	};
}

export function fetchEnrollClass(
	course: UnformattedCourseType
): ThunkAction<void, ReduxState, unknown, Action> {
	return (dispatch) =>
		axios.get(`/api/catalog/catalog_json/course/${course.courseID}/`).then(
			(res) => {
				const courseData = res.data;
				const formattedCourse = {
					id: course.id,
					course: courseData.course,
					title: courseData.title,
					semester: course.semester,
					instructor: course.instructor,
					courseID: course.courseID,
					sections: course.sections,
					colorId: course.colorId
				};
				dispatch(enrollAddCourse(formattedCourse));
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchEnrollData(
	classData: FormattedCourseType[]
): ThunkAction<void, ReduxState, unknown, Action> {
	const promises = classData.map((course) => {
		const { instructor, courseID, semester, sections } = course;
		let url;
		if (instructor === 'all') {
			const [sem, year] = semester.split(' ');
			url = `/api/enrollment/aggregate/${courseID}/${sem.toLowerCase()}/${year}/`;
		} else {
			url = `/api/enrollment/data/${sections[0]}/`;
		}
		return axios.get(url);
	});

	return (dispatch) =>
		axios.all(promises).then(
			(data) => {
				let enrollmentData: EnrollmentDataType[] = data.map((res, i) => ({
					...res.data,
					id: classData[i].id,
					colorId: classData[i].colorId
				}));
				dispatch(updateEnrollData(enrollmentData));
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchEnrollSelected(
	updatedClass: UpdatedClassType
): ThunkAction<void, ReduxState, unknown, Action> {
	const url = `/api/enrollment/sections/${updatedClass.value}/`;
	return (dispatch) =>
		axios.get(url).then(
			(res) => {
				dispatch(updatedEnrollSelected(res.data));
			},
			(error) => console.log('An error occurred.', error)
		);
}

export function fetchEnrollFromUrl(
	url: string,
	navigate: NavigateFunction
): ThunkAction<void, ReduxState, unknown, Action> {
	const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

	let courseUrls = url.split('/')[2].split('&');
	const urlData = courseUrls.map((course) => {
		const courseUrl = course.split('-');
		const semester = capitalize(courseUrl[2]) + ' ' + courseUrl[3];
		return {
			colorId: courseUrl[0],
			courseID: courseUrl[1],
			semester: semester,
			section: courseUrl[4]
		};
	});
	let promises = urlData.map(({ courseID }) => {
		let u = `/api/enrollment/sections/${courseID}/`;
		return axios.get<SectionType[]>(u);
	});

	let success = true;
	return (dispatch) =>
		axios
			.all(promises)
			.then((data) => {
				return data.map((res, i) => {
					let semester = urlData[i].semester;
					let section =
						urlData[i].section === 'all' ? urlData[i].section : parseInt(urlData[i].section);
					let sections = [section];
					let instructor = 'all';
					let match: SectionType;
					if (section === 'all') {
						match = res.data.filter(
							(item) => semester === capitalize(item.semester) + ' ' + item.year
						)[0];
						sections = match.sections.map((item) => item.section_id);
					} else {
						match = res.data
							.map(({ sections, ...rest }) => ({
								sections: sections.filter((item) => item.section_id === section),
								...rest
							}))
							.filter((item) => {
								item.sections.length > 0;
							})[0];
						instructor = match.sections[0].instructor + ' / ' + match.sections[0].section_number;
					}
					const formattedCourse = {
						courseID: parseInt(urlData[i].courseID),
						instructor: instructor,
						semester: semester,
						sections: sections
					};
					return {
						...formattedCourse,
						id: hash(formattedCourse),
						colorId: urlData[i].colorId
					};
				});
			})
			.catch((error) => {
				success = false;
				navigate('/error');
				console.log('An error occurred.', error);
			})
			.then((courses) => {
				if (success && courses) {
					const promises = courses.map((course) => {
						const u = `/api/catalog/catalog_json/course/${course.courseID}/`;
						return axios.get<FormattedCourseDataType>(u);
					});

					axios.all(promises).then(
						(data) => {
							data.map((res, i) => {
								const courseData = res.data;
								const course = courses[i];
								const formattedCourse = {
									id: course.id,
									course: courseData.course,
									title: courseData.title,
									semester: course.semester,
									instructor: course.instructor,
									courseID: course.courseID,
									sections: course.sections,
									colorId: course.colorId
								} satisfies FormattedCourseType;
								dispatch(enrollAddCourse(formattedCourse));
							});
						},
						(error) => console.log('An error occurred.', error)
					);
				}
			});
}
