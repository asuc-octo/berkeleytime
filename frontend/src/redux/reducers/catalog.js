import { MODIFY_LIST } from "../actionTypes";

const initialState = {
  data: {},
  activePlaylists: new Set(),    // set of integers
  defaultPlaylists: new Set(),   // set of integers
  loading: true,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_LIST: {
      
    }
    case MODIFY_LIST: {
      const { activePlaylists, defaultPlaylists } = action.payload;
      // console.log(activePlaylists);
      return {
        activePlaylists: activePlaylists,
        defaultPlaylists: defaultPlaylists
      };
    }
    default:
      return state;
  }
}
