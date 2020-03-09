import { FILTER, START_REQUEST } from '../actionTypes';

const initialState = {
  loading: true,
  courses: [],
};

export default function filter(state = initialState, action) {
  switch (action.type) {
  case START_REQUEST: {
    return { ...state, loading: true };
  }
  case FILTER: {
    const { data } = action.payload;
    return {
      ...state,
      courses: data,
      loading: false,
    };
  }
  default:
    return state;
  }
}
