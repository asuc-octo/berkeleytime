import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client";
import { Filter, NavArrowDown, Plus, Sort } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import {
  Boundary,
  Button,
  IconButton,
  LoadingIndicator,
  Tooltip,
} from "@repo/theme";

import { initialize } from "@/components/CourseSearch/browser";
import {
  useCreateNewPlanTerm,
  useEditPlan,
  useEditPlanTerm,
  useReadPlan,
  useReadUser,
} from "@/hooks/api";
import {
  GET_COURSE_NAMES,
  GetCoursesResponse,
  ILabel,
  IPlanTerm,
  ISelectedCourse,
  PlanInput,
  PlanTermInput,
  Status,
} from "@/lib/api";
import { convertStringsToRequirementEnum } from "@/lib/course";

import AddBlockMenu from "./AddBlockMenu";
import styles from "./Dashboard.module.scss";
import DisplayMenu from "./DisplayMenu";
import LabelMenu from "./LabelMenu";
import SemesterBlock from "./SemesterBlock";
import SidePanel from "./SidePanel";
import { useGradTrakSettings } from "./settings";

export interface SelectedCourse extends ISelectedCourse {
  courseSubject: string;
  courseNumber: string;
}

export default function Dashboard() {
  const { data: user, loading: userLoading } = useReadUser();
  const navigate = useNavigate();

  const { data: gradTrak, loading: gradTrakLoading } = useReadPlan({
    skip: !user,
  });

  if (!gradTrakLoading && !gradTrak) {
    console.log("GradTrak not found");
    navigate("/gradtrak");
  }

  const hasLoadedRef = useRef(false);
  const { data: courses, loading: courseLoading } =
    useQuery<GetCoursesResponse>(GET_COURSE_NAMES, {
      skip: hasLoadedRef.current,
      onCompleted: () => {
        hasLoadedRef.current = true;
      },
    });
  const catalogCoursesRef = useRef<SelectedCourse[]>([]);
  const indexRef = useRef<ReturnType<typeof initialize> | null>(null);

  if (courses?.courses && catalogCoursesRef.current.length === 0) {
    const formattedClasses = courses.courses.map((course) => ({
      courseID: `${course.subject}_${course.number}`,
      courseName: `${course.subject} ${course.number}`,
      courseTitle: course.title,
      courseUnits: -1, // TODO(Daniel): fetch when adding
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
  const [settings, updateSettings] = useGradTrakSettings();
  const [localLabels, setLocalLabels] = useState<ILabel[]>([]);
  const [localPlanTerms, setLocalPlanTerms] = useState<IPlanTerm[]>([]);
  const displayMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [editPlan] = useEditPlan();
  const [editPlanTerm] = useEditPlanTerm();

  const selectedDegreeStrings = useMemo(() => {
    return gradTrak?.majors || [];
  }, [gradTrak?.majors]);

  const selectedMinorStrings = useMemo(() => {
    return gradTrak?.minors || [];
  }, [gradTrak?.minors]);

  useEffect(() => {
    if (gradTrak?.labels) {
      setLocalLabels(gradTrak.labels);
    }
  }, [gradTrak?.labels]);

  useEffect(() => {
    if (gradTrak?.planTerms) {
      const cleanedPlanTerms = gradTrak.planTerms.map((term) => ({
        ...term,
        courses: term.courses.map((course) => ({
          ...course,
          labels: course.labels.filter((label) =>
            localLabels.some(
              (validLabel) =>
                validLabel.name === label.name &&
                validLabel.color === label.color
            )
          ),
        })),
      }));
      setLocalPlanTerms(cleanedPlanTerms);
    } else {
      setLocalPlanTerms([]);
    }
  }, [gradTrak?.planTerms, localLabels]);

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
  const insertPlanTerm = (planTerms: IPlanTerm[], newTerm: IPlanTerm) => {
    const insertIndex = findInsertionIndex(planTerms, newTerm);
    const newArray = [...planTerms];
    newArray.splice(insertIndex, 0, newTerm);
    setLocalPlanTerms(newArray);
  };
  const findInsertionIndex = (
    planTerms: IPlanTerm[],
    newTerm: IPlanTerm
  ): number => {
    for (let i = 0; i < planTerms.length; i++) {
      const currentTerm = planTerms[i];
      if (newTerm.year < currentTerm.year) {
        return i;
      }
      if (newTerm.year === currentTerm.year) {
        if (
          getTermOrder(newTerm.term) < getTermOrder(currentTerm.term) ||
          (getTermOrder(newTerm.term) === getTermOrder(currentTerm.term) &&
            newTerm.name < currentTerm.name)
        ) {
          return i;
        }
      }
    }
    return planTerms.length;
  };

  const [createNewPlanTerm] = useCreateNewPlanTerm();
  const handleNewPlanTerm = async (planTerm: PlanTermInput) => {
    const tmp: IPlanTerm = {
      _id: "",
      userEmail: gradTrak ? gradTrak.userEmail : "",
      name: planTerm.name,
      year: planTerm.year,
      term: planTerm.term,
      hidden: planTerm.hidden,
      status: planTerm.status,
      pinned: planTerm.pinned,
      courses: [],
    };
    const oldPlanTerms = [...localPlanTerms];
    insertPlanTerm(oldPlanTerms, tmp);
    try {
      const result = await createNewPlanTerm(planTerm);
      if (result.data?.createNewPlanTerm?._id) {
        tmp._id = result.data?.createNewPlanTerm?._id;
      } else {
        throw new Error("Cannot find id");
      }
    } catch (error) {
      console.error("Error creating new plan term:", error);
      setLocalPlanTerms(oldPlanTerms);
    }
  };

  // Helper functions to update both local state and backend
  const handleUpdateTermName = async (termId: string, name: string) => {
    const updatedPlanTerms = [...localPlanTerms];
    const termIndex = updatedPlanTerms.findIndex((term) => term._id === termId);
    if (termIndex !== -1) {
      updatedPlanTerms[termIndex].name = name;
      setLocalPlanTerms(updatedPlanTerms);

      try {
        await editPlanTerm(termId, { name });
      } catch (error) {
        console.error("Error updating term name:", error);
        // Revert local state on error
        setLocalPlanTerms(localPlanTerms);
      }
    }
  };

  const handleTogglePin = async (termId: string) => {
    const updatedPlanTerms = [...localPlanTerms];
    const termIndex = updatedPlanTerms.findIndex((term) => term._id === termId);
    if (termIndex !== -1) {
      const newPinned = !updatedPlanTerms[termIndex].pinned;
      updatedPlanTerms[termIndex].pinned = newPinned;
      setLocalPlanTerms(updatedPlanTerms);

      try {
        await editPlanTerm(termId, { pinned: newPinned });
      } catch (error) {
        console.error("Error toggling pin:", error);
        // Revert local state on error
        setLocalPlanTerms(localPlanTerms);
      }
    }
  };

  const handleSetStatus = async (termId: string, status: Status) => {
    const updatedPlanTerms = [...localPlanTerms];
    const termIndex = updatedPlanTerms.findIndex((term) => term._id === termId);
    if (termIndex !== -1) {
      updatedPlanTerms[termIndex].status = status;
      setLocalPlanTerms(updatedPlanTerms);

      try {
        await editPlanTerm(termId, { status });
      } catch (error) {
        console.error("Error setting status:", error);
        // Revert local state on error
        setLocalPlanTerms(localPlanTerms);
      }
    }
  };

  const updateLabels = (labels: ILabel[]) => {
    setLocalLabels(labels);
    const plan: PlanInput = {};
    plan.labels = labels;
    editPlan(plan);
  };

  useEffect(() => {
    if (gradTrak?.labels) {
      setLocalLabels(gradTrak.labels);
    }
  }, [gradTrak?.labels]);

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

  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{
    [key: string]: ISelectedCourse[];
  }>({});

  const updateTotalUnits = useCallback(
    (semesterKey: string, newTotal: number) => {
      setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
    },
    []
  );

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
            uniReqs: course.uniReqs,
            collegeReqs: course.collegeReqs,
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
  const updateAllSemesters = useCallback(
    (semesters: { [key: string]: ISelectedCourse[] }) => {
      setAllSemesters(semesters);
    },
    []
  );

  useEffect(() => {
    if (localPlanTerms && localPlanTerms.length > 0) {
      const convertedSemesters = convertPlanTermsToSemesters(localPlanTerms);
      setAllSemesters(convertedSemesters);
    }
  }, [localPlanTerms, convertPlanTermsToSemesters]);

  const totalUnits = Object.values(semesterTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  useEffect(() => {
    if (!currentUserInfo && !userLoading && !gradTrakLoading) {
      navigate("/gradtrak", { replace: true });
    }
  }, [currentUserInfo, userLoading, gradTrakLoading, navigate]);

  if (userLoading || gradTrakLoading || courseLoading) {
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
          majors={currentUserInfo ? currentUserInfo.majors : []}
          minors={currentUserInfo ? currentUserInfo.minors : []}
          totalUnits={totalUnits}
          transferUnits={0}
          pnpTotal={0}
          uniReqsFulfilled={convertStringsToRequirementEnum(
            gradTrak?.uniReqsSatisfied ? gradTrak?.uniReqsSatisfied : []
          )}
          collegeReqsFulfilled={convertStringsToRequirementEnum(
            gradTrak?.collegeReqsSatisfied ? gradTrak?.collegeReqsSatisfied : []
          )}
        />
      </div>

      <div className={styles.view}>
        <div className={styles.header}>
          <h1>Semesters</h1>

          <div className={styles.buttonsGroup}>
            <Tooltip content="Filter">
              <IconButton>
                <Filter />
              </IconButton>
            </Tooltip>
            <Tooltip content="Sort">
              <IconButton>
                <Sort />
              </IconButton>
            </Tooltip>
            <Tooltip content="Add new block">
              <IconButton
                onClick={() => {
                  setShowAddBlockMenu(!showAddBlockMenu);
                }}
              >
                <Plus />
              </IconButton>
            </Tooltip>
            <Tooltip content="Display settings">
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
            </Tooltip>
          </div>
        </div>
        {showDisplayMenu && (
          <DisplayMenu
            onClose={() => setShowDisplayMenu(false)}
            settings={settings}
            onChangeSettings={(patch) => updateSettings(patch)}
            triggerRef={displayMenuTriggerRef}
            labels={localLabels}
            setShowLabelMenu={setShowLabelMenu}
          />
        )}
        <LabelMenu
          open={showLabelMenu}
          onOpenChange={setShowLabelMenu}
          labels={localLabels}
          onLabelsChange={updateLabels}
        />
        {showAddBlockMenu && (
          <AddBlockMenu
            onClose={() => setShowAddBlockMenu(false)}
            createNewPlanTerm={handleNewPlanTerm}
          />
        )}
        <div className={styles.semesterBlocks}>
          <div className={styles.semesterLayout} data-layout={settings.layout}>
            {localPlanTerms &&
              localPlanTerms.map((term) => (
                <SemesterBlock
                  key={term._id}
                  planTerm={term}
                  onTotalUnitsChange={(newTotal) =>
                    updateTotalUnits(term.name ? term.name : "", newTotal)
                  }
                  allSemesters={allSemesters}
                  updateAllSemesters={updateAllSemesters}
                  settings={settings}
                  labels={localLabels}
                  setShowLabelMenu={setShowLabelMenu}
                  catalogCourses={catalogCourses}
                  index={index}
                  handleUpdateTermName={(name) =>
                    handleUpdateTermName(term._id, name)
                  }
                  handleTogglePin={() => handleTogglePin(term._id)}
                  handleSetStatus={(status: Status) =>
                    handleSetStatus(term._id, status)
                  }
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
