import {
  UPDATE_GRADE_CONTEXT, GRADE_ADD_COURSE, UPDATE_GRADE_DATA,
  UPDATE_GRADE_SELECTED,
} from '../actionTypes';
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
    return { ...state, context: data };
  }
  case GRADE_ADD_COURSE: {
    const { formattedCourse } = action.payload;
    return { ...state, selectedCourses: [...state.selectedCourses, formattedCourse] };
  }
  case UPDATE_GRADE_DATA: {
    const { gradesData } = action.payload;
    const graphData = vars.possibleGrades.map(letterGrade => {
      const ret = {
        name: letterGrade,
      };
      for (const grade of gradesData) {
        ret[grade.id] = grade[letterGrade].numerator / grade.denominator * 100;
      }
      return ret;
    });
    return {
      ...state,
      gradesData,
      graphData,
    };
  }
  case UPDATE_GRADE_SELECTED: {
    const { data } = action.payload;
    return {
      ...state,
      sections: data,
      selectPrimary: 'all',
      selectSecondary: 'all',
    };
  }
  default:
    return state;
  }
}
