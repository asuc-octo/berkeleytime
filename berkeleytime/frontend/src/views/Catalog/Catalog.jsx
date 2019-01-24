import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx';
import FilterResults from '../../components/FilterSidebar/FilterResults.jsx';

function Catalog() {
  return (
    <div className="app-container">
      <Grid fluid>
        <Row>
          <Col md={3}>
            <FilterSidebar />
          </Col>
          <Col md={3}>
            <FilterResults />
          </Col>
        </Row>
      </Grid>
    </div>
  );
}

export default Catalog;
