import axios from 'axios';
import {
  MODIFY_LIST, RECEIVE_LIST, MODIFY_SELECTED, FILTER,
  START_REQUEST, START_REQUEST_DESCRIPTION, UPDATE_COURSE_DATA,
} from './actionTypes';

// function to update the active playlist
export const modify = (newActivePlaylists, defaultPlaylists) => ({
  type: MODIFY_LIST,
  payload: {
    activePlaylists: newActivePlaylists,
    defaultPlaylists,
  },
});

// function to update the selected course (the course displyed on the right)
export const modifySelected = (data) => ({
  type: MODIFY_SELECTED,
  payload: {
    data,
  },
});

// receive data from the api call
export const receiveList = (data) => ({
  type: RECEIVE_LIST,
  payload: {
    data,
  },
});

// function to update the courses when the filters are changed
export const filter = (data) => ({
  type: FILTER,
  payload: {
    data,
  },
});

// function to start a request
export const makeRequest = () => ({
  type: START_REQUEST,
});

// function to start a request in class description component
export const makeRequestDescription = () => ({
  type: START_REQUEST_DESCRIPTION,
});

// update courses
export const updateCourses = (data) => ({
  type: UPDATE_COURSE_DATA,
  payload: {
    data,
  },
});

// get information for the class displayed in the class description component
export function getCourseData(id) {
  return dispatch => axios.get('http://localhost:8080/api/catalog_json/course_box/', {
    params: {
      course_id: id,
    },
  }).then(
    res => {
      dispatch(updateCourses(res.data));
    },
    error => console.log('An error occurred.', error),
  );
}

// get the courses after applying the filters
export function getFilterResults(filters) {
  return dispatch => axios.get('http://localhost:8080/api/catalog/filter/', {
    params: {
      filters,
    },
  }).then(
    res => {
      dispatch(filter(res.data));
    },
    error => console.log('An error occurred.', error),
  );
}

// get the course list
export function fetchLists(paths) {
  const abbreviation = paths[2];
  const classNum = paths[3];
  return dispatch => {
    let tmp = {};
    if (paths.length >= 4) {
      return axios.get(`http://localhost:8080/api/catalog_json/${abbreviation}/${classNum}/`)
        .then(
          res => {
            tmp = res;
            console.log(res);
            const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
            dispatch(modify(new Set(defaultPlaylists), new Set(defaultPlaylists)));
            dispatch(receiveList(res.data));
          },
          error => console.log('An error occurred.', error),
        )
        .then(() => {
          const courseID = tmp.data.default_course;
          axios.get('http://localhost:8080/api/catalog/filter/', { params: { course_id: courseID } })
            .then(
              res2 => {
                if (res2.data.length > 0) {
                  let tab = 0;
                  if (paths.length >= 5) {
                    tab = paths[4] === 'sections' ? 0 : tab;
                  }
                  dispatch(modifySelected(res2.data[0], tab));
                }
              },
              error => console.log('An error occurred.', error),
            );
        });
    } else {
      return axios.get('http://localhost:8080/api/catalog_json/')
        .then(
          res => {
            const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
            dispatch(modify(new Set(defaultPlaylists), new Set(defaultPlaylists)));
            dispatch(receiveList(res.data));
          },
          error => console.log('An error occurred.', error),
        );
    }
  };
}
