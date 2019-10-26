import { MODIFY_LIST } from "./actionTypes";


export const modify = (newActivePlaylists, defaultPlaylists) => ({
  type: MODIFY_LIST,
  payload: {
    activePlaylists: newActivePlaylists,
    defaultPlaylists: defaultPlaylists,
  }
});
