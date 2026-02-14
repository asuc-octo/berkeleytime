import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import {
  ArrowLeft,
  Copy,
  Edit,
  ShareIos,
  Shuffle,
  SidebarCollapse,
  SidebarExpand,
  Upload,
  ViewColumns2,
} from "iconoir-react";
import { Link } from "react-router-dom";

import { Button, IconButton, Input, MenuItem, Tooltip } from "@repo/theme";

import Week from "@/app/Schedule/Editor/Week";
import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { IScheduleClass, IScheduleEvent } from "@/lib/api";
import { Color, Component, GetClassDocument } from "@/lib/generated/graphql";
import { RecentType, addRecent } from "@/lib/recent";

import { SectionColor, getNextClassColor, getY } from "../schedule";
import { getSelectedSections } from "../schedule";
import Calendar from "./Calendar";
import CloneDialog from "./CloneDialog";
import EditDialog from "./EditDialog";
import styles from "./Editor.module.scss";
import GenerateSchedulesDialog from "./GenerateSchedulesDialog";
import Map from "./Map";
import ShareDialog from "./ShareDialog";
import SideBar from "./SideBar";
import exportToCalendar from "./exportToCalendar";

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(schedule.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update nameValue when schedule.name changes
  useEffect(() => {
    setNameValue(schedule.name);
  }, [schedule.name]);

  const handleStartEditName = () => {
    setIsEditingName(true);
    setNameValue(schedule.name);
    // Focus the input after it's rendered
    setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 0);
  };

  const handleSaveName = () => {
    const trimmedValue = nameValue.trim();
    if (trimmedValue && trimmedValue !== schedule.name) {
      updateSchedule(schedule._id, { name: trimmedValue });
    } else {
      setNameValue(schedule.name);
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setNameValue(schedule.name);
    setIsEditingName(false);
  };

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
      const section = [
        ...selectedClass.class.sections,
        selectedClass.class.primarySection,
      ].find((section) => section?.number === number);

      if (!section) return;

      // Filter out selected sections from the same component
      const selectedSections = selectedClass.selectedSections.filter(
        (selectedSection) => {
          // return selectedSection.sectionId == section.sectionId

          const currentSection = [
            ...selectedClass.class.sections,
            selectedClass.class.primarySection,
          ].find((section) => section?.sectionId === selectedSection.sectionId);

          return (
            !currentSection || currentSection.component !== section.component
          );
        }
      );

      // Add the selected section, unless it already exists (then remove)
      selectedClass.selectedSections = selectedClass.selectedSections.find(
        (s) => s.sectionId === section.sectionId
      )
        ? selectedSections
        : [...selectedSections, section];

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
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
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
        selectedClass.class.primarySection?.number === number
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

      if (previousIndex < 0 || currentIndex < 0) return;

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
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleClassSelect = useCallback(
    async (
      subject: string,
      courseNumber: string,
      number: string,
      sessionId: string
    ) => {
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
        const index = _schedule.classes?.findIndex(
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
                hidden,
                locked,
                blockedSections,
                lockedComponents,
              }) => ({
                subject,
                courseNumber,
                number,
                sectionIds: selectedSections.map((s) => s.sectionId),
                color,
                hidden,
                locked,
                blockedSections,
                lockedComponents,
              })
            ),
          },
          {
            optimisticResponse: {
              updateSchedule: _schedule,
            },
          }
        );

        return;
      }

      // Fetch the selected class
      const { data } = await apolloClient.query({
        query: GetClassDocument,
        variables: {
          year: schedule.year,
          semester: schedule.semester,
          sessionId,
          subject,
          courseNumber,
          number,
        },
      });

      // TODO: Error
      if (!data || !data.class) return;

      const _classClone = structuredClone(data.class);

      const _class: IScheduleClass["class"] = {
        ..._classClone,
        primarySection: _classClone.primarySection
          ? {
              ..._classClone.primarySection,
              subject: _classClone.subject,
              courseNumber: _classClone.courseNumber,
              classNumber: _classClone.number,
            }
          : undefined,
        sections: _classClone.sections.map((s) => {
          return {
            ...s,
            subject: _classClone.subject,
            courseNumber: _classClone.courseNumber,
            classNumber: _classClone.number,
          };
        }),
      };

      const selectedSections = [_class.primarySection];

      // DISABLED: Don't select by default?
      // const kinds = Array.from(
      //   new Set(_classClone.sections.map((section) => section.component))
      // );

      // Add the first section of each kind to selected sections
      // for (const kind of kinds) {
      //   const section = _class.sections
      //     .filter((section) => section.component === kind)
      //     .sort((a, b) => a.number.localeCompare(b.number))[0];

      //   selectedSections.push(section);
      // }

      _schedule.classes.push({
        class: _class,
        selectedSections: selectedSections.map((s) => {
          return {
            sectionId: s?.sectionId,
            ...s,
          };
        }),
        color: getNextClassColor(_schedule.classes.length),
        hidden: false,
        locked: false,
        blockedSections: [],
        lockedComponents: [],
      });

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              class: { subject, courseNumber, number },
              selectedSections,
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
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
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleLockChange = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      locked: boolean
    ) => {
      if (!editing) return;
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

      // Update the locked state
      selectedClass.locked = locked;

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleHideChange = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      hidden: boolean
    ) => {
      if (!editing) return;
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

      // Update the hidden state
      selectedClass.hidden = hidden;

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleSectionBlockToggle = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      sectionId: number,
      blocked: boolean
    ) => {
      if (!editing) return;
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

      // Get current blocked section IDs (handle both Section[] and number[] formats)

      // Update the blockedSections array
      if (blocked) {
        if (!selectedClass.blockedSections?.find((s) => s === sectionId)) {
          selectedClass.blockedSections = [
            ...(selectedClass.blockedSections || []),
            sectionId,
          ];
        }
      } else {
        selectedClass.blockedSections = selectedClass.blockedSections?.filter(
          (s) => s !== sectionId
        );
      }

      selectedClass.selectedSections = selectedClass.selectedSections.filter(
        (s) => s.sectionId !== sectionId
      );

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleComponentBlockToggle = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      component: Component,
      blocked: boolean
    ) => {
      if (!editing) return;
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

      // Get current blocked section IDs (handle both Section[] and number[] formats)

      const sectionIds = [
        selectedClass.class.primarySection,
        ...selectedClass.class.sections,
      ]
        .filter((s) => s && s.sectionId && s.component === component)
        .map((s) => s!.sectionId);

      // Update the blockedSections array
      sectionIds.forEach((sectionId) => {
        if (blocked) {
          if (!selectedClass.blockedSections?.find((s) => s === sectionId)) {
            selectedClass.blockedSections = [
              ...(selectedClass.blockedSections || []),
              sectionId,
            ];
          }
        } else {
          selectedClass.blockedSections = selectedClass.blockedSections?.filter(
            (s) => s !== sectionId
          );
        }
      });

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleComponentLockChange = useCallback(
    (
      subject: string,
      courseNumber: string,
      classNumber: string,
      component: Component,
      locked: boolean
    ) => {
      if (!editing) return;
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

      // Update the lockedComponents array
      const lockedComponents = selectedClass.lockedComponents || [];
      if (locked) {
        if (!lockedComponents.includes(component)) {
          selectedClass.lockedComponents = [...lockedComponents, component];
        }
      } else {
        selectedClass.lockedComponents = lockedComponents.filter(
          (c) => c !== component
        );
      }

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          classes: _schedule.classes.map(
            ({
              selectedSections,
              class: { number, subject, courseNumber },
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            }) => ({
              subject,
              courseNumber,
              number,
              sectionIds: selectedSections.map((s) => s.sectionId),
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
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
              description,
              days,
              color,
              hidden,
            }) => ({
              startTime,
              endTime,
              title,
              description,
              days,
              color,
              hidden,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
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
              description,
              days,
              color,
              hidden,
            }) => ({
              startTime,
              endTime,
              title,
              description,
              days,
              color,
              hidden,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleEventHideChange = useCallback(
    (id: string, hidden: boolean) => {
      // Clone the schedule for immutability
      const _schedule = structuredClone(schedule);

      const event = _schedule.events.find((e) => e._id == id);

      if (!event) return;

      // Update the hidden state
      event.hidden = hidden;

      // Update the schedule
      updateSchedule(
        schedule._id,
        {
          events: _schedule.events.map(
            ({
              startTime,
              endTime,
              title,
              description,
              days,
              color,
              hidden,
            }) => ({
              startTime,
              endTime,
              title,
              description,
              days,
              color,
              hidden,
            })
          ),
        },
        {
          optimisticResponse: {
            updateSchedule: _schedule,
          },
        }
      );
    },
    [schedule, updateSchedule]
  );

  const handleDeleteEvent = (event: IScheduleEvent) => {
    const _schedule = structuredClone(schedule);

    _schedule.events = _schedule.events.filter((e) => e._id != event._id);

    updateSchedule(
      schedule._id,
      {
        events: _schedule.events.map((e) => {
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
      },
      {
        optimisticResponse: {
          updateSchedule: _schedule,
        },
      }
    );
  };

  const handleDeleteClass = (_class: IScheduleClass["class"]) => {
    const _schedule = structuredClone(schedule);

    _schedule.classes = schedule.classes.filter(
      (c) =>
        c.class.primarySection?.sectionId !== _class.primarySection?.sectionId
    );

    updateSchedule(
      schedule._id,
      {
        classes: _schedule.classes.map(
          ({
            selectedSections,
            class: { number, subject, courseNumber },
            color,
            hidden,
            locked,
            blockedSections,
            lockedComponents,
          }) => ({
            subject,
            courseNumber,
            number,
            sectionIds: selectedSections.map((s) => s.sectionId),
            color,
            hidden,
            locked,
            blockedSections,
            lockedComponents,
          })
        ),
      },
      {
        optimisticResponse: {
          updateSchedule: _schedule,
        },
      }
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.group}>
          <Tooltip
            trigger={
              <Link to="../schedules">
                <IconButton>
                  <ArrowLeft />
                </IconButton>
              </Link>
            }
            title="Back to schedules"
          />
          {isEditingName ? (
            <Input
              ref={nameInputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                } else if (e.key === "Escape") {
                  handleCancelEditName();
                }
              }}
              onBlur={handleSaveName}
              className={styles.heading}
              style={{ fontSize: "inherit", fontWeight: "inherit" }}
            />
          ) : (
            <p
              className={styles.heading}
              onClick={editing ? handleStartEditName : undefined}
              style={editing ? { cursor: "pointer" } : undefined}
            >
              {schedule.name}
            </p>
          )}
          {editing && (
            <EditDialog>
              <Tooltip
                trigger={
                  <IconButton onClick={handleStartEditName}>
                    <Edit />
                  </IconButton>
                }
                title="Edit"
              />
            </EditDialog>
          )}
          <Tooltip
            trigger={
              <IconButton
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <SidebarExpand /> : <SidebarCollapse />}
              </IconButton>
            }
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          />
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
        {editing && (
          <GenerateSchedulesDialog schedule={schedule}>
            <Button variant="secondary">
              <Shuffle />
              Generate
            </Button>
          </GenerateSchedulesDialog>
        )}
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
        <Button variant="secondary" onClick={() => exportToCalendar(schedule)}>
          <Upload />
          Export
        </Button>
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
        {!sidebarCollapsed && (
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
            onLockChange={handleLockChange}
            onHideChange={handleHideChange}
            onSectionBlockToggle={handleSectionBlockToggle}
            onComponentBlockToggle={handleComponentBlockToggle}
            onComponentLockChange={handleComponentLockChange}
            onEventColorChange={handleEventColorChange}
            onEventTitleChange={handleEventTitleChange}
            onEventHideChange={handleEventHideChange}
          />
        )}
        <div className={styles.view} ref={bodyRef} id="boundary">
          {tab === 0 ? (
            <Week
              events={schedule.events.filter((e) => !e.hidden)}
              selectedSections={selectedSections}
              currentSection={currentSection}
            />
          ) : tab === 1 ? (
            <Calendar
              term={schedule.term}
              customEvents={schedule.events.filter((e) => !e.hidden)}
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
