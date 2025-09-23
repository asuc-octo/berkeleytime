import { 
  useState, 
  useMemo, 
  useEffect,
  useCallback
} from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';

import { useReadUser } from '@/hooks/api';
import { 
  Plus,
  Filter,
  Sort,
  NavArrowDown,
} from "iconoir-react"

import { ClassType } from "./types";
import SidePanel from "./SidePanel" ;
import SemesterBlock from "./SemesterBlock";

import styles from "./Dashboard.module.scss";
import { Button, Tooltip, IconButton } from '@repo/theme';

type DegreeOption = {
  label: string;
  value: string;
};

function Dashboard() {
  const { data: user, loading: userLoading } = useReadUser();
  const navigate = useNavigate();

  const location = useLocation();
  const state = location.state as {
    startYear: string;
    gradYear: string;
    summerCheck: boolean;
    selectedDegreeList: DegreeOption[];
    selectedMinorList: DegreeOption[];
  } | undefined | null;

  const isStateValid = useMemo(() => {
    return state !== null && state !== undefined &&
      typeof state.startYear === 'string' && state.startYear.length > 0 &&
      typeof state.gradYear === 'string' && state.gradYear.length > 0 &&
      typeof state.summerCheck === 'boolean' &&
      Array.isArray(state.selectedDegreeList) &&
      Array.isArray(state.selectedMinorList);
  }, [state]);

  useEffect(() => {
    if (!isStateValid && !userLoading) {
        console.warn("GradTrak state is invalid or missing after user loaded. Redirecting to setup.");
        navigate('/gradtrak/onboarding', { replace: true }); // Redirect
    }
  }, [isStateValid, userLoading, navigate]);

  const { startYear, gradYear, summerCheck, selectedDegreeList, selectedMinorList } = state!;
  const selectedDegreeStrings: string[] = selectedDegreeList.map((degree) => degree.value);
  const selectedMinorStrings: string[] = selectedMinorList.map((minor) => minor.value);

  const currentUserInfo = useMemo(
    (): { name: string; majors: string[]; minors: string[]; } | null => {
       if (!user) {
           console.error("User data unexpectedly null in currentUserInfo memo after loading check.");
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
  const years = Array.from(
    { length: yearCount }, 
    (_, i) => numStartYear + i
  );

  // State for semester totals and classes
  const [semesterTotals, setSemesterTotals] = useState<Record<string, number>>({});
  const [semesterPnpTotals, setSemesterPnpTotals] = useState<Record<string, number>>({});
  const [semesterTransferTotals, setSemesterTransferTotals] = useState<Record<string, number>>({});

  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{ [key: string]: ClassType[] }>({});

  const updateTotalUnits = useCallback((semesterKey: string, newTotal: number) => {
    // newTotal: total units, pnpUnits: pass/no pass units
    setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
  }, []);

  const updateSemesterUnits = useCallback((semesterKey: string, newTotal: number, pnpUnits: number, transferUnits: number) => {
    setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
    setSemesterPnpTotals((prev) => ({ ...prev, [semesterKey]: pnpUnits }));
    setSemesterTransferTotals((prev) => ({ ...prev, [semesterKey]: transferUnits }));
  }, []);
  
  
  // Function to update all semesters data
  const updateAllSemesters = useCallback((semesters: { [key: string]: ClassType[] }) => {
    setAllSemesters(semesters);
  }, []);


  const totalUnits = Object.values(semesterTotals).reduce((sum, units) => sum + units, 0);

  // Calculate P/NP total units by summing semester blocks
  const pnpTotal = Object.values(semesterPnpTotals).reduce((sum, units) => sum + units, 0);
  const transferUnits = Object.values(semesterTransferTotals).reduce((sum, units) => sum + units, 0);

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
            transferUnits={transferUnits} 
            pnpTotal={pnpTotal}
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
              <Button variant="secondary">
                Display
                <NavArrowDown />
              </Button>
            </Tooltip>
        </div>
      </div>
      <div className={styles.semesterBlocks}>
        <div className={styles.semesterLayout}>
          <SemesterBlock 
            semesterId="miscellaneous" 
            selectedSemester={"Miscellaneous"} 
            selectedYear={""}
            onTotalUnitsChange={(newTotal, pnpUnits, transferUnits) => updateSemesterUnits("Miscellaneous", newTotal, pnpUnits, transferUnits)}
            allSemesters={allSemesters}
            updateAllSemesters={updateAllSemesters}
          />

          {years.map((year) => (
            <div key={year} className={styles.yearElement}>
              <SemesterBlock 
                semesterId={`fall-${year}`}
                selectedSemester={"Fall"}
                selectedYear={year}
                onTotalUnitsChange={(newTotal, pnpUnits, transferUnits) => updateSemesterUnits(`Fall-${year}`, newTotal, pnpUnits, transferUnits)}
                allSemesters={allSemesters}
                updateAllSemesters={updateAllSemesters}
              />
              <SemesterBlock 
                semesterId={`spring-${year}`}
                selectedSemester={"Spring"}
                selectedYear={year}
                onTotalUnitsChange={(newTotal, pnpUnits, transferUnits) => updateSemesterUnits(`Spring-${year}`, newTotal, pnpUnits, transferUnits)}
                allSemesters={allSemesters}
                updateAllSemesters={updateAllSemesters}
              />
              {summerCheck && (
                <SemesterBlock 
                  semesterId={`summer-${year}`}
                  selectedSemester={"Summer"}
                  selectedYear={year}
                  onTotalUnitsChange={(newTotal, pnpUnits, transferUnits) => updateSemesterUnits(`Summer-${year}`, newTotal, pnpUnits, transferUnits)}
                  allSemesters={allSemesters}
                  updateAllSemesters={updateAllSemesters}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}

export default Dashboard;