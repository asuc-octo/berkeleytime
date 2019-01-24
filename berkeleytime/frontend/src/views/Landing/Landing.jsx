import React from 'react';
import { Grid, Row } from 'react-bootstrap';

import Jumbotron from '../../components/Landing/Jumbotron.jsx';
import MissionSection from '../../components/Landing/MissionSection.jsx';
import PurposeSection from '../../components/Landing/PurposeSection.jsx';

function Landing() {
  return (
    <div className="app-container">
      <Grid fluid>
        <Row>
          <Jumbotron />
        </Row>
        <Row>
          <PurposeSection />
        </Row>
        <Row>
          <MissionSection />
        </Row>
      </Grid>
    </div>
  );
}

export default Landing;
