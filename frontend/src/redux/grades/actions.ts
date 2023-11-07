import axios from 'axios';
import hash from 'object-hash';
import { NavigateFunction } from 'react-router-dom';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { ReduxState } from 'redux/store';
import {
	CourseSnapshotType,
	FormattedCourseDataType,
	FormattedCourseType,
	UnformattedCourseType
} from 'redux/types';
import {
	GRADE_ADD_COURSE,
	GRADE_REMOVE_COURSE,
	GRADE_RESET,
	GradeSelectedType,
	GradesDataType,
	UPDATE_GRADE_CONTEXT,
	UPDATE_GRADE_DATA,
	UPDATE_GRADE_SELECTED,
	UpdatedClassType
} from './types';

axios.defaults.baseURL = import.meta.env.PROD
	? axios.defaults.baseURL
	: 'https://staging.berkeleytime.com';

const updateGradeContext = (data: { courses: CourseSnapshotType[] }) => ({
	type: UPDATE_GRADE_CONTEXT,
	payload: {
		data
	}
});

export const gradeReset = () => ({
	type: GRADE_RESET
});

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
				const gradesData = data.map((res, i) => ({
					...res.data,
					id: classData[i].id,
					instructor:
						classData[i].instructor === 'all' ? 'All Instructors' : classData[i].instructor,
					semester: classData[i].semester === 'all' ? 'All Semesters' : classData[i].semester,
					colorId: classData[i].colorId
				}));
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

	const courseUrls = url.split('/')[2].split('&');
	const urlData = courseUrls.map((course) => {
		const courseUrl = course.split('-');
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
	const promises = urlData.map(({ courseID }) => {
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
					const semester = urlData[i].semester;
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
						const allSems = matches.map((item) => item.grade_id);
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
