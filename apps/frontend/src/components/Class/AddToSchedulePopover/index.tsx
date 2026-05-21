import { useCallback, useMemo, useState } from "react";

import { useLazyQuery } from "@apollo/client/react";
import classNames from "classnames";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { CalendarPlus, Check, Plus } from "iconoir-react";
import { Popover } from "radix-ui";

import { Button, IconButton, Input, Tooltip } from "@repo/theme";

import { getNextClassColor } from "@/app/Schedule/schedule";
import {
  useCreateSchedule,
  useReadSchedules,
  useUpdateSchedule,
} from "@/hooks/api";
import useUser from "@/hooks/useUser";
import { IScheduleListSchedule } from "@/lib/api";
import { signIn } from "@/lib/api";
import { GetClassDocument, Semester } from "@/lib/generated/graphql";

import styles from "./AddToSchedulePopover.module.scss";

interface ClassInfo {
  year: number;
  semester: Semester;
  sessionId: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
}

interface AddToSchedulePopoverProps {
  classInfo?: ClassInfo;
  disabled?: boolean;
}

export default function AddToSchedulePopover({
  classInfo,
  disabled = false,
}: AddToSchedulePopoverProps) {
  const { user } = useUser();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [addingToScheduleIds, setAddingToScheduleIds] = useState<Set<string>>(
    new Set()
  );

  // Only load schedules when the popover is opened (lazy loading)
  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !isPopoverOpen || !user,
  });

  const [fetchClass] = useLazyQuery(GetClassDocument);
  const [createSchedule] = useCreateSchedule();
  const [updateSchedule] = useUpdateSchedule();

  // Filter schedules to only show those matching the current class's term
  const matchingSchedules = useMemo(() => {
    if (!schedules || !classInfo) return [];
    return schedules.filter(
      (schedule): schedule is NonNullable<typeof schedule> =>
        schedule != null &&
        schedule.year === classInfo.year &&
        schedule.semester === classInfo.semester &&
        schedule.sessionId === classInfo.sessionId
    );
  }, [schedules, classInfo]);

  // Check which schedules already contain the class
  const schedulesWithClass = useMemo<Set<string>>(() => {
    if (!matchingSchedules || !classInfo) return new Set();

    const withClass = new Set<string>();
    for (const schedule of matchingSchedules) {
      const hasClass = schedule.classes?.some(
        (entry) =>
          entry?.class?.subject === classInfo.subject &&
          entry?.class?.courseNumber === classInfo.courseNumber &&
          entry?.class?.number === classInfo.classNumber
      );
      if (hasClass) {
        withClass.add(schedule._id);
      }
    }
    return withClass;
  }, [matchingSchedules, classInfo]);

  const handleAddToSchedule = useCallback(
    async (schedule: IScheduleListSchedule) => {
      if (!classInfo || !schedule) return;

      // Already in schedule, do nothing
      if (schedulesWithClass.has(schedule._id)) return;

      setAddingToScheduleIds((prev) => new Set(prev).add(schedule._id));

      try {
        // Fetch the full class data
        const { data } = await fetchClass({
          variables: {
            year: classInfo.year,
            semester: classInfo.semester,
            sessionId: classInfo.sessionId,
            subject: classInfo.subject,
            courseNumber: classInfo.courseNumber,
            number: classInfo.classNumber,
          },
        });

        if (!data?.class) {
          console.error("Failed to fetch class data");
          return;
        }

        // Build the new classes array with the existing classes plus the new one
        const existingClasses =
          schedule.classes?.map((c) => ({
            subject: c.class.subject,
            courseNumber: c.class.courseNumber,
            number: c.class.number,
            sectionIds: c.selectedSections.map((s) => s.sectionId),
            color: c.color,
            hidden: c.hidden,
          })) ?? [];

        // Add the new class with primary section selected
        const newClass = {
          subject: data.class.subject,
          courseNumber: data.class.courseNumber,
          number: data.class.number,
          sectionIds: data.class.primarySection?.sectionId
            ? [data.class.primarySection.sectionId]
            : [],
          color: getNextClassColor(existingClasses.length),
          hidden: false,
        };

        await updateSchedule(schedule._id, {
          classes: [...existingClasses, newClass],
        });
      } catch (error) {
        console.error("Failed to add class to schedule:", error);
      } finally {
        setAddingToScheduleIds((prev) => {
          const next = new Set(prev);
          next.delete(schedule._id);
          return next;
        });
      }
    },
    [classInfo, schedulesWithClass, fetchClass, updateSchedule]
  );

  const handleCreateSchedule = useCallback(async () => {
    if (!newScheduleName.trim() || !classInfo) return;

    setIsCreatingSchedule(true);

    try {
      // Fetch the full class data first
      const { data: classData } = await fetchClass({
        variables: {
          year: classInfo.year,
          semester: classInfo.semester,
          sessionId: classInfo.sessionId,
          subject: classInfo.subject,
          courseNumber: classInfo.courseNumber,
          number: classInfo.classNumber,
        },
      });

      if (!classData?.class) {
        console.error("Failed to fetch class data");
        return;
      }

      // Create the schedule with the class already added
      await createSchedule({
        name: newScheduleName.trim(),
        year: classInfo.year,
        semester: classInfo.semester,
        sessionId: classInfo.sessionId,
        public: false,
        classes: [
          {
            subject: classData.class.subject,
            courseNumber: classData.class.courseNumber,
            number: classData.class.number,
            sectionIds: classData.class.primarySection?.sectionId
              ? [classData.class.primarySection.sectionId]
              : [],
            color: getNextClassColor(0),
            hidden: false,
          },
        ],
      });

      setNewScheduleName("");
      setIsCreateFormOpen(false);
    } catch (error) {
      console.error("Failed to create schedule:", error);
    } finally {
      setIsCreatingSchedule(false);
    }
  }, [newScheduleName, classInfo, fetchClass, createSchedule]);

  const resetForm = () => {
    setIsCreateFormOpen(false);
    setNewScheduleName("");
  };

  const buttonLabel = "Add to schedule";

  return (
    <Popover.Root
      open={isPopoverOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setIsPopoverOpen(open);
      }}
    >
      <Tooltip
        title={buttonLabel}
        trigger={
          <Popover.Trigger asChild>
            <IconButton
              aria-label={buttonLabel}
              disabled={disabled || !classInfo}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!user) {
                  e.preventDefault();
                  signIn();
                  return;
                }
              }}
            >
              <CalendarPlus />
            </IconButton>
          </Popover.Trigger>
        }
      />
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className={styles.popover}
        >
          <div
            className={styles.scheduleList}
            onClick={() => isCreateFormOpen && resetForm()}
          >
            <div className={styles.scheduleRows}>
              {schedulesLoading ? (
                <div className={styles.loadingState}>Loading schedules...</div>
              ) : matchingSchedules.length > 0 ? (
                <LayoutGroup>
                  {matchingSchedules.map((schedule) => {
                    const hasClass = schedulesWithClass.has(schedule._id);
                    const isAdding = addingToScheduleIds.has(schedule._id);
                    return (
                      <motion.div
                        key={schedule._id}
                        layout
                        className={styles.scheduleRow}
                      >
                        <span className={styles.scheduleName}>
                          <span>{schedule.name}</span>
                          <span className={styles.scheduleCount}>
                            ({schedule.classes?.length ?? 0})
                          </span>
                        </span>
                        <IconButton
                          className={classNames(styles.addButton, {
                            [styles.added]: hasClass,
                          })}
                          disabled={isAdding || hasClass}
                          onClick={() => handleAddToSchedule(schedule)}
                        >
                          {hasClass ? (
                            <Check width={16} height={16} />
                          ) : (
                            <Plus width={16} height={16} />
                          )}
                        </IconButton>
                      </motion.div>
                    );
                  })}
                </LayoutGroup>
              ) : (
                <div className={styles.emptyState}>
                  No schedules for this term.
                </div>
              )}
            </div>
            <motion.div
              layout
              transition={{
                layout: { type: "spring", stiffness: 500, damping: 35 },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isCreateFormOpen ? (
                  <motion.div
                    key="form"
                    className={styles.createScheduleForm}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    layout
                  >
                    <div className={styles.createScheduleHeader}>
                      New schedule
                    </div>
                    <div className={styles.createScheduleInputRow}>
                      <label className={styles.createScheduleLabel}>
                        SCHEDULE NAME
                      </label>
                      <Input
                        value={newScheduleName}
                        onChange={(e) => setNewScheduleName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateSchedule();
                          } else if (e.key === "Escape") {
                            resetForm();
                          }
                        }}
                        placeholder="Enter name"
                        autoFocus
                      />
                    </div>
                    <div className={styles.createScheduleActions}>
                      <Button variant="secondary" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button
                        className={styles.createScheduleSubmit}
                        disabled={!newScheduleName.trim() || isCreatingSchedule}
                        onClick={handleCreateSchedule}
                      >
                        Create
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    className={styles.createScheduleBtn}
                    onClick={() => setIsCreateFormOpen(true)}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Plus width={16} height={16} />
                    Create new schedule
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
