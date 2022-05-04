import {
  UPDATE_CONTEXT_SIS_COURSES, UPDATE_CONTEXT_SIS_CLASSES, UPDATE_CONTEXT_SELECTION_SIS_CLASS, UPDATE_CONTEXT_SELECTION_SIS_COURSE
} from "redux/actionTypes.js";


const initialState = {
  sis_courses: [],
  sis_classes: []
};

export default function grade(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CONTEXT_SELECTION_SIS_CLASS: {
      return { ...state, selection_sis_class: action.payload };
    }
    case UPDATE_CONTEXT_SELECTION_SIS_COURSE: {
      return { ...state, selection_sis_course: action.payload };
    }
    case UPDATE_CONTEXT_SIS_CLASSES: {
      return { ...state, sis_classes: action.payload };
    }
    case UPDATE_CONTEXT_SIS_COURSES: {
      return { ...state, sis_courses: action.payload };
    }
    default:
      return state;
  }
}
