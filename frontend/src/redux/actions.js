import axios from 'axios';
import {
  MODIFY_LIST, RECEIVE_LIST, MODIFY_SELECTED, FILTER,
  START_REQUEST, START_REQUEST_DESCRIPTION, UPDATE_COURSE_DATA,
  UPDATE_GRADE_CONTEXT, GRADE_ADD_COURSE, GRADE_REMOVE_COURSE, GRADE_RESET,
  UPDATE_GRADE_DATA, UPDATE_GRADE_SELECTED, UPDATE_ENROLL_CONTEXT, ENROLL_RESET,
  ENROLL_ADD_COURSE, ENROLL_REMOVE_COURSE, UPDATE_ENROLL_DATA, UPDATE_ENROLL_SELECTED,
} from './actionTypes';

// function to update the active playlist
export const modify = (newActivePlaylists, defaultPlaylists) => ({
  type: MODIFY_LIST,
  payload: {
    activePlaylists: newActivePlaylists,
    defaultPlaylists,
  },
});

// function to update the selected course (the course displayed on the right)
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

// update grade list
export const updateGradeContext = (data) => ({
  type: UPDATE_GRADE_CONTEXT,
  payload: {
    data,
  },
});

export const gradeReset = () => ({
  type: GRADE_RESET
})

// add displayed course to the grade page
export const gradeAddCourse = (formattedCourse) => ({
  type: GRADE_ADD_COURSE,
  payload: {
    formattedCourse,
  },
});

export const gradeRemoveCourse = (id) => ({
  type: GRADE_REMOVE_COURSE,
  payload: {
    id,
  },
});

export const updateGradeData = (gradesData) => ({
  type: UPDATE_GRADE_DATA,
  payload: {
    gradesData,
  },
});

export const updatedGradeSelected = (data) => ({
  type: UPDATE_GRADE_SELECTED,
  payload: {
    data,
  },
});

// update enroll list
export const updateEnrollContext = (data) => ({
  type: UPDATE_ENROLL_CONTEXT,
  payload: {
    data,
  },
});

export const enrollReset = () => ({
  type: ENROLL_RESET
})

// add displayed course to the enroll page
export const enrollAddCourse = (formattedCourse) => ({
  type: ENROLL_ADD_COURSE,
  payload: {
    formattedCourse,
  },
});

export const enrollRemoveCourse = (id) => ({
  type: ENROLL_REMOVE_COURSE,
  payload: {
    id,
  },
});

export const updateEnrollData = (enrollmentData) => ({
  type: UPDATE_ENROLL_DATA,
  payload: {
    enrollmentData,
  },
});

export const updatedEnrollSelected = (sections) => ({
  type: UPDATE_ENROLL_SELECTED,
  payload: {
    sections,
  },
});

// get information for the class displayed in the class description component
export function getCourseData(id) {
  return dispatch => axios.get('/api/catalog_json/course_box/', {
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
  return dispatch => axios.get('/api/catalog/filter/', {
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
      return axios.get(`/api/catalog_json/${abbreviation}/${classNum}/`)
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
          axios.get('/api/catalog/filter/', { params: { course_id: courseID } })
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
      return axios.get('/api/catalog_json/')
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

export function fetchGradeContext() {
  return dispatch => axios.get('/api/grades_json/')
    .then(
      res => {
        dispatch(updateGradeContext(res.data));
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchGradeClass(course) {
  return dispatch => axios.get(`/api/catalog_json/course/${course.courseID}/`)
    .then(
      res => {
        const courseData = res.data;
        const formattedCourse = {
          id: course.id,
          course: courseData.course,
          title: courseData.title,
          semester: course.semester,
          instructor: course.instructor,
          courseID: course.courseID,
          sections: course.sections,
        };
        dispatch(gradeAddCourse(formattedCourse));
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchGradeData(classData) {
  const promises = [];
  for (const course of classData) {
    const { sections } = course;
    const url = `/api/grades/sections/${sections.join('&')}/`;
    promises.push(axios.get(url));
  }
  return dispatch => axios.all(promises)
    .then(
      data => {
        const gradesData = data.map((res, i) => {
          const gradesData = res.data;
          gradesData.id = classData[i].id;
          gradesData.instructor = classData[i].instructor == 'all' ? 'All Instructors' : classData[i].instructor;
          gradesData.semester = classData[i].semester == 'all' ? 'All Semesters' : classData[i].semester;
          return gradesData;
        });
        dispatch(updateGradeData(gradesData));
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchGradeSelected(updatedClass) {
  const url = `/api/grades/course_grades/${updatedClass.value}/`;
  return dispatch => axios.get(url)
    .then(
      res => {
        dispatch(updatedGradeSelected(res.data));
      // if (updatedClass.addSelected) {
      //   this.addSelected();
      //   this.handleClassSelect({value: updatedClass.value, addSelected: false});
      // }
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchEnrollContext() {
  return dispatch => axios.get('/api/enrollment_json/')
    .then(
      res => {
        dispatch(updateEnrollContext(res.data));
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchEnrollClass(course) {
  return dispatch => axios.get(`/api/catalog_json/course/${course.courseID}/`)
    .then(
      res => {
        const courseData = res.data;
        const formattedCourse = {
          id: course.id,
          course: courseData.course,
          title: courseData.title,
          semester: course.semester,
          instructor: course.instructor,
          courseID: course.courseID,
          sections: course.sections,
        };
        dispatch(enrollAddCourse(formattedCourse));
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchEnrollData(classData) {
  const promises = [];
  for (const course of classData) {
    const {
      instructor, courseID, semester, sections,
    } = course;
    let url;
    console.log(course);
    if (instructor === 'all') {
      const [sem, year] = semester.split(' ');
      url = `/api/enrollment/aggregate/${courseID}/${sem.toLowerCase()}/${year}/`;
    } else {
      url = `/api/enrollment/data/${sections[0]}/`;
    }
    promises.push(axios.get(url));
  }
  return dispatch => axios.all(promises)
    .then(
      data => {
        const enrollmentData = data.map((res, i) => {
          const enrollmentData = res.data;
          enrollmentData.id = classData[i].id;
          return enrollmentData;
        });
        dispatch(updateEnrollData(enrollmentData));
      },
      error => console.log('An error occurred.', error),
    );
}

export function fetchEnrollSelected(updatedClass) {
  const url = `/api/enrollment/sections/${updatedClass.value}/`;
  return dispatch => axios.get(url)
    .then(
      res => {
        dispatch(updatedEnrollSelected(res.data));
      // if (updatedClass.addSelected) {
      //   this.addSelected();
      //   this.handleClassSelect({value: updatedClass.value, addSelected: false});
      // }
      },
      error => console.log('An error occurred.', error),
    );
}
