import { lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SuspenseBoundary from '@/components/SuspenseBoundary';

import styles from './Onboarding.module.scss'

type DegreeOption = {
  label: string;
  value: string;
};

const OnboardingSetup = lazy(() => import("./OnboardingSetUp"));
const AddDegree = lazy(() => import("./AddDegree"));

export default function GradTrakOnboarding() {
  const [step, setStep] = useState(0);
  const [startYear, setStartYear] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [summerCheck, setSummerCheck] = useState(false);

  const navigate = useNavigate();
  
  const [selectedMajors, setSelectedMajors] = useState<DegreeOption[]>([]);
  const [, setSelectedMinors] = useState<DegreeOption[]>([]);
  
  const handleSetupComplete = (start: string, grad: string, summer: boolean) => {
    setStartYear(start);
    setGradYear(grad);
    setSummerCheck(summer);
    setStep(1);
  };

  const handleMajorsComplete = (majors: DegreeOption[]) => {
    setSelectedMajors(majors);
    setStep(2);
  };

  const handleMinorsComplete = (minors: DegreeOption[]) => {
    setSelectedMinors(minors);
    console.log({ startYear, gradYear, summerCheck, majors: selectedMajors, minors }); // TODO: update user info in backend 
    navigate(`/gradtrak/dashboard`, {
      state: {
        startYear,
        gradYear,
        summerCheck,
        selectedDegreeList: selectedMajors, // Pass the final collected majors
        selectedMinorList: minors,          // Pass the final collected minors (from this step's parameter)
      }
    })
  };

  return (
    <div className={styles.root}>
      <SuspenseBoundary>
        {step === 0 && (
          <OnboardingSetup
            onNext={handleSetupComplete}
            startYear={startYear}
            gradYear={gradYear}
            summerCheck={summerCheck}
          />
        )}
        {step === 1 && (
          <AddDegree
            isMajor={true}
            onNext={handleMajorsComplete}
          />
        )}
        {step === 2 && (
          <AddDegree
            isMajor={false}
            onNext={handleMinorsComplete}
          />
        )}
      </SuspenseBoundary>
    </div>
  );
}

