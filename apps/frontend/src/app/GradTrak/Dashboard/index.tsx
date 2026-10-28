import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";
import classNames from "classnames";
import { Bookmark, Edit, NavArrowDown, Plus } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Boundary, Button, LoadingIndicator, Tooltip } from "@repo/theme";

import { initialize } from "@/components/CourseSearch/browser";
import {
  useCreateNewPlanTerm,
  useEditPlan,
  useEditPlanTerm,
  useReadPlan,
  useReadUser,
} from "@/hooks/api";
import { ILabel, IPlanTerm, ISelectedCourse } from "@/lib/api";
import {
  Colleges,
  GetCourseNamesDocument,
  PlanInput,
  PlanTermInput,
  Status,
  Terms,
} from "@/lib/generated/graphql";

import AddBlockMenu from "./AddBlockMenu";
import BookmarksSidebar from "./BookmarksSidebar";
import styles from "./Dashboard.module.scss";
import DisplayMenu from "./DisplayMenu";
import EditPlanDialog from "./EditPlanDialog";
import LabelMenu from "./LabelMenu";
import SemesterBlock from "./SemesterBlock";
import SidePanel from "./SidePanel";
import { useGradTrakSettings } from "./settings";

const EMPTY_LABELS: ILabel[] = [];
const EMPTY_PLAN_TERMS: IPlanTerm[] = [];

export interface SelectedCourse extends ISelectedCourse {
  courseSubject: string;
  courseNumber: string;
}

