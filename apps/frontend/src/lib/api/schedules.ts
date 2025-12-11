import { gql } from "@apollo/client";

import {
  ReadScheduleQuery,
  ReadSchedulesQuery,
  SelectedClassInput,
  UpdateScheduleInput,
} from "../generated/graphql";

export type ScheduleIdentifier = string;

export type IScheduleClass = NonNullable<
  NonNullable<ReadScheduleQuery["schedule"]>["classes"][number]
>;

export type IScheduleClassInput = SelectedClassInput;

export type IScheduleEvent = NonNullable<
  NonNullable<ReadScheduleQuery["schedule"]>["events"][number]
>;

export type IScheduleInput = UpdateScheduleInput;

export type ISchedule = NonNullable<ReadScheduleQuery["schedule"]>;

export const READ_SCHEDULE = gql`
  query ReadSchedule($id: ID!) {
    schedule(id: $id) {
      _id
      name
      public
      createdBy
      year
      semester
      sessionId
      term {
        startDate
        endDate
      }
      events {
        _id
        title
        description
        startTime
        endTime
        days
        color
      }
      classes {
        class {
          subject
          courseNumber
          number
          unitsMax
          unitsMin
          course {
            title
            gradeDistribution {
              average
              distribution {
                letter
                count
              }
            }
          }
          primarySection {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
            enrollment {
              latest {
                status
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
            meetings {
              days
              location
              endTime
              startTime
              instructors {
                familyName
                givenName
              }
            }
            exams {
              date
              type
              location
              startTime
              endTime
            }
          }
          sections {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
            enrollment {
              latest {
                status
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
            meetings {
              days
              location
              endTime
              startTime
              instructors {
                familyName
                givenName
              }
            }
            exams {
              date
              type
              location
              startTime
              endTime
            }
          }
        }
        selectedSections {
          sectionId
        }
        color
      }
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule($id: ID!, $schedule: UpdateScheduleInput!) {
    updateSchedule(id: $id, schedule: $schedule) {
      _id
      name
      public
      createdBy
      year
      semester
      sessionId
      term {
        startDate
        endDate
      }
      events {
        _id
        title
        description
        startTime
        endTime
        days
        color
      }
      classes {
        class {
          subject
          courseNumber
          number
          unitsMax
          unitsMin
          course {
            title
            gradeDistribution {
              average
              distribution {
                letter
                count
              }
            }
          }
          primarySection {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
            enrollment {
              latest {
                status
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
            meetings {
              days
              location
              endTime
              startTime
              instructors {
                familyName
                givenName
              }
            }
            exams {
              date
              type
              location
              startTime
              endTime
            }
          }
          sections {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
            enrollment {
              latest {
                status
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
            meetings {
              days
              location
              endTime
              startTime
              instructors {
                familyName
                givenName
              }
            }
            exams {
              date
              type
              location
              startTime
              endTime
            }
          }
        }
        selectedSections {
          sectionId
        }
        color
      }
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($id: ID!) {
    deleteSchedule(id: $id)
  }
`;

export const CREATE_SCHEDULE = gql`
  mutation CreateSchedule($schedule: CreateScheduleInput!) {
    createSchedule(schedule: $schedule) {
      _id
      name
      public
      createdBy
      year
      semester
      sessionId
      term {
        startDate
        endDate
      }
      events {
        _id
        title
        description
        startTime
        endTime
        days
        color
      }
      classes {
        class {
          subject
          courseNumber
          number
          unitsMax
          unitsMin
          course {
            title
            gradeDistribution {
              average
              distribution {
                letter
                count
              }
            }
          }
          primarySection {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
            enrollment {
              latest {
                status
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
            meetings {
              days
              location
              endTime
              startTime
              instructors {
                familyName
                givenName
              }
            }
            exams {
              date
              type
              location
              startTime
              endTime
            }
          }
          sections {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
            enrollment {
              latest {
                status
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
            meetings {
              days
              location
              endTime
              startTime
              instructors {
                familyName
                givenName
              }
            }
            exams {
              date
              type
              location
              startTime
              endTime
            }
          }
        }
        selectedSections {
          sectionId
        }
        color
      }
    }
  }
`;

export const READ_SCHEDULES = gql`
  query ReadSchedules {
    schedules {
      _id
      name
      year
      semester
      sessionId
      classes {
        class {
          subject
          courseNumber
          number
        }
        # selectedSections
      }
    }
  }
`;

export type IScheduleListSchedule = NonNullable<
  ReadSchedulesQuery["schedules"]
>[number];
export type IScheduleListClass =
  NonNullable<IScheduleListSchedule>["classes"][number];
