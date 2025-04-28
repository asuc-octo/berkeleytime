import SemesterBlock from "./SemesterBlock"
import { Flex } from '@repo/theme';
import SidePanel from "./SidePanel" 
import styles from "./Dashboard.module.scss"

import { useReadUser } from '@/hooks/api';
import { useState, useMemo, useEffect } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';

type DegreeOption = {
  label: string;
  value: string;
};

type ClassType = {
  id: number;
  name: string;
  units: number;
  grading?: 'Graded' | 'P/NP';
  credit?: 'UC Berkeley' | 'Transfer';
  requirements?: string[];
};

function SemesterHome() {
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

  if (userLoading || !isStateValid) {
    // Don't try to destructure state here, as it might be null/invalid
    return <p>Loading user data or missing setup information...</p>; // Show loading/informative message
  }
  
  const { startYear, gradYear, summerCheck, selectedDegreeList, selectedMinorList } = state!;
  const selectedDegreeStrings: string[] = selectedDegreeList.map((degree) => degree.value);
  const selectedMinorStrings: string[] = selectedMinorList.map((minor) => minor.value);
  // const selectedDegreeStrings: string[] = ['Computer Science'];
  // const selectedMinorStrings: string[] = ['Data Science']

  /*
  // Pretend this is the queried data
  const user = {
    "name": "Yuna Kim",
    "majors": selectedDegreeStrings,
    "minors": selectedMinorStrings
  }
  */

  const currentUserInfo = useMemo(
    (): { name: string; majors: string[]; minors: string[]; } | null => {
       // The `if (userLoading || !isStateValid)` block above ensures `user` is loaded and state is valid here.
       // We add a defensive check for `user` just in case, though it shouldn't be hit.
       if (!user) {
           console.error("User data unexpectedly null in currentUserInfo memo after loading check.");
            // Return null if user is somehow null
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
  
  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{ [key: string]: ClassType[] }>({});

  const updateTotalUnits = (semesterKey: string, newTotal: number) => {
    setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
  };

  // Function to update all semesters data
  const updateAllSemesters = (semesters: { [key: string]: ClassType[] }) => {
    setAllSemesters(semesters);
  };

  const totalUnits = Object.values(semesterTotals).reduce((sum, units) => sum + units, 0);

  if (!currentUserInfo) {
    return <p>Error displaying user information.</p>;
  }

  return (
    <>
      <Flex direction="row" height="100vh" className='semester-home'>
        {/* Side panel */}
        <SidePanel 
          name={currentUserInfo.name} 
          majors={currentUserInfo.majors} 
          minors={currentUserInfo.minors}
          totalUnits={totalUnits}
          transferUnits={0}
          pnpTotal={0}
        />

        {/* Page body */}
        <Flex direction="column" gap="32px" className='semester-blocks'>
          <h1 className='semester-title'>Semesters</h1>
          <Flex direction="row" gap="12px" className='semester-layout'>
            <SemesterBlock 
              semesterId="miscellaneous" 
              selectedSemester={"Miscellaneous"} 
              selectedYear={""} 
              onTotalUnitsChange={(newTotal) => updateTotalUnits("Miscellaneous", newTotal)}
              allSemesters={allSemesters}
              updateAllSemesters={updateAllSemesters}
            />
            
            {years.map((year) => (
              <Flex key={year} className="year-element" direction="row" gap="12px">
                <SemesterBlock 
                  semesterId={`fall-${year}`}
                  selectedSemester={"Fall"} 
                  selectedYear={year} 
                  onTotalUnitsChange={(newTotal) => updateTotalUnits(`Fall-${year}`, newTotal)}
                  allSemesters={allSemesters}
                  updateAllSemesters={updateAllSemesters}
                />
                <SemesterBlock 
                  semesterId={`spring-${year}`}
                  selectedSemester={"Spring"} 
                  selectedYear={year} 
                  onTotalUnitsChange={(newTotal) => updateTotalUnits(`Spring-${year}`, newTotal)}
                  allSemesters={allSemesters}
                  updateAllSemesters={updateAllSemesters}
                />
                {summerCheck &&
                  <SemesterBlock 
                    semesterId={`summer-${year}`}
                    selectedSemester={"Summer"} 
                    selectedYear={year} 
                    onTotalUnitsChange={(newTotal) => updateTotalUnits(`Summer-${year}`, newTotal)}
                    allSemesters={allSemesters}
                    updateAllSemesters={updateAllSemesters}
                  />
                }
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </>
  );

  // return (
  //   <>
  //     <Flex direction="row" height="100vh" className='semester-home'>
  //       {/* Side panel */}
  //       <SidePanel 
  //         name={user.name} 
  //         majors={user.majors} 
  //         minors={user.minors}
  //         totalUnits={totalUnits}
  //         transferUnits={0}
  //         pnpTotal={0}
  //       />

  //       {/* Page body */}
  //       <Flex direction="column" gap="32px" className='semester-blocks'>
  //         <h3 className='semester-title'>Semesters</h3>
  //         <Flex direction="row" gap="12px" className='semester-layout'>
  //           <SemesterBlock 
  //             semesterId="miscellaneous" 
  //             selectedSemester={"Miscellaneous"} 
  //             selectedYear={""} 
  //             onTotalUnitsChange={(newTotal) => updateTotalUnits("Miscellaneous", newTotal)}
  //             allSemesters={allSemesters}
  //             updateAllSemesters={updateAllSemesters}
  //           />
            
  //           {years.map((year) => (
  //             <Flex key={year} className="year-element" direction="row" gap="12px">
  //               <SemesterBlock 
  //                 semesterId={`fall-${year}`}
  //                 selectedSemester={"Fall"} 
  //                 selectedYear={year} 
  //                 onTotalUnitsChange={(newTotal) => updateTotalUnits(`Fall-${year}`, newTotal)}
  //                 allSemesters={allSemesters}
  //                 updateAllSemesters={updateAllSemesters}
  //               />
  //               <SemesterBlock 
  //                 semesterId={`spring-${year}`}
  //                 selectedSemester={"Spring"} 
  //                 selectedYear={year} 
  //                 onTotalUnitsChange={(newTotal) => updateTotalUnits(`Spring-${year}`, newTotal)}
  //                 allSemesters={allSemesters}
  //                 updateAllSemesters={updateAllSemesters}
  //               />
  //               {summerCheck &&
  //                 <SemesterBlock 
  //                   semesterId={`summer-${year}`}
  //                   selectedSemester={"Summer"} 
  //                   selectedYear={year} 
  //                   onTotalUnitsChange={(newTotal) => updateTotalUnits(`Summer-${year}`, newTotal)}
  //                   allSemesters={allSemesters}
  //                   updateAllSemesters={updateAllSemesters}
  //                 />
  //               }
  //             </Flex>
  //           ))}
  //         </Flex>
  //       </Flex>
  //     </Flex>
  //   </>
  // );
}

export default SemesterHome;