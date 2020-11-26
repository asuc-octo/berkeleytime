/* eslint-disable */
import axios from 'axios';
import {
  MODIFY_ACTIVE_PLAYLISTS, RECEIVE_FILTER_DATA, MODIFY_SELECTED_COURSE, SET_DEFAULT_PLAYLISTS,
} from '../actionTypes';

export const setDefaultPlaylists = defaultPlaylists => ({
  type: SET_DEFAULT_PLAYLISTS,
  payload: {
    defaultPlaylists,
  },
});

/**
 * Function to update the active playlist
 */
export const modifyActivePlaylists = activePlaylists => ({
  type: MODIFY_ACTIVE_PLAYLISTS,
  payload: {
    activePlaylists,
  },
});

/**
 * Function to update the selected course (the course displayed on the right)
 */
export const modifySelected = selectedCourse => ({
  type: MODIFY_SELECTED_COURSE,
  payload: {
    selectedCourse,
  },
});

/**
 * Updates the state with the fetched filter data
 */
export const receiveFilterData = data => ({
  type: RECEIVE_FILTER_DATA,
  payload: {
    data,
  },
});

/**
 * Fetches initial filter data and sets selected class if url matches
 */
export function fetchPlaylists(paths) {
  return dispatch => {
    if (paths.length >= 4) {
      const abbreviation = paths[2];
      const classNum = paths[3];
      /* TODO: What's the difference between providing a class or not? */
      return axios.get(`/api/catalog/catalog_json/filters/${abbreviation}/${classNum}/`)
        .then(
          res => {
            const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
            dispatch(setDefaultPlaylists(new Set(defaultPlaylists)));
            dispatch(modifyActivePlaylists(new Set(defaultPlaylists)));
            dispatch(receiveFilterData(res.data));
            return res;
          },
          console.error,
        )
        .then(res => {
          const courseID = res.data.default_course;
          axios.get('/api/catalog/filter/', { params: { course_id: courseID } })
            .then(
              res2 => {
                if (res2.data.length > 0) {
                  dispatch(modifySelected(res2.data[0]));
                } else {
                  console.error('No class returned!');
                }
              },
              console.error,
            );
        });
    } else {
      return axios.get('/api/catalog/catalog_json/filters/')
        .then(
          res => {
            const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
            dispatch(setDefaultPlaylists(new Set(defaultPlaylists)));
            dispatch(modifyActivePlaylists(new Set(defaultPlaylists)));
            dispatch(receiveFilterData(res.data));
          },
          console.error,
        );
    }
  };
}
