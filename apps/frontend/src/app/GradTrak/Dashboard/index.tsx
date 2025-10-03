import { useCallback, useEffect, useMemo, useState } from "react";

import { Filter, NavArrowDown, Plus, Sort } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, IconButton, Tooltip } from "@repo/theme";

import { useReadPlan, useReadUser } from "@/hooks/api";
import { IPlanTerm, ISelectedCourse } from "@/lib/api";
import { convertStringsToRequirementEnum } from "@/lib/course";

import styles from "./Dashboard.module.scss";
import DisplayMenu from "./DisplayMenu";
import SemesterBlock from "./SemesterBlock";
import SidePanel from "./SidePanel";
import { useGradTrakSettings } from "./settings";

export default function Dashboard() {
  const { data: user, loading: userLoading } = useReadUser();
  const navigate = useNavigate();

  const { data: gradTrak, loading: gradTrakLoading } = useReadPlan({
    skip: !user,
  });

  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [settings, updateSettings] = useGradTrakSettings();

  const selectedDegreeStrings = useMemo(() => {
    return gradTrak?.majors || [];
  }, [gradTrak?.majors]);

  const selectedMinorStrings = useMemo(() => {
    return gradTrak?.minors || [];
  }, [gradTrak?.minors]);

  const planTerms = useMemo(() => {
    return gradTrak?.planTerms || [];
  }, [gradTrak?.planTerms]);

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
          transferUnits={transferUnits}
          pnpTotal={pnpTotal}
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
              <IconButton>
                <Plus />
              </IconButton>
            </Tooltip>
            <Tooltip content="Display settings">
              <Button
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
          />
        )}
        <div className={styles.semesterBlocks}>
          <div className={styles.semesterLayout} data-layout={settings.layout}>
            {planTerms &&
              planTerms.map((term) => (
                <SemesterBlock
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
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
