import SuspenseBoundary from '@/components/SuspenseBoundary';
import { lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [selectedMinors, setSelectedMinors] = useState<DegreeOption[]>([]);
  
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
    navigate(`/gradtrak/dashboard`)
  };

  return (
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
          selectedList={selectedMajors}
        />
      )}
      {step === 2 && (
        <AddDegree
          isMajor={false}
          onNext={handleMinorsComplete}
          selectedList={selectedMinors}
        />
      )}
    </SuspenseBoundary>
  );
}

