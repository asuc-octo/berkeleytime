import { MODIFY_LIST } from "../actionTypes";
import { RECEIVE_LIST } from "../actionTypes";
import { MODIFY_SELECTED } from "../actionTypes";


const initialState = {
  data: {},
  activePlaylists: new Set(),    // set of integers
  defaultPlaylists: new Set(),   // set of integers
  loading: true,
  selectCourse: {},
  tab: 0,
};

export default function catalog(state = initialState, action) {
  switch (action.type) {
    case MODIFY_LIST: {
      const { activePlaylists, defaultPlaylists} = action.payload;
      return Object.assign({}, state, {
        activePlaylists: activePlaylists,
        defaultPlaylists: defaultPlaylists,
      })
    }
    case RECEIVE_LIST: {
      const { data } = action.payload;
      return Object.assign({}, state, {
        data: data,
        loading: false
      })
    }
    case MODIFY_SELECTED: {
      const { data, tab } = action.payload;
      return Object.assign({}, state, {
        selectCourse: data,
        tab: tab
      })
    }
    default:
      return state
  }
}
