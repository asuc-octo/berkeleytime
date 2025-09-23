import { useCallback, useEffect, useMemo, useState } from "react";

import { Filter, NavArrowDown, Plus, Sort } from "iconoir-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button, IconButton, Tooltip } from "@repo/theme";

import { useReadUser } from "@/hooks/api";

import styles from "./Dashboard.module.scss";
import DisplayMenu from "./DisplayMenu";
import SemesterBlock from "./SemesterBlock";
import SidePanel from "./SidePanel";
import { useGradTrakSettings } from "./settings";
import { ClassType } from "./types";

type DegreeOption = {
  label: string;
  value: string;
};

export default function Dashboard() {
  const { data: user, loading: userLoading } = useReadUser();
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as
    | {
        startYear: string;
        gradYear: string;
        summerCheck: boolean;
        selectedDegreeList: DegreeOption[];
        selectedMinorList: DegreeOption[];
      }
    | undefined
    | null;

  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [settings, updateSettings] = useGradTrakSettings();

  const isStateValid = useMemo(() => {
    return (
      state !== null &&
      state !== undefined &&
      typeof state.startYear === "string" &&
      state.startYear.length > 0 &&
      typeof state.gradYear === "string" &&
      state.gradYear.length > 0 &&
      typeof state.summerCheck === "boolean" &&
      Array.isArray(state.selectedDegreeList) &&
      Array.isArray(state.selectedMinorList)
    );
  }, [state]);

  useEffect(() => {
    if (!isStateValid && !userLoading) {
      console.warn(
        "GradTrak state is invalid or missing after user loaded. Redirecting to setup."
      );
      navigate("/gradtrak/onboarding", { replace: true }); // Redirect
    }
  }, [isStateValid, userLoading, navigate]);

  const {
    startYear,
    gradYear,
    summerCheck,
    selectedDegreeList,
    selectedMinorList,
  } = state!;
  const selectedDegreeStrings: string[] = selectedDegreeList.map(
    (degree) => degree.value
  );
  const selectedMinorStrings: string[] = selectedMinorList.map(
    (minor) => minor.value
  );

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

  const numStartYear = parseInt(startYear, 10);
  const numGradYear = parseInt(gradYear, 10);
  const yearCount = numGradYear - numStartYear + 1;
  const terms = Array.from(
    { length: yearCount - 1 },
    (_, i) => numStartYear + i
  ).reduce(
    (acc, year) => {
      acc.push({ year: year, term: "Fall" });
      acc.push({ year: year + 1, term: "Spring" });
      if (summerCheck) acc.push({ year: year, term: "Summer" });
      return acc;
    },
    [] as { year: number; term: string }[]
  );

  // State for semester totals and classes
  const [semesterTotals, setSemesterTotals] = useState<Record<string, number>>(
    {}
  );

  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{
    [key: string]: ClassType[];
  }>({});

  const updateTotalUnits = useCallback(
    (semesterKey: string, newTotal: number) => {
      setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
    },
    []
  );

  // Function to update all semesters data
  const updateAllSemesters = useCallback(
    (semesters: { [key: string]: ClassType[] }) => {
      setAllSemesters(semesters);
    },
    []
  );

  const totalUnits = Object.values(semesterTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  if (!currentUserInfo) {
    return <p>Error displaying user information.</p>; // TODO: Cleaner error page
  }

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <SidePanel
          majors={currentUserInfo.majors}
          minors={currentUserInfo.minors}
          totalUnits={totalUnits}
          transferUnits={0}
          pnpTotal={0}
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
            <SemesterBlock
              semesterId="miscellaneous"
              selectedSemester={"Miscellaneous"}
              selectedYear={""}
              onTotalUnitsChange={(newTotal) =>
                updateTotalUnits("Miscellaneous", newTotal)
              }
              allSemesters={allSemesters}
              updateAllSemesters={updateAllSemesters}
              settings={settings}
            />

            {terms.map(({ term, year }) => (
              <SemesterBlock
                key={`${term}-${year}`}
                semesterId={`${term}-${year}`}
                selectedSemester={term}
                selectedYear={year}
                onTotalUnitsChange={(newTotal) =>
                  updateTotalUnits(`${term}-${year}`, newTotal)
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
