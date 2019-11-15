import { START_REQUEST_DESCRIPTION } from "../actionTypes";
import { UPDATE_COURSE_DATA } from "../actionTypes";


const initialState = {
  loading: false,
  courseData: []
};

export default function classDescription(state = initialState, action) {
  switch (action.type) {
    case START_REQUEST_DESCRIPTION: {
      return Object.assign({}, state, {
        loading: true
      })
    }
    case UPDATE_COURSE_DATA: {
      const { data } = action.payload;
      return Object.assign({}, state, {
        courseData: data,
        loading: false
      })
    }
    default:
      return state;
  }
}
