import { useEffect, useState } from "react";

import { Xmark } from "iconoir-react";

import { Button, Dialog, Flex, Select, Text } from "@repo/theme";

import MajorSearch from "@/components/MajorSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import { useEditPlan } from "@/hooks/api";
import { Colleges, PlanInput } from "@/lib/generated/graphql";

import collegesData from "../Onboarding/AddColleges/colleges.json";
import { DegreeOption } from "../types";
import styles from "./EditPlanDialog.module.scss";
import DEGREES from "./degree-programs-types.json";

type CollegeOption = {
  label: string;
  value: string;
};

type EditPlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMajors?: string[];
  initialMinors?: string[];
  initialColleges?: Colleges[];
  onSave?: () => void;
};

export default function EditPlanDialog({
  open,
  onOpenChange,
  initialMajors = [],
  initialMinors = [],
  initialColleges = [],
  onSave,
}: EditPlanDialogProps) {
  const [editPlan] = useEditPlan();
  const [selectedMajor, setSelectedMajor] = useState<DegreeOption | null>(null);
  const [selectedMinor, setSelectedMinor] = useState<DegreeOption | null>(null);
  const [selectedMajorList, setSelectedMajorList] = useState<DegreeOption[]>(
    []
  );
  const [selectedMinorList, setSelectedMinorList] = useState<DegreeOption[]>(
    []
  );
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedCollegeList, setSelectedCollegeList] = useState<
    CollegeOption[]
  >([]);

  const majorOptions = DEGREES.majors;
  const minorOptions = DEGREES.minors;

  const collegeOptions = collegesData.colleges.map((college) => ({
    label: college,
    value: college,
  }));

  const convertCollegeOptions = (colleges: CollegeOption[]): Colleges[] => {
    const output = colleges.map((college) => {
      switch (college.value) {
        case "Business":
          return Colleges.Haas;
        case "Letters & Science":
          return Colleges.LnS;
        case "Engineering":
          return Colleges.CoE;
        case "Chemistry":
          return Colleges.Chem;
        case "Computing, Data Science & Society":
          return Colleges.Cdss;
        case "Education":
          return Colleges.Edu;
        case "Environmental Design":
          return Colleges.Envdes;
        case "Information":
          return Colleges.Info;
        case "Journalism":
          return Colleges.Journ;
        case "Law":
        case "School of Law":
          return Colleges.Law;
        case "Natural Resources":
          return Colleges.Natres;
        case "Optometry":
          return Colleges.Optom;
        case "Public Health":
          return Colleges.Pubhealth;
        case "Public Policy":
          return Colleges.Pubpolicy;
        case "Social Welfare":
          return Colleges.Socwelf;
        default:
          return Colleges.Other;
      }
    });
    // prune duplicates
    return [...new Set(output)];
  };

  const convertCollegesToOptions = (colleges: Colleges[]): CollegeOption[] => {
    return colleges.map((college) => {
      switch (college) {
        case Colleges.Haas:
          return { label: "Business", value: "Business" };
        case Colleges.LnS:
          return { label: "Letters & Science", value: "Letters & Science" };
        case Colleges.CoE:
          return { label: "Engineering", value: "Engineering" };
        case Colleges.Chem:
          return { label: "Chemistry", value: "Chemistry" };
        case Colleges.Cdss:
          return {
            label: "Computing, Data Science & Society",
            value: "Computing, Data Science & Society",
          };
        case Colleges.Edu:
          return { label: "Education", value: "Education" };
        case Colleges.Envdes:
          return {
            label: "Environmental Design",
            value: "Environmental Design",
          };
        case Colleges.Info:
          return { label: "Information", value: "Information" };
        case Colleges.Journ:
          return { label: "Journalism", value: "Journalism" };
        case Colleges.Law:
          return { label: "Law", value: "Law" };
        case Colleges.Natres:
          return { label: "Natural Resources", value: "Natural Resources" };
        case Colleges.Optom:
          return { label: "Optometry", value: "Optometry" };
        case Colleges.Pubhealth:
          return { label: "Public Health", value: "Public Health" };
        case Colleges.Pubpolicy:
          return { label: "Public Policy", value: "Public Policy" };
        case Colleges.Socwelf:
          return { label: "Social Welfare", value: "Social Welfare" };
        default:
          return { label: "Other", value: "Other" };
      }
    });
  };

  useEffect(() => {
    if (open) {
      const majors: DegreeOption[] = [];
      if (initialMajors) {
        initialMajors.forEach((majorValue) => {
          const majorStr = String(majorValue);
          if (majorOptions.includes(majorStr)) {
            majors.push({
              label: majorStr,
              value: majorStr,
            });
          }
        });
      }

      const minors: DegreeOption[] = [];
      if (initialMinors) {
        initialMinors.forEach((minorValue) => {
          const minorStr = String(minorValue);
          if (minorOptions.includes(minorStr)) {
            minors.push({
              label: minorStr,
              value: minorStr,
            });
          }
        });
      }

      const colleges = convertCollegesToOptions(initialColleges);

      setSelectedMajorList(majors);
      setSelectedMinorList(minors);
      setSelectedCollegeList(colleges);
    }
  }, [
    open,
    initialMajors,
    initialMinors,
    initialColleges,
    majorOptions,
    minorOptions,
  ]);

  const handleMajorSelect = (degree: DegreeOption) => {
    setSelectedMajor(degree);
  };

  const handleMinorSelect = (degree: DegreeOption) => {
    setSelectedMinor(degree);
  };

  const handleClearMajor = () => {
    setSelectedMajor(null);
  };

  const handleClearMinor = () => {
    setSelectedMinor(null);
  };

  const handleAddMajor = async () => {
    if (!selectedMajor) return;

    if (
      selectedMajorList.some((degree) => degree.value === selectedMajor.value)
    ) {
      console.warn("Major already added");
      setSelectedMajor(null);
      return;
    }

    const newList = [...selectedMajorList, selectedMajor];
    const oldList = [...selectedMajorList];
    const addedMajor = selectedMajor;

    setSelectedMajorList(newList);
    setSelectedMajor(null);

    try {
      const plan: PlanInput = {};
      plan.majors = newList.map((m) => m.value);
      await editPlan(plan);
      onSave?.();
    } catch (error) {
      console.error("Error adding major:", error);
      setSelectedMajorList(oldList);
      setSelectedMajor(addedMajor);
    }
  };

  const handleAddMinor = async () => {
    if (!selectedMinor) return;

    if (
      selectedMinorList.some((degree) => degree.value === selectedMinor.value)
    ) {
      console.warn("Minor already added");
      setSelectedMinor(null);
      return;
    }

    const newList = [...selectedMinorList, selectedMinor];
    const oldList = [...selectedMinorList];
    const addedMinor = selectedMinor;

    setSelectedMinorList(newList);
    setSelectedMinor(null);

    try {
      const plan: PlanInput = {};
      plan.minors = newList.map((m) => m.value);
      await editPlan(plan);
      onSave?.();
    } catch (error) {
      console.error("Error adding minor:", error);
      setSelectedMinorList(oldList);
      setSelectedMinor(addedMinor);
    }
  };

  const handleRemoveMajor = async (degreeToRemove: DegreeOption) => {
    const newList = selectedMajorList.filter(
      (degree) => degree.value !== degreeToRemove.value
    );
    const oldList = [...selectedMajorList];

    setSelectedMajorList(newList);

    try {
      const plan: PlanInput = {};
      plan.majors = newList.map((m) => m.value);
      await editPlan(plan);
      onSave?.();
    } catch (error) {
      console.error("Error removing major:", error);
      setSelectedMajorList(oldList);
    }
  };

  const handleRemoveMinor = async (degreeToRemove: DegreeOption) => {
    const newList = selectedMinorList.filter(
      (degree) => degree.value !== degreeToRemove.value
    );
    const oldList = [...selectedMinorList];

    setSelectedMinorList(newList);

    try {
      const plan: PlanInput = {};
      plan.minors = newList.map((m) => m.value);
      await editPlan(plan);
      onSave?.();
    } catch (error) {
      console.error("Error removing minor:", error);
      setSelectedMinorList(oldList);
    }
  };

  const handleAddCollege = async () => {
    if (!selectedCollege) return;

    if (
      selectedCollegeList.some((college) => college.value === selectedCollege)
    ) {
      console.warn("College already added");
      setSelectedCollege(null);
      return;
    }

    const newCollege = { label: selectedCollege, value: selectedCollege };
    const newList = [...selectedCollegeList, newCollege];
    const oldList = [...selectedCollegeList];

    setSelectedCollegeList(newList);
    setSelectedCollege(null);

    try {
      const plan: PlanInput = {};
      plan.colleges = convertCollegeOptions(newList);
      await editPlan(plan);
      onSave?.();
    } catch (error) {
      console.error("Error adding college:", error);
      setSelectedCollegeList(oldList);
      setSelectedCollege(newCollege.value);
    }
  };

  const handleRemoveCollege = async (collegeToRemove: CollegeOption) => {
    const newList = selectedCollegeList.filter(
      (college) => college.value !== collegeToRemove.value
    );
    const oldList = [...selectedCollegeList];

    setSelectedCollegeList(newList);

    try {
      const plan: PlanInput = {};
      plan.colleges = convertCollegeOptions(newList);
      await editPlan(plan);
      onSave?.();
    } catch (error) {
      console.error("Error removing college:", error);
      setSelectedCollegeList(oldList);
    }
  };

  const handleSave = async () => {
    try {
      const plan: PlanInput = {};
      plan.majors = selectedMajorList.map((m) => m.value);
      plan.minors = selectedMinorList.map((m) => m.value);
      plan.colleges = convertCollegeOptions(selectedCollegeList);
      await editPlan(plan);
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay />
      <Dialog.Card className={styles.editDialogCard}>
        <Dialog.Header title="Overview" hasCloseButton />
        <Dialog.Body className={styles.editDialogBody}>
          <Tabs defaultValue="major" className={styles.tabs}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="major">Major(s)</TabsTrigger>
              <TabsTrigger value="minor">Minor(s)</TabsTrigger>
              <TabsTrigger value="college">College(s)</TabsTrigger>
            </TabsList>

            <TabsContent value="major" className={styles.tabContent}>
              <form className={styles.editDialogForm}>
                <div>
                  <Flex gap="8px" className={styles.degreeSearchRow}>
                    <div className={styles.degreeSearchWrapper}>
                      <MajorSearch
                        onSelect={handleMajorSelect}
                        onClear={handleClearMajor}
                        selectedDegree={selectedMajor}
                        degrees={majorOptions}
                        placeholder="Search for a major..."
                      />
                    </div>
                    <Button
                      variant="tertiary"
                      onClick={handleAddMajor}
                      disabled={!selectedMajor}
                      className={styles.addButton}
                    >
                      Add
                    </Button>
                  </Flex>
                  {selectedMajorList.length > 0 ? (
                    <div className={styles.degreeList}>
                      {selectedMajorList.map((degree) => (
                        <div key={degree.value} className={styles.degreeChip}>
                          <span>{degree.label}</span>
                          <span
                            onClick={() => handleRemoveMajor(degree)}
                            className={styles.removeButton}
                          >
                            <Xmark />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text className={styles.emptyState}>None Selected</Text>
                  )}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="minor" className={styles.tabContent}>
              <form className={styles.editDialogForm}>
                <div>
                  <Flex gap="8px" className={styles.degreeSearchRow}>
                    <div className={styles.degreeSearchWrapper}>
                      <MajorSearch
                        onSelect={handleMinorSelect}
                        onClear={handleClearMinor}
                        selectedDegree={selectedMinor}
                        degrees={minorOptions}
                        placeholder="Search for a minor..."
                      />
                    </div>
                    <Button
                      variant="tertiary"
                      onClick={handleAddMinor}
                      disabled={!selectedMinor}
                      className={styles.addButton}
                    >
                      Add
                    </Button>
                  </Flex>
                  {selectedMinorList.length > 0 ? (
                    <div className={styles.degreeList}>
                      {selectedMinorList.map((degree) => (
                        <div key={degree.value} className={styles.degreeChip}>
                          <span>{degree.label}</span>
                          <span
                            onClick={() => handleRemoveMinor(degree)}
                            className={styles.removeButton}
                          >
                            <Xmark />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text className={styles.emptyState}>None Selected</Text>
                  )}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="college" className={styles.tabContent}>
              <form className={styles.editDialogForm}>
                <div>
                  <Flex gap="8px" className={styles.degreeSearchRow}>
                    <div className={styles.degreeSearchWrapper}>
                      <Select
                        options={collegeOptions}
                        clearable={true}
                        searchable={true}
                        placeholder="Search for a college..."
                        value={selectedCollege}
                        onChange={(newValue) =>
                          setSelectedCollege(newValue as string | null)
                        }
                      />
                    </div>
                    <Button
                      variant="tertiary"
                      onClick={handleAddCollege}
                      disabled={!selectedCollege}
                      className={styles.addButton}
                    >
                      Add
                    </Button>
                  </Flex>
                  {selectedCollegeList.length > 0 ? (
                    <div className={styles.degreeList}>
                      {selectedCollegeList.map((college) => (
                        <div key={college.value} className={styles.degreeChip}>
                          <span>{college.label}</span>
                          <span
                            onClick={() => handleRemoveCollege(college)}
                            className={styles.removeButton}
                          >
                            <Xmark />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text className={styles.emptyState}>None Selected</Text>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </Dialog.Footer>
      </Dialog.Card>
    </Dialog.Root>
  );
}
