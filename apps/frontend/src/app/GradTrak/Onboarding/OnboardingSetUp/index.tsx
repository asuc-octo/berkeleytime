import React from 'react';

import { Check } from "iconoir-react";
import { Checkbox } from "radix-ui";
import { 
  Flex, 
  Container, 
  Box, 
  Select,
  Button
} from "@repo/theme"

import DotsIndicator from '../DotsIndicator';
import styles from "./OnboardingSetUp.module.scss";

type OnboardingSetupProps = {
  onNext: (startYear: string, gradYear: string, summerCheck: boolean) => void;
  startYear: string;
  gradYear: string;
  summerCheck: boolean;
};

export default function OnboardingSetup({
  onNext,
  startYear,
  gradYear,
  summerCheck,
}: OnboardingSetupProps) {
  const [localStartYear, setLocalStartYear] = React.useState(startYear);
  const [localGradYear, setLocalGradYear] = React.useState(gradYear);

  const [localSummerCheck, setLocalSummerCheck] = React.useState(summerCheck);

  const now = new Date();
  const currentYear = now.getFullYear();
  const gradYearStart = parseInt(localStartYear) || currentYear;
 
  const startYearOptions = Array.from(
    { length: 11 },
    (_, i) => {
      const year = (currentYear - 5 + i).toString();
      return { label: year, value: year };
    }
  );
  
  const gradYearOptions = Array.from(
    { length: 11 },
    (_, i) => {
      const year = (gradYearStart + i).toString();
      return { label: year, value: year };
    }
  );

  const handleSelectYear = (id: string, year: string) => {
    if (id === 'startYear') {
      setLocalStartYear(year);
      
      if (parseInt(year) > parseInt(localGradYear)) {
        setLocalGradYear('');
      }
    } else if (id === 'gradYear') {
      setLocalGradYear(year);
    }
  };

  const handleNextClick = () => {
    if (localStartYear && localGradYear) {
      onNext(localStartYear, localGradYear, localSummerCheck);
    } else {
      alert("Please select both start and graduation years."); // Not sure
    }
  };

  return (
    <Box p="5">
      <Container style={{ marginTop: "80px" }}>
        <div className={styles.hero}>
          <Flex direction="column" gap="2rem">

            {/* Header */}
            <Flex direction="column" align="center" gap="0.5rem">
                <h1>Set Up</h1>
                <p>Enter your start year and graduation year</p>
            </Flex>

            {/* Year selection */}
            <Flex direction="column" gap="1rem">
              <Flex direction="row" align="center" gap="0.5rem">

                <Flex direction="column" width="100%" align="start" gap="0.25rem">
                  <p>Start Year</p>
                  <Box flexGrow="1" width="100%">
                    <Select
                      className={styles.yearSelect}
                      id="startYear"
                      options={startYearOptions}
                      isSearchable={true}
                      value={startYearOptions.find(option => option.value === localStartYear)}
                      placeholder={"Start year"}
                      onChange={(option) => {
                        if (option) handleSelectYear("startYear", option.value);
                      }}
                    />
                  </Box>
                </Flex>

                <Flex direction="column" width="100%" align="start" gap="0.25rem">
                  <p>Graduation Year</p>
                  <Box flexGrow="1" width="100%">
                    <Select
                      className={styles.yearSelect}
                      id="gradYear"
                      options={gradYearOptions}
                      isSearchable={true}
                      value={gradYearOptions.find(option => option.value === localGradYear)}
                      placeholder={"Expected graduation year"}
                      onChange={(option) => {
                        if (option) handleSelectYear("gradYear", option.value);
                      }}
                    />
                  </Box>
                </Flex>
              </Flex>

              <Flex className={styles.filter}>
                <Checkbox.Root
                  className={styles.checkbox}
                  id="summer"
                  checked={localSummerCheck}
                  onCheckedChange={(checked) => setLocalSummerCheck(!!checked)}
                >
                  <Checkbox.Indicator asChild>
                    <Check width={12} height={12} />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label htmlFor="summer" className={styles.text}>
                  <span className={styles.value}>Include Summer Semesters?</span>
                </label>
              </Flex>
            </Flex>

            {/* Next Button */}
            <Button className={styles.primary} variant="solid" onClick={handleNextClick}>
              Next
            </Button>

            <DotsIndicator currentPage={0} totalPages={3} />
          </Flex>
        </div>
      </Container>
    </Box>
  );
}