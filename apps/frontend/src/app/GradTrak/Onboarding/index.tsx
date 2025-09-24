import { useState } from "react";

import { useNavigate } from "react-router-dom";

import SuspenseBoundary from "@/components/SuspenseBoundary";

import AddDegree from "./AddDegree";
import styles from "./Onboarding.module.scss";
import OnboardingSetup from "./OnboardingSetUp";
import { useCreatePlan } from "@/hooks/api";
import { Colleges, DegreeOption } from "@/lib/api";

export default function GradTrakOnboarding() {
  const [step, setStep] = useState(0);
  const [startYear, setStartYear] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [summerCheck, setSummerCheck] = useState(false);

  const navigate = useNavigate();
  const [createPlan] = useCreatePlan();

  const [selectedMajors, setSelectedMajors] = useState<DegreeOption[]>([]);
  const [, setSelectedMinors] = useState<DegreeOption[]>([]);

  const handleSetupComplete = (
    start: string,
    grad: string,
    summer: boolean
  ) => {
    setStartYear(start);
    setGradYear(grad);
    setSummerCheck(summer);
    setStep(1);
  };

  const handleMajorsComplete = (majors: DegreeOption[]) => {
    setSelectedMajors(majors);
    setStep(2);
  };

  const handleMinorsComplete = async (minors: DegreeOption[]) => {
    setSelectedMinors(minors);
    const { data } = await createPlan(Colleges.LnS, selectedMajors.map((m) => m.value), minors.map((m) => m.value), parseInt(startYear, 10), parseInt(gradYear, 10));
    console.log(data)
    navigate(`/gradtrak/dashboard`, {
      state: {
        planTerms: data ? data.createNewPlan.planTerms : [],
        summerCheck,
        selectedDegreeList: selectedMajors, // Pass the final collected majors
        selectedMinorList: minors, // Pass the final collected minors (from this step's parameter)
      },
    });
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
          <AddDegree isMajor={true} onNext={handleMajorsComplete} />
        )}
        {step === 2 && (
          <AddDegree isMajor={false} onNext={handleMinorsComplete} />
        )}
      </SuspenseBoundary>
    </div>
  );
}
