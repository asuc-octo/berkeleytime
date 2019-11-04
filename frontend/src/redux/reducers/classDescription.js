import { START_REQUEST } from "../actionTypes";
import { UPDATE_COURSE_DATA } from "../actionTypes";


const initialState = {
  loading: true,
  courseData: []
};

export default function filter(state = initialState, action) {
  switch (action.type) {
    case START_REQUEST: {
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
