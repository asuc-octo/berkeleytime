import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useUser } from '../../../graphql/hooks/user';
import ProfileScheduleCard from './../../Profile/ProfileScheduleCard';
import { getNodes } from 'utils/graphql';
import { useLocalStorageState } from 'utils/hooks';
import {
  DEFAULT_SCHEDULE,
  isScheduleEmpty,
  Schedule,
  SCHEDULER_LOCALSTORAGE_KEY,
} from 'utils/scheduler/scheduler';
import { Button } from 'bt/custom';
// import { Button } from 'bt/custom';

type Props = {
  updatePage: (i: number) => void;
};

const Welcome = ({ updatePage }: Props) => {
  const { user } = useUser();

  const [schedule, setSchedule] = useLocalStorageState<Schedule>(
    SCHEDULER_LOCALSTORAGE_KEY,
    DEFAULT_SCHEDULE
  );

  const savedSchedules = user
    ? getNodes(user.schedules).sort(
        (a, b) => Date.parse(b.dateCreated) - Date.parse(a.dateCreated)
      )
    : [];

  const resetDraft = () => setSchedule(DEFAULT_SCHEDULE);

  return (
    <Container className="welcome">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <div className="scheduler-title">
            Welcome to Berkeleytime&apos;s Scheduler
          </div>
          <div className="prompt">
            Use our scheduler to build your ideal schedule. Search our catalog
            to add new classes or select from saved ones, and add your own time
            preferences.
          </div>

          <div className="buttons">
            {!isScheduleEmpty(schedule) && (
              <Button variant="inverted" href="/scheduler/new" className="mr-3">
                Continue Draft
              </Button>
            )}
            <Button href="/scheduler/new" onClick={resetDraft}>
              Start
            </Button>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          {savedSchedules.length > 0 && (
            <div className="saved-schedules">
              <div className="scheduler-heading">Saved Schedules</div>
              <div className="profile-card-grid">
                {savedSchedules.map((course) => (
                  <ProfileScheduleCard key={course.id} schedule={course} />
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
