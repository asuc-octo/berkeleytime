import React, { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import CourseSelector from 'components/Scheduler/CourseSelector';
import CourseCalendar from 'components/Scheduler/CourseCalendar';

const Scheduler: FC = () => {
    return (
        <div className="scheduler viewport-app">
            <Row noGutters>
                <Col md={4} lg={4} xl={4}>
                    <CourseSelector />
                </Col>
                <Col>
                    <CourseCalendar cards={[
                        {
                            day: 1,
                            startTime: 8,
                            endTime: 9,
                            title: "Morning Yoga",
                            description: "8am-9am",
                            color: "#F0F0F0"
                        },
                        {
                            day: 2,
                            startTime: 8,
                            endTime: 9,
                            title: "Morning Yoga",
                            description: "8am-9am",
                            color: "#F0F0F0"
                        },
                        {
                            day: 3,
                            startTime: 8,
                            endTime: 9,
                            title: "Theater R1B Disc...",
                            description: "10am-11am, Barrows 123",
                            color: "#E122B7"
                        },
                        {
                            day: 3,
                            startTime: 11,
                            endTime: 12,
                            title: "Theater R1B Lecture",
                            description: "11am-12pm, Dwinelle 123",
                            color: "#E122B7"
                        },
                        {
                            day: 5,
                            startTime: 11,
                            endTime: 12,
                            title: "Theater R1B Lecture",
                            description: "11am-12pm, Dwinelle 123",
                            color: "#E122B7"
                        },
                        {
                            day: 1,
                            startTime: 14,
                            endTime: 15,
                            title: "CS 61A Lecture",
                            description: "2-3pm, Pauley Ballroom",
                            color: "#0B84C9"
                        },
                        {
                            day: 3,
                            startTime: 14,
                            endTime: 15,
                            title: "CS 61A Lecture",
                            description: "2-3pm, Pauley Ballroom",
                            color: "#0B84C9"
                        },
                        {
                            day: 5,
                            startTime: 14,
                            endTime: 15,
                            title: "CS 61A Lecture",
                            description: "2-3pm, Pauley Ballroom",
                            color: "#0B84C9"
                        },
                        {
                            day: 2,
                            startTime: 15,
                            endTime: 16,
                            title: "MATH 1A Lecture",
                            description: "4-5pm, Li Ka Shing 245",
                            color: "#22C379"
                        },
                        {
                            day: 4,
                            startTime: 15,
                            endTime: 16,
                            title: "MATH 1A Lecture",
                            description: "4-5pm, Li Ka Shing 245",
                            color: "#22C379"
                        },
                    ]} />
                </Col>
            </Row>
        </div>
    );
};

export default Scheduler;