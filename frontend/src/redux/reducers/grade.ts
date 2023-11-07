import vars from '../../utils/variables';
import {
	GRADE,
	GRADE_ADD_COURSE,
	GRADE_REMOVE_COURSE,
	GRADE_RESET,
	GradeAction,
	GradeState,
	UPDATE_GRADE_CONTEXT,
	UPDATE_GRADE_DATA,
	UPDATE_GRADE_SELECTED
} from '../actionTypes';

const initialState: GradeState = {
	context: { courses: [] },
	selectedCourses: [],
	gradesData: [],
	graphData: [],
	sections: [],
	selectPrimary: '',
	selectSecondary: '',
	usedColorIds: []
};

export default function grade(state = initialState, action: GradeAction): GradeState {
	switch (action.type) {
		case GRADE_RESET: {
			return {
				...initialState,
				context: state.context
			};
		}
		case UPDATE_GRADE_CONTEXT: {
			const { data } = action.payload;
			return { ...state, context: data };
		}
		case GRADE_ADD_COURSE: {
			const { formattedCourse } = action.payload;
			return Object.assign({}, state, {
				selectedCourses: [...state.selectedCourses, formattedCourse],
				usedColorIds: [...state.usedColorIds, formattedCourse.colorId]
			});
		}
		case GRADE_REMOVE_COURSE: {
			const { id, color } = action.payload;
			const updatedCourses = state.selectedCourses.filter((classInfo) => classInfo.id !== id);
			const updatedColors = state.usedColorIds.filter((c) => c !== color);
			return Object.assign({}, state, {
				selectedCourses: updatedCourses,
				usedColorIds: updatedColors
			});
		}
		case UPDATE_GRADE_DATA: {
			const { gradesData } = action.payload;
			const graphData = vars.possibleGrades.map((letterGrade) => ({
				name: letterGrade,
				...gradesData.reduce((grades, grade) => {
					grades[grade.id] =
						(grade[letterGrade as keyof typeof GRADE].numerator / grade.denominator) * 100;
					return grades;
				}, {} as Record<string, number>)
			}));
			return {
				...state,
				gradesData,
				graphData
			};
		}
		case UPDATE_GRADE_SELECTED: {
			const { data } = action.payload;
			return {
				...state,
				sections: data,
				selectPrimary: '',
				selectSecondary: ''
			};
		}
		default:
			return state;
	}
}
