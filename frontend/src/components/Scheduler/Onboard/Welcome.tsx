import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useUser } from '../../../graphql/hooks/user';
import {
  ScheduleOverviewFragment,
} from '../../../graphql/graphql';
import ProfileScheduleCard from './../../Profile/ProfileScheduleCard';

type Props = {
  updatePage: (i: number) => void;
};

const Welcome = ({ updatePage }: Props) => {
  const { isLoggedIn, user, loading } = useUser();

  const savedSchedules = user ? user.schedules.edges
    .map((schedule) => schedule?.node)
    .filter((s): s is ScheduleOverviewFragment => s !== null)
    .sort((a, b) => Date.parse(b.dateCreated) - Date.parse(a.dateCreated)) : [];

  return (
      <Container className="welcome">
        <Row>
          <Col>
            <div className="scheduler-title">Welcome to Berkeleytime&apos;s Scheduler</div>
            <div className="prompt">Use our scheduler to build your ideal schedule. Search our catalog to add new classes or select from saved ones, and add your own time preferences.</div>
            <Button
              className="bt-btn-primary"
              onClick={() => updatePage(1)}
            >
              Start
            </Button>
              {savedSchedules.length > 0 && (
                <div className="saved-schedules">
                  <div className="scheduler-heading">Saved Schedules</div>
                  <div className="profile-card-grid">
                    {savedSchedules.map((course) => (
                      <ProfileScheduleCard
                        key={course.id}
                        schedule={course}
                      />
                    ))}
                  </div>
                </div>
              )}     
          </Col>
        </Row>
      </Container>
  );
};

export default Welcome;
