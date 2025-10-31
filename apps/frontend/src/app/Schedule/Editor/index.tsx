import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { ArrowLeft, Copy, Edit, ShareIos, ViewColumns2 } from "iconoir-react";
import { Link } from "react-router-dom";

import { Button, Color, IconButton, MenuItem, Tooltip } from "@repo/theme";

import Week from "@/app/Schedule/Week";
import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import {
  IClass,
  IScheduleEvent,
  READ_CLASS,
  ReadClassResponse,
} from "@/lib/api";
import { RecentType, addRecent } from "@/lib/recent";

import { SectionColor, getNextClassColor, getY } from "../schedule";
import { getSelectedSections } from "../schedule";
import Calendar from "./Calendar";
import CloneDialog from "./CloneDialog";
import EditDialog from "./EditDialog";
import styles from "./Editor.module.scss";
import Map from "./Map";
import ShareDialog from "./ShareDialog";
import SideBar from "./SideBar";

export default function Editor() {
  const { schedule, editing } = useSchedule();

  useEffect(() => {
    addRecent(RecentType.Schedule, schedule);
  }, [schedule]);

  const apolloClient = useApolloClient();
  const [updateSchedule] = useUpdateSchedule();

  const [expanded, setExpanded] = useState<boolean[]>([]);
  const [currentSection, setCurrentSection] = useState<SectionColor | null>(
    null
  );
  const [tab, setTab] = useState(0);

  const selectedSections = useMemo(
    () => getSelectedSections(schedule),
    [schedule]
  );

  // Radix and Floating UI reference the boundary by id
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const handleSectionSelect = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      number: string
    ) => {
      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      // Find the associated class
      const selectedClass = _schedule.classes.find(
        (selectedClass) =>
          selectedClass.class.subject === subject &&
          selectedClass.class.courseNumber === courseNumber &&
          selectedClass.class.number === classNumber
      );

      if (!selectedClass) return;

      // Find the associated section
      const section = selectedClass.class.sections.find(
        (section) => section.number === number
      );

      if (!section) return;

      // Filter out selected sections from the same component
      const selectedSections = selectedClass.selectedSections.filter(
        (selectedSection) => {
          // return selectedSection.sectionId == section.sectionId

          const currentSection = selectedClass.class.sections.find(
            (section) => section.sectionId === selectedSection.sectionId
          );

          return (
            !currentSection ||
            currentSection.component !== section.component ||
            currentSection.sectionId == section.sectionId
          );
        }
      );

      // Add the selected section
      selectedClass.selectedSections = [...selectedSections, section];

      setCurrentSection(null);

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
            })
          ),
        }
        // {
        //   optimisticResponse: {
        //     updateSchedule: _schedule,
        //   },
        // }
      );
    },
    [schedule, updateSchedule]
  );

  const handleSectionMouseOver = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      number: string
    ) => {
      const selectedClass = schedule.classes.find(
        (selectedClass) =>
          selectedClass.class.subject === subject &&
          selectedClass.class.courseNumber === courseNumber &&
          selectedClass.class.number === classNumber
      );

      if (!selectedClass) return;

      const section =
        selectedClass.class.primarySection.number === number
          ? selectedClass.class.primarySection
          : selectedClass.class.sections.find(
              (section) => section.number === number
            );

      if (!section) return;

      // Jump to the section
      if (
        tab === 0 &&
        section.meetings[0].startTime &&
        section.meetings[0].endTime
      ) {
        const top = getY(section.meetings[0].startTime) - 50;
        const bottom = getY(section.meetings[0].endTime) + 50;
        const container = bodyRef.current;

        if (container) {
          const containerTop = container.scrollTop;
          const containerBottom = containerTop + container.clientHeight;

          // Only scroll if section is out of view
          if (top < containerTop || bottom > containerBottom) {
            // If section fits in viewport, center it; otherwise show as much as possible
            if (bottom - top <= container.clientHeight) {
              container.scrollTo({
                top: top - (container.clientHeight - (bottom - top)) / 2,
                behavior: "smooth",
              });
            } else {
              // Section is larger than viewport, scroll to show the top
              container.scrollTo({
                top: top,
                behavior: "smooth",
              });
            }
          }
        }
      }

      const selectedSections = schedule.classes.flatMap(
        (selectedClass) => selectedClass.selectedSections
      );

      if (selectedSections.some((s) => s.sectionId === section.sectionId)) {
        setCurrentSection(null);
        return;
      }

      setCurrentSection({
        section,
        color: selectedClass.color!,
      });
    },
    [schedule, tab]
  );

  const handleSortEnd = useCallback(
    (previousIndex: number, currentIndex: number) => {
      previousIndex -= schedule.events.length;
      currentIndex -= schedule.events.length;

      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      const [removed] = _schedule.classes.splice(previousIndex, 1);

      _schedule.classes.splice(currentIndex, 0, removed);

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
            })
          ),
        }
        // {
        //   optimisticResponse: {
        //     updateSchedule: {
        //       ..._schedule,
        //       classes: _schedule.classes.map(({ class: _class, selectedSections, color }) => ({
        //         class: _class,
        //         selectedSections: selectedSections.map(section => ({
        //           ...section,
        //           subject: _class.subject,
        //           courseNumber: _class.courseNumber,
        //           classNumber: _class.number
        //         })),
        //         color
        //       })),
        //       events: _schedule.events?.map(event => ({
        //         ...event,
        //         color: event.color
        //       })) || []
        //     },
        //   },
        // }
      );
    },
    [schedule, updateSchedule]
  );

  const handleClassSelect = useCallback(
    async (subject: string, courseNumber: string, number: string) => {
      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      const existingClass = _schedule.classes.find(
        (selectedClass) =>
          selectedClass.class.subject === subject &&
          selectedClass.class.courseNumber === courseNumber &&
          selectedClass.class.number === number
      );

      // Move existing classes to the top rather than duplicating them
      if (existingClass) {
        const index = _schedule.classes.findIndex(
          (selectedClass) =>
            selectedClass.class.subject === subject &&
            selectedClass.class.courseNumber === courseNumber &&
            number === selectedClass.class.number
        );

        if (index === -1) return;

        setExpanded((expandedClasses) => {
          const _expandedClasses = structuredClone(expandedClasses);
          _expandedClasses.splice(index, 1);
          return [true, ...expandedClasses];
        });

        _schedule.classes.splice(index, 1);
        _schedule.classes = [existingClass, ..._schedule.classes];

        // Update the schedule
        updateSchedule(
          schedule._id,
          {
            classes: _schedule.classes.map(
              ({
                selectedSections,
                class: { number, subject, courseNumber },
                color,
              }) => ({
                subject,
                courseNumber,
                number,
                sectionIds: selectedSections.map((s) => s.sectionId),
                color,
              })
            ),
          }
          // {
          //   optimisticResponse: {
          //     updateSchedule: {
          //       ..._schedule,
          //       classes: _schedule.classes.map(({ class: _class, selectedSections, color }) => ({
          //         class: _class,
          //         selectedSections: selectedSections.map(section => ({
          //           ...section,
          //           subject: _class.subject,
          //           courseNumber: _class.courseNumber,
          //           classNumber: _class.number
          //         })),
          //         color
          //       })),
          //       events: _schedule.events?.map(event => ({
          //         ...event,
          //         color: event.color
          //       })) || []
          //     },
          //   },
          // }
        );

        return;
      }

      // Fetch the selected class
      const { data } = await apolloClient.query<ReadClassResponse>({
        query: READ_CLASS,
        variables: {
          year: schedule.year,
          semester: schedule.semester,
          subject,
          courseNumber,
          number,
        },
      });

      // TODO: Error
      if (!data) return;

      const _class = data.class;

      const selectedSections = [_class.primarySection];

      const kinds = Array.from(
        new Set(_class.sections.map((section) => section.component))
      );

      // Add the first section of each kind to selected sections
      for (const kind of kinds) {
        const section = _class.sections
          .filter((section) => section.component === kind)
          .sort((a, b) => a.number.localeCompare(b.number))[0];

        selectedSections.push(section);
      }

      _schedule.classes.push({
        class: _class,
        selectedSections,
        color: getNextClassColor(_schedule.classes.length),
      });

      const optimisticResponse = {
        ..._schedule,
        classes: _schedule.classes.map(
          ({ class: _class, selectedSections, color }) => ({
            class: _class,
            selectedSections: selectedSections.map((section) => ({
              ...section,
              subject: _class.subject,
              courseNumber: _class.courseNumber,
              classNumber: _class.number,
            })),
            color,
          })
        ),
        events:
          _schedule.events?.map((event) => ({
            ...event,
            color: event.color,
          })) || [],
      };

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              class: { subject, courseNumber, number },
              selectedSections,
              color,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
            })
          ),
        }
        // {
        //   optimisticResponse: {
        //     updateSchedule: optimisticResponse,
        //   },
        // }
      );
    },
    [apolloClient, setExpanded, schedule, updateSchedule]
  );

  const handleExpandedChange = (index: number, expanded: boolean) => {
    setExpanded((expandedClasses) => {
      const _expandedClasses = structuredClone(expandedClasses);
      _expandedClasses[index] = expanded;
      return _expandedClasses;
    });
  };

  const handleColorChange = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      color: Color
    ) => {
      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      // Find the associated class
      const selectedClass = _schedule.classes.find(
        (selectedClass) =>
          selectedClass.class.subject === subject &&
          selectedClass.class.courseNumber === courseNumber &&
          selectedClass.class.number === classNumber
      );

      if (!selectedClass) return;

      // Update the color
      selectedClass.color = color;

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
            })
          ),
        }
        // {
        //   optimisticResponse: {
        //     updateSchedule: {
        //       ..._schedule,
        //       classes: _schedule.classes.map(({ class: _class, selectedSections, color }) => ({
        //         class: _class,
        //         selectedSections: selectedSections.map(section => ({
        //           ...section,
        //           subject: _class.subject,
        //           courseNumber: _class.courseNumber,
        //           classNumber: _class.number
        //         })),
        //         color
        //       })),
        //       events: _schedule.events?.map(event => ({
        //         ...event,
        //         color: event.color
        //       })) || []
        //     },
        //   },
        // }
      );
    },
    [schedule, updateSchedule]
  );

  const handleEventColorChange = useCallback(
    (id: string, color: Color) => {
      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      const event = _schedule.events.find((e) => e._id == id);

      if (!event) return;

      // Update the color
      event.color = color;

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          events: _schedule.events.map(
            ({
              startTime,
              endTime,
              title,
              location,
              description,
              days,
              color,
            }) => ({
              startTime,
              endTime,
              title,
              location,
              description,
              days,
              color,
            })
          ),
        }
        // {
        //   optimisticResponse: {
        //     updateSchedule: {
        //       ..._schedule,
        //       classes: _schedule.classes.map(({ class: _class, selectedSections, color }) => ({
        //         class: _class,
        //         selectedSections: selectedSections.map(section => ({
        //           ...section,
        //           subject: _class.subject,
        //           courseNumber: _class.courseNumber,
        //           classNumber: _class.number
        //         })),
        //         color
        //       })),
        //       events: _schedule.events?.map(event => ({
        //         ...event,
        //         color: event.color
        //       })) || []
        //     },
        //   },
        // }
      );
    },
    [schedule, updateSchedule]
  );

  const handleEventTitleChange = useCallback(
    (id: string, title: string) => {
      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      const event = _schedule.events.find((e) => e._id == id);

      if (!event) return;

      // Update the title
      event.title = title;

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          events: _schedule.events.map(
            ({
              startTime,
              endTime,
              title,
              location,
              description,
              days,
              color,
            }) => ({
              startTime,
              endTime,
              title,
              location,
              description,
              days,
              color,
            })
          ),
        }
        // {
        //   optimisticResponse: {
        //     updateSchedule: {
        //       ..._schedule,
        //       classes: _schedule.classes.map(({ class: _class, selectedSections, color }) => ({
        //         class: _class,
        //         selectedSections: selectedSections.map(section => ({
        //           ...section,
        //           subject: _class.subject,
        //           courseNumber: _class.courseNumber,
        //           classNumber: _class.number
        //         })),
        //         color
        //       })),
        //       events: _schedule.events?.map(event => ({
        //         ...event,
        //         color: event.color
        //       })) || []
        //     },
        //   },
        // }
      );
    },
    [schedule, updateSchedule]
  );

  const handleDeleteEvent = (event: IScheduleEvent) => {
    updateSchedule(
      schedule._id,
      {
        events: schedule.events
          .filter((e) => e._id != event._id)
          .map((e) => {
            // TODO: Fix?
            const _e = structuredClone(e) as Omit<
              IScheduleEvent,
              "_id" | "__typename"
            > & {
              _id?: string;
              __typename?: string;
            };

            delete _e._id;
            delete _e.__typename;

            return _e;
          }),
      }
      // {
      //   optimisticResponse: {
      //     updateSchedule: {
      //       ...schedule,
      //       events: schedule.events.filter((e) => e._id != event._id),
      //     },
      //   },
      // }
    );
  };

  const handleDeleteClass = (_class: IClass) => {
    updateSchedule(
      schedule._id,
      {
        classes: schedule.classes
          .filter(
            (c) =>
              c.class.primarySection.sectionId !=
              _class.primarySection.sectionId
          )
          .map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
            })
          ),
      }
      // {
      //   optimisticResponse: {
      //     updateSchedule: {
      //       ...schedule,
      //       classes: schedule.classes.filter(
      //         (c) =>
      //           c.class.primarySection.sectionId !=
      //           _class.primarySection.sectionId
      //       ),
      //     },
      //   },
      // }
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.group}>
          <Tooltip content="Back to schedules">
            <Link to="../schedules">
              <IconButton>
                <ArrowLeft />
              </IconButton>
            </Link>
          </Tooltip>
          <p className={styles.heading}>{schedule.name}</p>
          {editing && (
            <EditDialog>
              <Tooltip content="Edit">
                <IconButton>
                  <Edit />
                </IconButton>
              </Tooltip>
            </EditDialog>
          )}
          <div className={styles.separator} />
        </div>
        <div className={styles.tabs}>
          <MenuItem active={tab === 0} onClick={() => setTab(0)}>
            Schedule
          </MenuItem>
          <MenuItem active={tab === 1} onClick={() => setTab(1)}>
            Calendar
          </MenuItem>
          {/* <MenuItem active={tab === 2} onClick={() => setTab(2)}>
            Map
          </MenuItem> */}
        </div>
        <Link to="compare">
          <Button variant="secondary">
            <ViewColumns2 />
            Compare
          </Button>
        </Link>
        <CloneDialog>
          <Button variant="secondary">
            <Copy />
            Clone
          </Button>
        </CloneDialog>
        {editing && (
          <ShareDialog>
            <Button>
              Share
              <ShareIos />
            </Button>
          </ShareDialog>
        )}
      </div>
      <div className={styles.body}>
        <SideBar
          expanded={expanded}
          onClassSelect={handleClassSelect}
          onSectionSelect={handleSectionSelect}
          onExpandedChange={handleExpandedChange}
          onSectionMouseOver={handleSectionMouseOver}
          onSectionMouseOut={() => setCurrentSection(null)}
          onSortEnd={handleSortEnd}
          onDeleteClass={handleDeleteClass}
          onDeleteEvent={handleDeleteEvent}
          onColorChange={handleColorChange}
          onEventColorChange={handleEventColorChange}
          onEventTitleChange={handleEventTitleChange}
        />
        <div className={styles.view} ref={bodyRef} id="boundary">
          {tab === 0 ? (
            <Week
              events={schedule.events}
              selectedSections={selectedSections}
              currentSection={currentSection}
            />
          ) : tab === 1 ? (
            <Calendar
              term={schedule.term}
              customEvents={schedule.events}
              selectedSections={selectedSections}
              currentSection={currentSection}
            />
          ) : (
            <Map selectedSections={selectedSections} />
          )}
        </div>
      </div>
    </div>
  );
}
