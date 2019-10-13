import React, { PureComponent } from 'react';

import Jumbotron from '../../components/Landing/Jumbotron';
import Explore from '../../components/Landing/Explore';
import Mission from '../../components/Landing/Mission';
import Sponsors from '../../components/Landing/Sponsors';
import Modal from '../../components/Landing/Modal';

import explore_snap from '../../assets/img/images/landing/explore_snap.png';
import grades_snap from '../../assets/img/images/landing/grades_snap.png';
import enrollment_snap from '../../assets/img/images/landing/enrollment_snap.png';

class Landing extends PureComponent {
  render() {
    return (
      <div className="landing">
        <div className="landing-container">
          <Modal />
          <Jumbotron />
          {Landing.explore.map(item => <Explore {...item} />)}
          <Sponsors />
          <Mission />
        </div>
      </div>
    );
  }
}

Landing.explore = [
  {
    title: 'Explore Courses',
    desc: 'Search through 12000+ courses from the Berkeley catalog. Apply filters for requirements and majors.',
    action: 'Explore Courses',
    link: '/catalog',
    symbol: 'book',
    img: explore_snap,
    reverse: false,
  },
  {
    title: 'See Grade Distributions',
    desc: 'See and compare grade distributions for each course and semester to make the best choice.',
    action: 'See Grades',
    link: '/grades',
    symbol: 'bar-chart',
    img: grades_snap,
    reverse: true,
  },
  {
    title: 'View Enrollment History',
    desc: 'View and compare real-time course enrollment trends and history.',
    action: 'Check Enrollment',
    link: '/enrollment',
    symbol: 'history',
    img: enrollment_snap,
    reverse: false,
  },
];

export default Landing;
