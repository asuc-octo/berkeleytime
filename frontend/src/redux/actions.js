import axios from 'axios';
import { MODIFY_LIST } from "./actionTypes";
import { RECEIVE_LIST } from "./actionTypes";
import { MODIFY_SELECTED } from "./actionTypes";
import { FILTER } from "./actionTypes";
import { START_REQUEST } from "./actionTypes";
import { START_REQUEST_DESCRIPTION } from "./actionTypes";
import { UPDATE_COURSE_DATA } from "./actionTypes";



export const modify = (newActivePlaylists, defaultPlaylists) => ({
  type: MODIFY_LIST,
  payload: {
    activePlaylists: newActivePlaylists,
    defaultPlaylists,
  }
});

export const modifySelected = (data, tab) => ({
  type: MODIFY_SELECTED,
  payload: {
    data,
    tab
  }
});

export const receiveList = (data) => ({
  type: RECEIVE_LIST,
  payload: {
    data
  }
});

export const filter = (data) => ({
  type: FILTER,
  payload: {
    data
  }
});

export const makeRequest = () => ({
  type: START_REQUEST,
});

export const makeRequestDescription = () => ({
  type: START_REQUEST_DESCRIPTION,
});

export const updateCourses = (data) => ({
  type: UPDATE_COURSE_DATA,
  payload: {
    data
  }
});

export function getCourseData(id) {
  return dispatch => {
    return axios.get(`http://localhost:8080/api/catalog_json/course_box/`, {
      params: {
        course_id: id,
      }
    }).
    then(
      res => {
        dispatch(updateCourses(res.data))
      },
      error => console.log('An error occurred.', error)
    )
  }
}


export function getFilterResults(filters) {
  return dispatch => {
    return axios.get('http://localhost:8080/api/catalog/filter/', {
      params: {
        filters,
      },
    })
    .then(
      res => {
        dispatch(filter(res.data))
      },
      error => console.log('An error occurred.', error)
    )
  }
}

export function fetchLists(paths) {
  const abbreviation = paths[2];
  const classNum = paths[3];
  // const search = `${abbreviation} ${classNum} `;
  // this.searchHandler(search);
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
          error => console.log('An error occurred.', error)
        )
        .then(() => {
          const courseID = tmp.data.default_course;
          axios.get('http://localhost:8080/api/catalog/filter/', { params: { course_id: courseID }})
            .then(
              res2 => {
                if (res2.data.length > 0) {
                  let tab = 0;
                  if (paths.length >= 5) {
                    tab = paths[4] === 'sections' ? 0 : tab;
                  }
                  dispatch(modifySelected(res2.data[0], tab));
                  // this.selectCourse(res2.data[0], tab);
                }
              },
              error => console.log('An error occurred.', error)
            )
        });
    } else {
      return axios.get('http://localhost:8080/api/catalog_json/')
        .then(
          res => {
            const defaultPlaylists = res.data.default_playlists.split(',').map(str => parseInt(str));
            dispatch(modify(new Set(defaultPlaylists), new Set(defaultPlaylists)));
            dispatch(receiveList(res.data));
          },
          error => console.log('An error occurred.', error)
      )
    }

  }
}
