/**
 * Contains data of initial API call for filter data and playlist info
 */
import {
  MODIFY_ACTIVE_PLAYLISTS,
  RECEIVE_FILTER_DATA,
  MODIFY_SELECTED_COURSE,
  SET_DEFAULT_PLAYLISTS,
} from "redux/actionTypes.js";

const initialState = {
  data: {}, // data from initial API call to /api/catalog/catalog_json/filters/
  activePlaylists: new Set(), // set of active playlists (integers)
  defaultPlaylists: new Set(), // set of default playlists (integers)
  loading: true, // initially true, set to false when data is received
  selectedCourse: {}, // currently selected course, has format 'course_box' from API models
};

export default function catalog(state = initialState, action) {
  switch (action.type) {
    case SET_DEFAULT_PLAYLISTS: {
      const { defaultPlaylists } = action.payload;
      return {
        ...state,
        defaultPlaylists,
      };
    }
    case MODIFY_ACTIVE_PLAYLISTS: {
      const { activePlaylists } = action.payload;
      return {
        ...state,
        activePlaylists,
      };
    }
    case RECEIVE_FILTER_DATA: {
      const { data } = action.payload;
      return {
        ...state,
        data,
        loading: false,
      };
    }
    case MODIFY_SELECTED_COURSE: {
      const { selectedCourse } = action.payload;
      return {
        ...state,
        selectedCourse,
      };
    }
    default:
      return state;
  }
}
