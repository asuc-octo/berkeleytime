import { START_REQUEST_DESCRIPTION, UPDATE_COURSE_DATA } from '../actionTypes';

const initialState = {
  loading: false,
  courseData: [],
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
  default:
    return state;
  }
}
