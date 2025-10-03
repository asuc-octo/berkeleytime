import { useState } from "react";

import { Separator } from "@radix-ui/themes";

import { Box, Button, Container, Flex, Select } from "@repo/theme";

import DotsIndicator from "../DotsIndicator";
import styles from "./AddCollege.module.scss";
import { Colleges } from "@/lib/api";
import colleges from "./colleges.json";

type CollegeOption = {
  label: string;
  value: string;
};

type AddCollegesProps = {
  onNext: (selected: Colleges[]) => void;
};

export default function AddColleges({ onNext }: AddCollegesProps) {
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedCollegeList, setSelectedCollegeList] = useState<CollegeOption[]>(
    []
  );

  const collegeOptions = colleges.colleges.map((college) => ({
    label: college,
    value: college,
  }));

  
  const convertCollegeOptions = (colleges: CollegeOption[]) : Colleges[] => {
    const output = colleges.map((college) => {
      switch (college.value) {
        case "Business":
          return Colleges.HAAS;
        case "Letters & Science":
          return Colleges.LnS;
        case "Engineering": 
          return Colleges.CoE;
        default:
          return Colleges.OTHER;
      }
    });
    // prune duplicates
    return [...new Set(output)];
  }

  const handleAddCollege = () => {
    if (selectedCollege) {
      const newCollege = { label: selectedCollege, value: selectedCollege };
      setSelectedCollegeList([...selectedCollegeList, newCollege]);
      setSelectedCollege(null);
    }
  };

  const handleRemoveCollege = (collegeToRemove: CollegeOption) => {
    setSelectedCollegeList(
      selectedCollegeList.filter(
        (college) => college.value !== collegeToRemove.value
      )
    );
  };

  const handleConfirmClick = () => {
    onNext(convertCollegeOptions(selectedCollegeList));
  };

  const handleSkipClick = () => {
    onNext(convertCollegeOptions(selectedCollegeList));
  };

  const CollegeSelect = () => (
    <div className={styles.collegeSelect}>
      <Select
        options={collegeOptions}
        clearable={true}
        placeholder={`Search for a college...`}
        value={selectedCollege}
        onChange={(newValue) => setSelectedCollege(newValue as string | null)}
      />
    </div>
  );

  return (
    <Box p="5">
      <Container style={{ marginTop: "0px" }}>
        <div className={styles.hero}>
          <Flex direction="column" gap="2rem">
            <Flex direction="column" align="center" gap="16px">
              <h1>Add Schools & Colleges</h1>
              <p>
                Search for your college and add it to
                Gradtrak to list specific requirements.
              </p>
            </Flex>

            <Flex direction="column" align="start" gap="16px" width="100%">
              <CollegeSelect />
              <a>Don't see your college?</a>
              <Button
                  className={styles.addButton}
                  variant="tertiary"
                  onClick={handleAddCollege}
                >
                Add
              </Button>
            </Flex>

            <Separator size="4" />

            <Flex direction="column" align="start" gap="16px" width="100%">
              <h2>Selected Colleges</h2>
              {selectedCollegeList.length === 0 ? (
                <p>None Selected</p>
              ) : (
                <div
                  className={styles.selectedCollegeList}
                  id={`colleges-list`}
                >
                  {selectedCollegeList.map((college) => (
                      <div key={college.value} className={styles.collegeChip}>
                        {college.label}
                        <span
                          className={styles.deleteIcon}
                          onClick={() => handleRemoveCollege(college)}
                        >
                          ✕
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </Flex>

            <Flex gap="10px">
              <Button
                className={styles.secondary}
                variant="tertiary"
                onClick={handleSkipClick}
              >
                Skip
              </Button>
              <Button
                className={styles.primary}
                variant="primary"
                onClick={handleConfirmClick}
                disabled={
                  selectedCollegeList.length === 0
                }
              >
                Confirm
              </Button>
            </Flex>

            <DotsIndicator currentPage={1} totalPages={4} />
          </Flex>
        </div>
      </Container>
    </Box>
  );
}
