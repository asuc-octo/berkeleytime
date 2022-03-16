/* eslint-disable */
import axios from "axios";
import hash from "object-hash";
import {
  FILTER,
  START_REQUEST,
  START_REQUEST_DESCRIPTION,
  UPDATE_COURSE_DATA,
  FILTER_MAP,
  REQUIREMENTS,
  UNITS,
  DEPARTMENT,
  LEVEL,
  SEMESTER,
  UPDATE_GRADE_CONTEXT,
  GRADE_ADD_COURSE,
  GRADE_REMOVE_COURSE,
  GRADE_RESET,
  UPDATE_GRADE_DATA,
  UPDATE_GRADE_SELECTED,
  UPDATE_ENROLL_CONTEXT,
  ENROLL_RESET,
  ENROLL_ADD_COURSE,
  ENROLL_REMOVE_COURSE,
  UPDATE_ENROLL_DATA,
  UPDATE_ENROLL_SELECTED,
} from "redux/actionTypes.js";

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

export const setFilterMap = (data) => ({
  type: FILTER_MAP,
  payload: {
    data,
  },
});

export const setRequirements = (data) => ({
  type: REQUIREMENTS,
  payload: {
    data,
  },
});

export const setUnits = (data) => ({
  type: UNITS,
  payload: {
    data,
  },
});

export const setDepartment = (data) => ({
  type: DEPARTMENT,
  payload: {
    data,
  },
});

export const setLevel = (data) => ({
  type: LEVEL,
  payload: {
    data,
  },
});

export const setSemester = (data) => ({
  type: SEMESTER,
  payload: {
    data,
  },
});

// update grade list
export const updateGradeContext = (data) => ({
  type: UPDATE_GRADE_CONTEXT,
  payload: {
    data: { courses: data },
  },
});

export const gradeReset = () => ({
  type: GRADE_RESET,
});

// add displayed course to the grade page
export const gradeAddCourse = (formattedCourse) => ({
  type: GRADE_ADD_COURSE,
  payload: {
    formattedCourse,
  },
});

