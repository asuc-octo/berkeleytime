import {
  FILTER,
  START_REQUEST,
  REQUIREMENTS,
  UNITS,
  DEPARTMENT,
  LEVEL,
  SEMESTER,
} from "redux/actionTypes.js";

const initialState = {
  loading: true,
  courses: [],
  requirements: [],
  units: [],
  department: null,
  level: [],
  semester: [],
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
    case REQUIREMENTS: {
      const { data } = action.payload;
      return {
        ...state,
        requirements: data,
      };
    }
    case UNITS: {
      const { data } = action.payload;
      return {
        ...state,
        units: data,
      };
    }
    case DEPARTMENT: {
      const { data } = action.payload;
      return {
        ...state,
        department: data,
      };
    }
    case LEVEL: {
      const { data } = action.payload;
      return {
        ...state,
        level: data,
      };
    }
    case SEMESTER: {
      const { data } = action.payload;
      return {
        ...state,
        semester: data,
      };
    }
    default:
      return state;
  }
}
