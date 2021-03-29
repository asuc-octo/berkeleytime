import {
  UPDATE_GRADE_CONTEXT,
  GRADE_ADD_COURSE,
  UPDATE_GRADE_DATA,
  UPDATE_GRADE_SELECTED,
  GRADE_REMOVE_COURSE,
  GRADE_RESET,
} from "../actionTypes";
import vars from "../../variables/Variables";

const initialState = {
  context: {},
  selectedCourses: [],
  gradesData: [],
  graphData: [],
  sections: [],
  selectPrimary: "",
  selectSecondary: "",
  usedColorIds: [],
};

export default function grade(state = initialState, action) {
  switch (action.type) {
    case GRADE_RESET: {
      return initialState;
    }
    case UPDATE_GRADE_CONTEXT: {
      const { data } = action.payload;
      return { ...state, context: data };
    }
    case GRADE_ADD_COURSE: {
      const { formattedCourse } = action.payload;
      return Object.assign({}, state, {
        selectedCourses: [...state.selectedCourses, formattedCourse],
        usedColorIds: [...state.usedColorIds, formattedCourse.colorId],
      });
    }
    case GRADE_REMOVE_COURSE: {
      const { id, color } = action.payload;
      let updatedCourses = state.selectedCourses.filter(
        (classInfo) => classInfo.id !== id
      );
      let updatedColors = state.usedColorIds.filter((c) => c !== color);
      return Object.assign({}, state, {
        selectedCourses: updatedCourses,
        usedColorIds: updatedColors,
      });
    }
    case UPDATE_GRADE_DATA: {
      const { gradesData } = action.payload;
      const graphData = vars.possibleGrades.map((letterGrade) => {
        const ret = {
          name: letterGrade,
        };
        for (const grade of gradesData) {
          if (letterGrade == "A+") {
            ret[grade.id] = 100;
          } else {
            ret[grade.id] = 0;
          }
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
        selectPrimary: "",
        selectSecondary: "",
      };
    }
    default:
      return state;
  }
}