export const gradeRemoveCourse = (id, color) => ({
  type: GRADE_REMOVE_COURSE,
  payload: {
    id,
    color,
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
  type: ENROLL_RESET,
});

// add displayed course to the enroll page
export const enrollAddCourse = (formattedCourse) => ({
  type: ENROLL_ADD_COURSE,
  payload: {
    formattedCourse,
  },
});

export const enrollRemoveCourse = (id, color) => ({
  type: ENROLL_REMOVE_COURSE,
  payload: {
    id,
    color,
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
  return (dispatch) =>
    axios
      .get("/api/catalog/catalog_json/course_box/", {
        params: {
          course_id: id,
        },
      })
      .then(
        (res) => {
          dispatch(updateCourses(res.data));
        },
        (error) => console.log("An error occurred.", error)
      );
}

// get the courses after applying the filters
export function getFilterResults(filters) {
  return (dispatch) =>
    axios
      .get("/api/catalog/filter/", {
        params: {
          filters,
        },
      })
      .then(
        (res) => {
          dispatch(filter(res.data));
        },
        (error) => console.log("An error occurred.", error)
      );
}

export function fetchGradeContext() {
  return async (dispatch) => {
    const res = await axios.post("/api/graphql", {
      query: `
        query { 
            courseNames
        }`,
    });
    dispatch(updateGradeContext(res.data.data.courseNames));
  };
}

export function fetchGradeClass(course) {
  return (dispatch) =>
    axios.get(`/api/catalog/catalog_json/course/${course.courseID}/`).then(
      (res) => {
        const courseData = res.data;
        const formattedCourse = {
          id: course.id,
          course: courseData.course,
          title: courseData.title,
          semester: course.semester,
          instructor: course.instructor,
          courseID: course.courseID,
          sections: course.sections,
          colorId: course.colorId,
        };
        dispatch(gradeAddCourse(formattedCourse));
      },
      (error) => console.log("An error occurred.", error)
    );
}

export function fetchGradeData(classData) {
  const promises = [];
  for (const course of classData) {
    const { sections } = course;
    const url = `/api/grades/sections/${sections.join("&")}/`;
    promises.push(axios.get(url));
  }
  return (dispatch) =>
    axios.all(promises).then(
      (data) => {
        let gradesData = data.map((res, i) => {
          let gradesData = res.data;
          gradesData["id"] = classData[i].id;
          gradesData["instructor"] =
            classData[i].instructor === "all"
              ? "All Instructors"
              : classData[i].instructor;
          gradesData["semester"] =
            classData[i].semester === "all"
              ? "All Semesters"
              : classData[i].semester;
          gradesData["colorId"] = classData[i].colorId;
          return gradesData;
        });
        dispatch(updateGradeData(gradesData));
      },
      (error) => console.log("An error occurred.", error)
    );
}

export function fetchGradeSelected(updatedClass) {
  return async (dispatch) => {
    const res = await axios.post("/api/graphql", {
      query: `
        query { 
            SIS_Course (displayName: "${updatedClass}") {
                _classes {
                    displayName
                    _sections {
                        displayName
                        _grades {
                            EnrollmentCnt
                            GradeNm
                            InstructorName
                            term {
                              year
                              month
                              semester 
                            }
                        }
                    }
                }
                displayName
                description
                title
            }
        }`,
    });
    dispatch(updatedGradeSelected(res.data.data.SIS_Course[0]._classes));
  };
}

export function fetchGradeFromUrl(url, history) {
  const toUrlForm = (s) =>
    s.replace("/", "_").toLowerCase().split(" ").join("-");
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let courseUrls = url.split("/")[2].split("&");
  const urlData = [];
  let promises = [];
  for (const c of courseUrls) {
    let cUrl = c.split("-");
    let semester, instructor;
    if (cUrl[2] === "all") {
      semester = cUrl[2];
      instructor = cUrl.slice(3).join("-");
    } else if (cUrl[4] === "_") {
      semester = capitalize(cUrl[2]) + " " + cUrl[3] + " / " + cUrl[5];
      instructor = cUrl.slice(6).join("-").replace("_", "/");
    } else {
      semester = capitalize(cUrl[2]) + " " + cUrl[3];
      instructor = cUrl.slice(4).join("-").replace("_", "/");
    }
    urlData.push({
      colorId: cUrl[0],
      courseID: cUrl[1],
      semester: semester,
      instructor: instructor,
    });
    let u = `/api/grades/course_grades/${cUrl[1]}/`;
    promises.push(axios.get(u));
  }
  let courses = [];
  let success = true;
  return (dispatch) =>
    axios
      .all(promises)
      .then(
        (data) => {
          courses = data.map((res, i) => {
            try {
              let instructor = urlData[i].instructor;
              let semester = urlData[i].semester;
              let sections = [];
              if (instructor === "all") {
                res.data.map((item, i) => (sections[i] = item.grade_id));
              } else {
                let matches = [];
                if (instructor.includes("/")) {
                  matches = res.data.filter(
                    (item) =>
                      instructor ===
                      toUrlForm(item.instructor) + "-/-" + item.section_number
                  );
                  matches.map((item, i) => (sections[i] = item.grade_id));
                  instructor =
                    matches[0].instructor + " / " + matches[0].section_number;
                } else {
                  matches = res.data.filter(
                    (item) => instructor === toUrlForm(item.instructor)
                  );
                  matches.map((item, i) => (sections[i] = item.grade_id));
                  instructor = matches[0].instructor;
                }
              }
              if (semester !== "all") {
                let matches = [];
                if (semester.split(" ").length > 2) {
                  matches = res.data.filter(
                    (item) =>
                      semester ===
                      capitalize(item.semester) +
                        " " +
                        item.year +
                        " / " +
                        item.section_number
                  );
                } else {
                  matches = res.data.filter(
                    (item) =>
                      semester === capitalize(item.semester) + " " + item.year
                  );
                }
                let allSems = matches.map((item) => item.grade_id);
                sections = sections.filter((item) => allSems.includes(item));
              }
              let formattedCourse = {
                courseID: parseInt(urlData[i].courseID),
                instructor: instructor,
                semester: semester,
                sections: sections,
              };
              formattedCourse.id = hash(formattedCourse);
              formattedCourse.colorId = urlData[i].colorId;
              return formattedCourse;
            } catch (err) {
              success = false;
              history.push("/error");
            }
          });
        },
        (error) => console.log("An error occurred.", error)
      )
      .then(() => {
        if (success) {
          promises = [];
          for (const course of courses) {
            const u = `/api/catalog/catalog_json/course/${course.courseID}/`;
            promises.push(axios.get(u));
          }
          axios.all(promises).then(
            (data) => {
              data.map((res, i) => {
                const courseData = res.data;
                const course = courses[i];
                const formattedCourse = {
                  id: course.id,
                  course: courseData.course,
                  title: courseData.title,
                  semester: course.semester,
                  instructor: course.instructor,
                  courseID: course.courseID,
                  sections: course.sections,
                  colorId: course.colorId,
                };
                dispatch(gradeAddCourse(formattedCourse));
              });
            },
            (error) => console.log("An error occurred.", error)
          );
        }
      });
}

export function fetchEnrollContext() {
  return async (dispatch, getState) => {
    // Avoid fetching enrollment data twice.
    if (getState().enrollment.context?.courses) {
      return;
    }

    const res = await axios.get("/api/enrollment/enrollment_json/");
    dispatch(updateEnrollContext(res.data));
  };
}

export function fetchEnrollClass(course) {
  return (dispatch) =>
    axios.get(`/api/catalog/catalog_json/course/${course.courseID}/`).then(
      (res) => {
        const courseData = res.data;
        const formattedCourse = {
          id: course.id,
          course: courseData.course,
          title: courseData.title,
          semester: course.semester,
          instructor: course.instructor,
          courseID: course.courseID,
          sections: course.sections,
          colorId: course.colorId,
        };
        dispatch(enrollAddCourse(formattedCourse));
      },
      (error) => console.log("An error occurred.", error)
    );
}

export function fetchEnrollData(classData) {
  const promises = [];
  for (const course of classData) {
    const { instructor, courseID, semester, sections } = course;
    let url;
    if (instructor === "all") {
      const [sem, year] = semester.split(" ");
      url = `/api/enrollment/aggregate/${courseID}/${sem.toLowerCase()}/${year}/`;
    } else {
      url = `/api/enrollment/data/${sections[0]}/`;
    }
    promises.push(axios.get(url));
  }
  return (dispatch) =>
    axios.all(promises).then(
      (data) => {
        let enrollmentData = data.map((res, i) => {
          let enrollmentData = res.data;
          enrollmentData["id"] = classData[i].id;
          enrollmentData["colorId"] = classData[i].colorId;
          return enrollmentData;
        });
        dispatch(updateEnrollData(enrollmentData));
      },
      (error) => console.log("An error occurred.", error)
    );
}

export function fetchEnrollSelected(updatedClass) {
  const url = `/api/enrollment/sections/${updatedClass.value}/`;
  return (dispatch) =>
    axios.get(url).then(
      (res) => {
        dispatch(updatedEnrollSelected(res.data));
        // if (updatedClass.addSelected) {
        //   this.addSelected();
        //   this.handleClassSelect({value: updatedClass.value, addSelected: false});
        // }
      },
      (error) => console.log("An error occurred.", error)
    );
}

export function fetchEnrollFromUrl(url, history) {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let courseUrls = url.split("/")[2].split("&");
  const urlData = [];
  let promises = [];
  for (const c of courseUrls) {
    let cUrl = c.split("-");
    let semester = capitalize(cUrl[2]) + " " + cUrl[3];
    urlData.push({
      colorId: cUrl[0],
      courseID: cUrl[1],
      semester: semester,
      section: cUrl[4],
    });
    let u = `/api/enrollment/sections/${cUrl[1]}/`;
    promises.push(axios.get(u));
  }
  let courses = [];
  let success = true;
  return (dispatch) =>
    axios
      .all(promises)
      .then(
        (data) => {
          courses = data.map((res, i) => {
            try {
              let semester = urlData[i].semester;
              let section =
                urlData[i].section === "all"
                  ? urlData[i].section
                  : parseInt(urlData[i].section);
              let sections = [section];
              let instructor = "all";
              let match = [];
              if (section === "all") {
                match = res.data.filter(
                  (item) =>
                    semester === capitalize(item.semester) + " " + item.year
                )[0];
                sections = match.sections.map((item) => item.section_id);
              } else {
                match = res.data.map((item) =>
                  item.sections.filter((item) => item.section_id == section)
                );
                match = match.filter((item) => item.length !== 0);
                instructor =
                  match[0][0].instructor + " / " + match[0][0].section_number;
              }
              let formattedCourse = {
                courseID: parseInt(urlData[i].courseID),
                instructor: instructor,
                semester: semester,
                sections: sections,
              };
              formattedCourse.id = hash(formattedCourse);
              formattedCourse.colorId = urlData[i].colorId;
              return formattedCourse;
            } catch (err) {
              success = false;
              console.log(err);
              history.push("/error");
            }
          });
        },
        (error) => console.log("An error occurred.", error)
      )
      .then(() => {
        if (success) {
          promises = [];
          for (const course of courses) {
            const u = `/api/catalog/catalog_json/course/${course.courseID}/`;
            promises.push(axios.get(u));
          }
          axios.all(promises).then(
            (data) => {
              data.map((res, i) => {
                const courseData = res.data;
                const course = courses[i];
                const formattedCourse = {
                  id: course.id,
                  course: courseData.course,
                  title: courseData.title,
                  semester: course.semester,
                  instructor: course.instructor,
                  courseID: course.courseID,
                  sections: course.sections,
                  colorId: course.colorId,
                };
                dispatch(enrollAddCourse(formattedCourse));
              });
            },
            (error) => console.log("An error occurred.", error)
          );
        }
      });
}
