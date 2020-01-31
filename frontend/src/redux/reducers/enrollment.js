import { UPDATE_ENROLL_CONTEXT, ENROLL_ADD_COURSE, UPDATE_ENROLL_DATA,
  UPDATE_ENROLL_SELECTED } from '../actionTypes';
import vars from '../../variables/Variables';

const initialState = {
  context: {},
  selectedCourses: [],
  enrollmentData: [],
  graphData: [],
  sections: [],
  selectPrimary: '',
  selectSecondary: '',
};

export default function enrollment(state = initialState, action) {
  switch (action.type) {
  case UPDATE_ENROLL_CONTEXT: {
    const { data } = action.payload;
    return Object.assign({}, state, {
      context: data
    });
  }
  case ENROLL_ADD_COURSE: {
    const { formattedCourse } = action.payload;
    return Object.assign({}, state, {
      selectedCourses: [...state.selectedCourses, formattedCourse],
    });
  }
  case UPDATE_ENROLL_DATA: {

    const { enrollmentData } = action.payload;
    let days = [...Array(200).keys()]
    const graphData = days.map(day => {
      let ret = {
        name: day,
      };
      for (let enrollment of enrollmentData) {
        let validTimes = enrollment.data.filter(time => time.day >= 0);
        let enrollmentTimes = {};
        for(let validTime of validTimes) {
          enrollmentTimes[validTime.day] = validTime;
        }

        if(day in enrollmentTimes) {
          ret[enrollment.id] = (enrollmentTimes[day].enrolled_percent * 100).toFixed(1);
        }
      }
      return ret;
    });
    return Object.assign({}, state, {
      enrollmentData: enrollmentData,
      graphData: graphData,
    });
  }
  case UPDATE_ENROLL_SELECTED: {
    const { sections } = action.payload;
    let str = sections[0].semester.charAt(0).toUpperCase() + sections[0].semester.slice(1);
    return Object.assign({}, state, {
      sections,
      selectPrimary: `${str} ${sections[0].year}`,
      selectSecondary: 'all',
    });
  }
  default:
    return state;
  }
}
//
// capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }
//
// getSectionSemester(section) {
//   return `${this.capitalize(section.semester)} ${section.year}`;
// }
