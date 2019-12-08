import { MODIFY_LIST, RECEIVE_LIST, MODIFY_SELECTED } from '../actionTypes';


const initialState = {
  data: {},
  activePlaylists: new Set(), // set of integers
  defaultPlaylists: new Set(), // set of integers
  loading: true,
  selectCourse: {},
  tab: 0,
};

export default function catalog(state = initialState, action) {
  switch (action.type) {
  case MODIFY_LIST: {
    const { activePlaylists, defaultPlaylists } = action.payload;
    return Object.assign({}, state, {
      activePlaylists,
      defaultPlaylists,
    });
  }
  case RECEIVE_LIST: {
    const { data } = action.payload;
    return Object.assign({}, state, {
      data,
      loading: false,
    });
  }
  case MODIFY_SELECTED: {
    const { data, tab } = action.payload;
    return Object.assign({}, state, {
      selectCourse: data,
      tab,
    });
  }
  default:
    return state;
  }
}
