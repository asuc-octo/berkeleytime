import {
  START_REQUEST_DESCRIPTION,
  UPDATE_COURSE_DATA,
  FILTER_MAP,
} from "redux/actionTypes.js";

const initialState = {
  loading: false,
  courseData: [],
  filterMap: {},
};

export default function classDescription(state = initialState, action) {
  switch (action.type) {
    case START_REQUEST_DESCRIPTION: {
      return { ...state, loading: true };
    }
    case UPDATE_COURSE_DATA: {
      const { data } = action.payload;
      return {
        ...state,
        courseData: data,
        loading: false,
      };
    }
    case FILTER_MAP: {
      const { data } = action.payload;
      return {
        ...state,
        filterMap: data,
      };
    }
    default:
      return state;
  }
}
