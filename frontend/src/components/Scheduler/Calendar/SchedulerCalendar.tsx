import React from 'react';
import { Schedule } from 'utils/scheduler/scheduler';
import CourseCalendar from './CourseCalendar';

type Props = {
  schedule: Schedule;
};

/**
 * Outputs the calendar from a scheduler
 */
const SchedulerCalendar = ({ schedule }: Props) => {
  const cards = [];
  return <CourseCalendar cards={cards} />;
};

export default SchedulerCalendar;
