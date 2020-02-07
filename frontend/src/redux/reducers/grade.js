import { UPDATE_GRADE_CONTEXT, GRADE_ADD_COURSE, UPDATE_GRADE_DATA,
  UPDATE_GRADE_SELECTED, GRADE_REMOVE_COURSE } from '../actionTypes';
import vars from '../../variables/Variables';

const initialState = {
  context: {},
  selectedCourses: [],
  gradesData: [],
  graphData: [],
  sections: [],
  selectPrimary: '',
  selectSecondary: '',
};


export default function grade(state = initialState, action) {
  switch (action.type) {
  case UPDATE_GRADE_CONTEXT: {
    const { data } = action.payload;
    return Object.assign({}, state, {
      context: data
    });
  }
  case GRADE_ADD_COURSE: {
    const { formattedCourse } = action.payload;
    return Object.assign({}, state, {
      selectedCourses: [...state.selectedCourses, formattedCourse],
    });
  }
  case GRADE_REMOVE_COURSE: {
    const { id } = action.payload;
    let updatedCourses = state.selectedCourses.filter(classInfo => classInfo.id !== id)
    return Object.assign({}, state, {
      selectedCourses: updatedCourses,
    });
  }
  case UPDATE_GRADE_DATA: {
    const { gradesData } = action.payload;
    const graphData = vars.possibleGrades.map(letterGrade => {
      let ret = {
        name: letterGrade,
      };
      for (let grade of gradesData) {
        ret[grade.id] = grade[letterGrade].numerator / grade.denominator * 100;
      }
      return ret
    });
    return Object.assign({}, state, {
      gradesData,
      graphData: graphData
    });
  }
  case UPDATE_GRADE_SELECTED: {
    const { data } = action.payload;
    return Object.assign({}, state, {
      sections: data,
      selectPrimary: 'all',
      selectSecondary: 'all',
    });
  }
  default:
    return state;
  }
}
