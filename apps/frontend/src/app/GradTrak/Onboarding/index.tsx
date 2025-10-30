import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import SuspenseBoundary from "@/components/SuspenseBoundary";
import { useCreatePlan, useReadPlans, useReadUser } from "@/hooks/api";
import { Colleges, DegreeOption, signIn } from "@/lib/api";

import AddColleges from "./AddColleges";
import AddDegree from "./AddDegree";
import styles from "./Onboarding.module.scss";
import OnboardingSetup from "./OnboardingSetUp";

export default function GradTrakOnboarding() {
  const { data: user, loading: userLoading } = useReadUser();
  const { data: gradTraks, loading: gradTraksLoading } = useReadPlans({
    skip: !user,
  });

  const [step, setStep] = useState(0);
  const [startYear, setStartYear] = useState("");
  const [gradYear, setGradYear] = useState("");

  const navigate = useNavigate();
  const [createPlan] = useCreatePlan();

  const [selectedMajors, setSelectedMajors] = useState<DegreeOption[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<Colleges[]>([]);
  const [, setSelectedMinors] = useState<DegreeOption[]>([]);

  const hasGradTraks = useMemo(() => {
    return (
      !gradTraksLoading &&
      gradTraks !== null &&
      gradTraks !== undefined &&
      gradTraks.length > 0
    );
  }, [gradTraks, gradTraksLoading]);

  useEffect(() => {
    if (user && !userLoading && !gradTraksLoading && hasGradTraks) {
      const latestGradTrak = gradTraks?.[0];

      if (latestGradTrak) {
        navigate(`/gradtrak/dashboard`);
      }
    }
  }, [user, userLoading, gradTraksLoading, hasGradTraks, gradTraks, navigate]);

  if (!user && !userLoading) {
    signIn();
    return <></>;
  }

  const handleSetupComplete = (start: string, grad: string) => {
    setStartYear(start);
    setGradYear(grad);
    setStep(1);
  };

  const handleCollegesComplete = (colleges: Colleges[]) => {
    setSelectedColleges(colleges);
    setStep(2);
  };

  const handleMajorsComplete = (majors: DegreeOption[]) => {
    setSelectedMajors(majors);
    setStep(3);
  };

  const handleMinorsComplete = async (minors: DegreeOption[]) => {
    setSelectedMinors(minors);
    const { data } = await createPlan(
      selectedColleges,
      selectedMajors.map((m) => m.value),
      minors.map((m) => m.value),
      parseInt(startYear, 10),
      parseInt(gradYear, 10)
    );
    navigate(`/gradtrak/dashboard`, {
      state: {
        planTerms: data ? data.createNewPlan.planTerms : [],
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
          />
        )}
        {step === 1 && <AddColleges onNext={handleCollegesComplete} />}
        {step === 2 && (
          <AddDegree isMajor={true} onNext={handleMajorsComplete} />
        )}
        {step === 3 && (
          <AddDegree isMajor={false} onNext={handleMinorsComplete} />
        )}
      </SuspenseBoundary>
    </div>
  );
}
