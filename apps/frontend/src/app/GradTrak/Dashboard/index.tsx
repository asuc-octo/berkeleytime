import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Filter, NavArrowDown, Plus, Sort } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, IconButton, Tooltip } from "@repo/theme";

import { useEditPlan, useCreateNewPlanTerm, useReadPlan, useReadUser } from "@/hooks/api";
import { ILabel, IPlanTerm, ISelectedCourse, PlanInput, PlanTermInput } from "@/lib/api";
import { convertStringsToRequirementEnum } from "@/lib/course";

import styles from "./Dashboard.module.scss";
import DisplayMenu from "./DisplayMenu";
import LabelMenu from "./LabelMenu";
import SemesterBlock from "./SemesterBlock";
import SidePanel from "./SidePanel";
import { useGradTrakSettings } from "./settings";
import AddBlockMenu from "./AddBlockMenu";

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
  
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [settings, updateSettings] = useGradTrakSettings();
  const [localLabels, setLocalLabels] = useState<ILabel[]>([]);
  const [localPlanTerms, setLocalPlanTerms] = useState<IPlanTerm[]>([]);
  const displayMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [editPlan] = useEditPlan();

  const selectedDegreeStrings = useMemo(() => {
    return gradTrak?.majors || [];
  }, [gradTrak?.majors]);

  const selectedMinorStrings = useMemo(() => {
    return gradTrak?.minors || [];
  }, [gradTrak?.minors]);

  useEffect(() => {
    if (gradTrak?.planTerms) {
      setLocalPlanTerms(gradTrak.planTerms);
    }
  }, [gradTrak?.planTerms]);

  const planTerms = useMemo(() => {
    return localPlanTerms;
  }, [localPlanTerms]);

  const [createNewPlanTerm] = useCreateNewPlanTerm();
  const handleNewPlanTerm = async (planTerm: PlanTermInput) => {
    const tmp : IPlanTerm = {
      _id: "",
      userEmail: gradTrak ? gradTrak.userEmail : "",
      name: planTerm.name,
      year: planTerm.year,
      term: planTerm.term,
      hidden: planTerm.hidden,
      status: planTerm.status,
      pinned: planTerm.pinned,
      courses: [],
    }
    const oldPlanTerms = [...localPlanTerms];
    setLocalPlanTerms([...localPlanTerms, tmp]);
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
    if (planTerms && planTerms.length > 0) {
      const convertedSemesters = convertPlanTermsToSemesters(planTerms);
      setAllSemesters(convertedSemesters);
    }
  }, [planTerms, convertPlanTermsToSemesters]);

  const totalUnits = Object.values(semesterTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  useEffect(() => {
    if (!currentUserInfo && !userLoading && !gradTrakLoading) {
      navigate("/gradtrak", { replace: true });
    }
  }, [currentUserInfo, userLoading, gradTrakLoading, navigate]);

  if (userLoading || gradTrakLoading) {
    return (
      <div className={styles.root}>
        <div>Loading your GradTrak...</div>
      </div>
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
                }}>
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
          <AddBlockMenu onClose={() => setShowAddBlockMenu(false)} createNewPlanTerm={handleNewPlanTerm} />
        )}
        <div className={styles.semesterBlocks}>
          <div className={styles.semesterLayout} data-layout={settings.layout}>
            {planTerms &&
              planTerms.map((term) => (
                <SemesterBlock
                  planTerm={term}
                  onTotalUnitsChange={(newTotal) =>
                    updateTotalUnits(term.name ? term.name : "", newTotal)
                  }
                  allSemesters={allSemesters}
                  updateAllSemesters={updateAllSemesters}
                  settings={settings}
                  labels={localLabels}
                  setShowLabelMenu={setShowLabelMenu}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
