import {
	UPDATE_ENROLL_CONTEXT,
	ENROLL_ADD_COURSE,
	UPDATE_ENROLL_DATA,
	UPDATE_ENROLL_SELECTED,
	ENROLL_REMOVE_COURSE,
	ENROLL_RESET,
	EnrollAction,
	EnrollmentState
} from './types';

const initialState: EnrollmentState = {
	context: { courses: [] },
	selectedCourses: [],
	enrollmentData: [],
	graphData: [],
	sections: [],
	selectPrimary: '',
	selectSecondary: '',
	usedColorIds: []
};

export default function enrollment(state = initialState, action: EnrollAction) {
	switch (action.type) {
		case ENROLL_RESET: {
			return {
				...initialState,
				context: state.context
			};
		}
		case UPDATE_ENROLL_CONTEXT: {
			const { data } = action.payload;
			return { ...state, context: data };
		}
		case ENROLL_ADD_COURSE: {
			const { formattedCourse } = action.payload;
			return {
				...state,
				selectedCourses: [...state.selectedCourses, formattedCourse],
				usedColorIds: [...state.usedColorIds, formattedCourse.colorId]
			};
		}
		case ENROLL_REMOVE_COURSE: {
			const { id, color } = action.payload;
			const updatedCourses = state.selectedCourses.filter((classInfo) => classInfo.id !== id);
			const updatedColors = state.usedColorIds.filter((c) => c !== color);
			return {
				...state,
				selectedCourses: updatedCourses,
				usedColorIds: updatedColors
			};
		}
		case UPDATE_ENROLL_DATA: {
			const { enrollmentData } = action.payload;
			const days = [...Array(200).keys()];
			const graphData = days.map((day) => ({
				name: day,
				...enrollmentData.reduce((enrollmentTimes, enrollment) => {
					const validTimes = enrollment.data.filter((time) => time.day >= 0);
					validTimes.forEach((validTime) => {
						if (validTime.day === day) {
							enrollmentTimes[enrollment.id] = (validTime.enrolled_percent * 100).toFixed(1);
						}
					});
					return enrollmentTimes;
				}, {} as Record<string, string>)
			}));
			return {
				...state,
				enrollmentData,
				graphData
			};
		}
		case UPDATE_ENROLL_SELECTED: {
			const { sections } = action.payload;
			if (sections.length === 0) {
				return {
					...state,
					sections,
					selectPrimary: '',
					selectSecondary: ''
				};
			}
			const str = sections[0].semester.charAt(0).toUpperCase() + sections[0].semester.slice(1);
			return {
				...state,
				sections,
				selectPrimary: `${str} ${sections[0].year}`,
				selectSecondary: { value: 'all', label: 'All Instructors' }
			};
		}
		default:
			return state;
	}
}
