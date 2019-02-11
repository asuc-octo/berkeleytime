import React, { Component } from 'react';

import ClassDetails from './ClassDetails.jsx';
import ClassSections from './ClassSections.jsx';

class ClassDescription extends Component {
  constructor(props) {
    super(props);
    this.state = { tab: 0 }
    this.details = this.details.bind(this)
    this.sections = this.sections.bind(this)
  }

  details() {
    this.setState({ tab: 0 })
  }

  sections() {
    this.setState({ tab: 1 })
  }

  render() {
    const info = this.props
    const { tab } = this.state
    return (
      <div className="card filter-description">
        <div className="filter-description-header">
          <h3>{info.courseAbbreviation}</h3>
          <p>{info.favorites} favorites</p>
        </div>
        <p className="filter-description-title">{info.courseTitle}</p>
        <div className="filter-description-stats">
          <div className="filter-description-stats-avg">
            <p>Course Average: {info.averageGrade}</p>
            <a>See grade distributions</a>
          </div>
          <div className="filter-description-stats-enroll">
            <p>Enrollment: {info.enrolled}/{info.capacity}</p>
            <a>See enrollment history</a>
          </div>
        </div>
        <p className="filter-description-instructors">Instructor(s): {info.instructors}</p>
        <div className="filter-description-tabs">
          <div className="tabs">
            <ul>
              <li className={tab == 0 && 'is-active'}><a onClick={this.details}>Course Details</a></li>
              <li className={tab == 1 && 'is-active'}><a onClick={this.sections}>Sections</a></li>
            </ul>
          </div>
          {tab == 0 ? (
            <ClassDetails
              details={info.details}
              prerequisites={info.prerequisites}
            />
          ) : (
            <ClassSections
              sections={info.sections}
            />
          )}
        </div>
      </div>
    );
  }
}

ClassDescription.defaultProps = {
  courseAbbreviation: 'CS 61B',
  courseTitle: 'The Structure and Interpretation of Computer Programs',
  instructors: 'John Denero, Paul Hilfinger',
  percentageEnrolled: 60,
  enrolled: 90,
  capacity: 150,
  units: 4,
  averageGrade: 'B',
  details: 'yadayadayada',
  prerequisites: 'yadayadayada',
  sections: [
    {
      type: 'Lecture',
      ccn: '001',
      time: 'MWF 2pm-2:59pm',
      location: 'Wheeler 150',
      enrolled: 10,
      capacity: 20,
      waitlist: 9999,
      waitlistCapacity: 9999,
    },
    {
      type: 'Lab',
      ccn: '011',
      time: 'M 4pm-4:59pm',
      location: 'Soda 420',
      enrolled: 10,
      capacity: 20,
      waitlist: 1,
      waitlistCapacity: 2,
    }
  ],
  favorites: 78,
}

export default ClassDescription;
