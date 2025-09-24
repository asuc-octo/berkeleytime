import { 
  useState, 
  useMemo, 
  useEffect,
  useCallback
} from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';

import { useReadUser, useReadPlans } from '@/hooks/api';
import { 
  Plus,
  Filter,
  Sort,
  NavArrowDown,
} from "iconoir-react"

import SidePanel from "./SidePanel" ;
import SemesterBlock from "./SemesterBlock";
import { IPlanTerm, ISelectedCourse } from '@/lib/api';

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
    summerCheck: boolean;
    selectedDegreeList: DegreeOption[];
    selectedMinorList: DegreeOption[];
    planTerms: IPlanTerm[];
  } | undefined | null;

  const isStateValid = useMemo(() => {
    return state !== null && state !== undefined &&
      typeof state.summerCheck === 'boolean' &&
      Array.isArray(state.selectedDegreeList) &&
      Array.isArray(state.selectedMinorList) && 
      Array.isArray(state.planTerms)
  }, [state]);

  useEffect(() => {
    if (!isStateValid && !userLoading) {
        console.warn("GradTrak state is invalid or missing after user loaded. Redirecting to setup.");
        console.log(
          state,
          state !== null, 
          state !== undefined,
          typeof state?.summerCheck === 'boolean',
          Array.isArray(state?.selectedDegreeList),
          Array.isArray(state?.selectedMinorList),
          Array.isArray(state?.planTerms));
        navigate('/gradtrak/onboarding', { replace: true }); // Redirect
    }
  }, [isStateValid, userLoading, navigate]);

  const { selectedDegreeList, selectedMinorList, planTerms } = state!;
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

  // State for semester totals and classes
  const [semesterTotals, setSemesterTotals] = useState<Record<string, number>>({});

  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{ [key: string]: ISelectedCourse[] }>({});

  const updateTotalUnits = useCallback((semesterKey: string, newTotal: number) => {
    setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
  }, []);
  
  const convertPlanTermsToSemesters = useCallback((planTerms: IPlanTerm[]): { [key: string]: ISelectedCourse[] } => {
    const semesters: { [key: string]: ISelectedCourse[] } = {};
    
    planTerms.forEach((planTerm) => {
      // Create semester key based on term and year
      const semesterKey = planTerm._id;
      
      const classes: ISelectedCourse[] = [];
      
      /* TODO(Daniel):
        - Implement adding classes
        - Implement moving classes
        - Implement editing classes
        - Implement deleting classes
      */
      planTerm.courses.forEach((course: ISelectedCourse) => {
        classes.push(course);
      });
      
      if (semesterKey) {
        semesters[semesterKey] = classes;
      }
    });
    return semesters;
  }, []);

  // Function to update all semesters data
  const updateAllSemesters = useCallback((semesters: { [key: string]: ISelectedCourse[] }) => {
    setAllSemesters(semesters);
  }, []);

  useEffect(() => {
    if (state?.planTerms && state.planTerms.length > 0) {
      const convertedSemesters = convertPlanTermsToSemesters(state.planTerms);
      setAllSemesters(convertedSemesters);
      console.log(convertedSemesters);
    }
  }, [state?.planTerms, convertPlanTermsToSemesters]);


  const totalUnits = Object.values(semesterTotals).reduce((sum, units) => sum + units, 0);

  if (!currentUserInfo) {
    navigate('/gradtrak', { replace: true });
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
          {planTerms && planTerms.map((term) => (
            <SemesterBlock 
              planTerm={term}
              onTotalUnitsChange={(newTotal) => updateTotalUnits(term.name ? term.name : "", newTotal)}
              allSemesters={allSemesters}
              updateAllSemesters={updateAllSemesters}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}

export default Dashboard;