import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SemesterBlock from "./SemesterBlock"
import { Flex } from '@radix-ui/themes';
import SidePanel from "./SidePanel" 
import "./Dashboard.scss"

type DegreeOption = {
  label: string;
  value: string;
};

type ClassType = {
  id: number;
  name: string;
  units: number;
};

function SemesterHome() {
  const location = useLocation();
  const state = location.state as {
    startYear: string;
    gradYear: string;
    summerCheck: boolean;
    selectedDegreeList: DegreeOption[];
    selectedMinorList: DegreeOption[];
  };
  
  const { startYear, gradYear, summerCheck, selectedDegreeList, selectedMinorList } = state;
  // const selectedDegreeStrings: string[] = selectedDegreeList.map((degree) => degree.value);
  // const selectedMinorStrings: string[] = selectedMinorList.map((minor) => minor.value);
  const selectedDegreeStrings: string[] = ['Computer Science'];
  const selectedMinorStrings: string[] = ['Data Science']

  // Pretend this is the queried data
  const user = {
    "name": "Yuna Kim",
    "majors": selectedDegreeStrings,
    "minors": selectedMinorStrings
  }

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
2
  // Function to update all semesters data
  const updateAllSemesters = (semesters: { [key: string]: ClassType[] }) => {
    setAllSemesters(semesters);
  };

  const totalUnits = Object.values(semesterTotals).reduce((sum, units) => sum + units, 0);

  return (
    <>
      <Flex direction="row" height="100vh" className='semester-home'>
        {/* Side panel */}
        <SidePanel 
          name={user.name} 
          majors={user.majors} 
          minors={user.minors}
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
}

export default SemesterHome;