export default function Dashboard() {
  const { data: user, loading: userLoading } = useReadUser();
  const navigate = useNavigate();

  const {
    data: gradTrak,
    loading: gradTrakLoading,
    refetch: refetchGradTrak,
  } = useReadPlan({
    skip: !user,
    fetchPolicy: "cache-and-network",
  });

  const hasLoadedRef = useRef(false);
  const { data: courses, loading: courseLoading } = useQuery(
    GetCourseNamesDocument,
    {
      skip: hasLoadedRef.current,
    }
  );

  useEffect(() => {
    if (courses && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
    }
  }, [courses]);
  const catalogCoursesRef = useRef<SelectedCourse[]>([]);
  const indexRef = useRef<ReturnType<typeof initialize> | null>(null);

  if (courses?.courses && catalogCoursesRef.current.length === 0) {
    const formattedClasses = courses.courses.map((course) => ({
      courseID: `${course.subject}_${course.number}`,
      courseName: `${course.subject} ${course.number}`,
      courseTitle: course.title,
      courseUnits: -1,
      uniReqs: [], // TODO(Daniel): Fetch reqs
      collegeReqs: [], // TODO(Daniel): Fetch reqs
      pnp: false,
      transfer: false,
      labels: [],
      courseSubject: course.subject,
      courseNumber: course.number,
    }));
    catalogCoursesRef.current = formattedClasses;
    indexRef.current = initialize(courses.courses);
  }
  const catalogCourses = catalogCoursesRef.current;
  const index = indexRef.current;

  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [bookmarksSidebarOpen, setBookmarksSidebarOpen] = useState(false);
  const [settings, updateSettings] = useGradTrakSettings();
  const labels = gradTrak?.labels ?? EMPTY_LABELS;
  const planTerms = gradTrak?.planTerms ?? EMPTY_PLAN_TERMS;
  const displayMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [colleges, setColleges] = useState<Colleges[]>([]);
  const [editPlan] = useEditPlan();
  const [editPlanTerm] = useEditPlanTerm();

  const selectedDegreeStrings = useMemo(() => {
    return gradTrak?.majors || [];
  }, [gradTrak?.majors]);

  const selectedMinorStrings = useMemo(() => {
    return gradTrak?.minors || [];
  }, [gradTrak?.minors]);

  useEffect(() => {
    if (gradTrak?.colleges) {
      setColleges(gradTrak.colleges.map((college) => college as Colleges));
    }
  }, [gradTrak?.colleges]);

  // helper functions for adding new block in right order
  const getTermOrder = (term: string) => {
    switch (term) {
      case "Spring":
        return 1;
      case "Summer":
        return 2;
      case "Fall":
        return 3;
      default:
        return 0;
    }
  };
  const [createNewPlanTerm] = useCreateNewPlanTerm();
  const handleNewPlanTerm = async (planTerm: PlanTermInput) => {
    try {
      const result = await createNewPlanTerm(planTerm);
      if (!result.data?.createNewPlanTerm?._id) {
        throw new Error("Cannot find id");
      }
    } catch (error) {
      console.error("Error creating new plan term:", error);
    }
  };

  // Semesters behave like a vector: they can only be added after, or removed
  // from, the chronologically last one (custom blocks are ignored).
  const lastTerm = planTerms.reduce<IPlanTerm | null>((latest, term) => {
    if (term.year === -1 || term.term === Terms.Misc) return latest;
    if (
      !latest ||
      term.year > latest.year ||
      (term.year === latest.year &&
        getTermOrder(term.term) > getTermOrder(latest.term))
    ) {
      return term;
    }
    return latest;
  }, null);

  const handleAddNextTerm = () => {
    if (!lastTerm) {
      setShowAddBlockMenu(true);
      return;
    }
    // Spring -> Summer -> Fall -> next year's Spring.
    const next =
      lastTerm.term === Terms.Spring
        ? { term: Terms.Summer, year: lastTerm.year }
        : lastTerm.term === Terms.Summer
          ? { term: Terms.Fall, year: lastTerm.year }
          : { term: Terms.Spring, year: lastTerm.year + 1 };
    handleNewPlanTerm({
      name: `${next.term} ${next.year}`,
      year: next.year,
      term: next.term,
      hidden: false,
      status: Status.Incomplete,
      pinned: false,
      courses: [],
    });
  };

  // Update backend and let Apollo cache drive UI state.
  const handleUpdateTermName = async (termId: string, name: string) => {
    try {
      await editPlanTerm(termId, { name });
    } catch (error) {
      console.error("Error updating term name:", error);
    }
  };

  const handleSetStatus = async (termId: string, status: Status) => {
    try {
      await editPlanTerm(termId, { status });
    } catch (error) {
      console.error("Error setting status:", error);
    }
  };

  const updateLabels = (labels: ILabel[]) => {
    const plan: PlanInput = {};
    plan.labels = labels;
    editPlan(plan);
  };

  const currentUserInfo = useMemo(
    (): { name: string; majors: string[]; minors: string[] } | null => {
      if (!user) {
        console.error(
          "User data unexpectedly null in currentUserInfo memo after loading check."
        );
        return null;
      }
      return {
        name: user.name, // Use the actual user's username
        majors: selectedDegreeStrings, // Use the majors from state
        minors: selectedMinorStrings, // Use the minors from state
      };
    },
    [user, selectedDegreeStrings, selectedMinorStrings] // Re-calculate if user or selected lists change
  );

  // State for semester totals and classes
  const [semesterTotals, setSemesterTotals] = useState<Record<string, number>>(
    {}
  );
  const [semesterPnpTotals, setSemesterPnpTotals] = useState<
    Record<string, number>
  >({});
  const [semesterTransferTotals, setSemesterTransferTotals] = useState<
    Record<string, number>
  >({});

  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{
    [key: string]: ISelectedCourse[];
  }>({});
  const updateTotalUnits = useCallback(
    (
      semesterKey: string,
      newTotal: number,
      pnpUnits: number,
      transferUnits: number
    ) => {
      setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
      setSemesterPnpTotals((prev) => ({ ...prev, [semesterKey]: pnpUnits }));
      setSemesterTransferTotals((prev) => ({
        ...prev,
        [semesterKey]: transferUnits,
      }));
    },
    []
  );
  const [editOpen, setEditOpen] = useState(false);
  const convertPlanTermsToSemesters = useCallback(
    (planTerms: IPlanTerm[]): { [key: string]: ISelectedCourse[] } => {
      const semesters: { [key: string]: ISelectedCourse[] } = {};

      planTerms.forEach((planTerm) => {
        // Create semester key based on term and year
        const semesterKey = planTerm._id;

        const classes: ISelectedCourse[] = [];

        planTerm.courses.forEach((course: ISelectedCourse) => {
          // Remove __typename from course object
          const cleanCourse = {
            courseID: course.courseID,
            courseName: course.courseName,
            courseTitle: course.courseTitle,
            courseUnits: course.courseUnits,
            pnp: course.pnp,
            transfer: course.transfer,
            labels:
              course.labels?.map((label) => ({
                name: label.name,
                color: label.color,
              })) || [],
          };
          classes.push(cleanCourse);
        });

        if (semesterKey) {
          semesters[semesterKey] = classes;
        }
      });
      return semesters;
    },
    []
  );

  // Function to update all semesters data
  const updateAllSemesters = (semesters: {
    [key: string]: ISelectedCourse[];
  }) => {
    setAllSemesters(semesters);
  };

  useEffect(() => {
    if (planTerms.length > 0) {
      const convertedSemesters = convertPlanTermsToSemesters(planTerms);
      setAllSemesters(convertedSemesters);
    } else {
      setAllSemesters({});
    }
  }, [planTerms, convertPlanTermsToSemesters]);

  const totalUnits = Object.values(semesterTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  // Calculate P/NP total units by summing semester blocks
  const pnpTotal = Object.values(semesterPnpTotals).reduce(
    (sum, units) => sum + units,
    0
  );
  const transferUnits = Object.values(semesterTransferTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  useEffect(() => {
    if (!currentUserInfo && !userLoading && !gradTrakLoading) {
      navigate("/gradtrak", { replace: true });
    }
  }, [currentUserInfo, userLoading, gradTrakLoading, navigate]);

  if (
    !gradTrak &&
    !courses?.courses &&
    (userLoading || gradTrakLoading || courseLoading)
  ) {
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <SidePanel
          colleges={colleges}
          majors={currentUserInfo ? currentUserInfo.majors : []}
          minors={currentUserInfo ? currentUserInfo.minors : []}
          totalUnits={totalUnits}
          transferUnits={transferUnits}
          pnpTotal={pnpTotal}
          plan={gradTrak}
          planTerms={planTerms}
        />
      </div>

      <div
        className={classNames(styles.viewWrapper, {
          [styles.bookmarksOpen]: bookmarksSidebarOpen,
        })}
      >
        <div className={styles.view}>
          <div className={styles.header}>
            <h1>Semesters</h1>

            <div className={styles.buttonsGroup}>
              <Tooltip
                content="Display settings"
                trigger={
                  <Button
                    ref={displayMenuTriggerRef}
                    variant="secondary"
                    onClick={() => {
                      setShowDisplayMenu(!showDisplayMenu);
                    }}
                  >
                    Display
                    <NavArrowDown />
                  </Button>
                }
              />

              {!bookmarksSidebarOpen && (
                <Tooltip
                  content="Bookmarks"
                  trigger={
                    <Button
                      variant="secondary"
                      onClick={() => setBookmarksSidebarOpen(true)}
                    >
                      <Bookmark />
                      Bookmarks
                    </Button>
                  }
                />
              )}

              <Tooltip
                content="Edit Major"
                trigger={
                  <Button variant="primary" onClick={() => setEditOpen(true)}>
                    <Edit />
                    Edit
                  </Button>
                }
              />

              <EditPlanDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                initialMajors={gradTrak?.majors}
                initialMinors={gradTrak?.minors}
                initialColleges={gradTrak?.colleges as Colleges[]}
                onSave={() => refetchGradTrak()}
              />
            </div>
          </div>
          {showDisplayMenu && (
            <DisplayMenu
              onClose={() => setShowDisplayMenu(false)}
              settings={settings}
              onChangeSettings={(patch) => updateSettings(patch)}
              triggerRef={displayMenuTriggerRef}
              labels={labels}
              setShowLabelMenu={setShowLabelMenu}
            />
          )}
          <LabelMenu
            open={showLabelMenu}
            onOpenChange={setShowLabelMenu}
            labels={labels}
            onLabelsChange={updateLabels}
          />
          {showAddBlockMenu && (
            <AddBlockMenu
              onClose={() => setShowAddBlockMenu(false)}
              createNewPlanTerm={handleNewPlanTerm}
            />
          )}
          <div className={styles.semesterBlocks}>
            <div className={styles.semesterBlocksInner}>
              <div
                className={styles.semesterLayout}
                data-layout={settings.layout}
              >
                {[...planTerms]
                  .sort((a, b) => {
                    // misc always comes first
                    if (a.year == -1 || b.year == -1) {
                      return a.year - b.year;
                    }
                    // oldest first, so the last semester is always on the right
                    if (a.year != b.year) return a.year - b.year;
                    return getTermOrder(a.term) - getTermOrder(b.term);
                  })
                  .map((term) => (
                    <SemesterBlock
                      key={term._id}
                      planTerm={term}
                      onTotalUnitsChange={(newTotal, pnpUnits, transferUnits) =>
                        updateTotalUnits(
                          term.name ? term.name : "",
                          newTotal,
                          pnpUnits,
                          transferUnits
                        )
                      }
                      allSemesters={allSemesters}
                      updateAllSemesters={updateAllSemesters}
                      settings={settings}
                      labels={labels}
                      setShowLabelMenu={setShowLabelMenu}
                      catalogCourses={catalogCourses}
                      index={index}
                      handleUpdateTermName={(name) =>
                        handleUpdateTermName(term._id, name)
                      }
                      handleSetStatus={(status: Status) =>
                        handleSetStatus(term._id, status)
                      }
                      handleRemoveTerm={() => {
                        const updatedSemesters = { ...allSemesters };
                        delete updatedSemesters[term._id];
                        updateAllSemesters(updatedSemesters);
                      }}
                      isLast={term._id === lastTerm?._id}
                    />
                  ))}
                {/* Appends the semester after the last one (see handleAddNextTerm). */}
                <Tooltip
                  content={
                    lastTerm ? "Add next semester" : "Add your first semester"
                  }
                  trigger={
                    <button
                      type="button"
                      className={styles.addSemesterButton}
                      onClick={handleAddNextTerm}
                      aria-label="Add semester"
                    >
                      <Plus />
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {bookmarksSidebarOpen && (
          <BookmarksSidebar onClose={() => setBookmarksSidebarOpen(false)} />
        )}
      </div>
    </div>
  );
}
