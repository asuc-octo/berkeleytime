import { useState } from "react";

import { Box, Button, Container, Flex, Select } from "@repo/theme";

import DotsIndicator from "../DotsIndicator";
import styles from "./OnboardingSetUp.module.scss";

type OnboardingSetupProps = {
  onNext: (startYear: string, gradYear: string) => void;
  startYear: string;
  gradYear: string;
};

export default function OnboardingSetup({
  onNext,
  startYear,
  gradYear,
}: OnboardingSetupProps) {
  const [localStartYear, setLocalStartYear] = useState(startYear);
  const [localGradYear, setLocalGradYear] = useState(gradYear);

  const now = new Date();
  const currentYear = now.getFullYear();
  const gradYearStart = parseInt(localStartYear) || currentYear;

  const startYearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = (currentYear - 5 + i).toString();
    return { label: year, value: year };
  });

  const gradYearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = (gradYearStart + i).toString();
    return { label: year, value: year };
  });

  const handleStartYearChange = (year: string | string[] | null) => {
    if (typeof year === "string") {
      setLocalStartYear(year);

      // Reset graduation year if start year is later than current grad year
      if (parseInt(year) > parseInt(localGradYear)) {
        setLocalGradYear("");
      }
    }
  };

  const handleGradYearChange = (year: string | string[] | null) => {
    if (typeof year === "string") {
      setLocalGradYear(year);
    }
  };

  const handleNextClick = () => {
    if (localStartYear && localGradYear) {
      onNext(localStartYear, localGradYear);
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
                <Flex
                  direction="column"
                  width="100%"
                  align="start"
                  gap="0.25rem"
                >
                  <p>Start Year</p>
                  <Box flexGrow="1" width="100%">
                    <Select
                      options={startYearOptions}
                      value={localStartYear || null}
                      placeholder="Start year"
                      onChange={handleStartYearChange}
                    />
                  </Box>
                </Flex>

                <Flex
                  direction="column"
                  width="100%"
                  align="start"
                  gap="0.25rem"
                >
                  <p>Graduation Year</p>
                  <Box flexGrow="1" width="100%">
                    <Select
                      options={gradYearOptions}
                      value={localGradYear || null}
                      placeholder="Expected graduation year"
                      onChange={handleGradYearChange}
                    />
                  </Box>
                </Flex>
              </Flex>

              <Flex className={styles.filter}></Flex>
            </Flex>

            {/* Next Button */}
            <Button
              className={styles.primary}
              variant="primary"
              onClick={handleNextClick}
            >
              Next
            </Button>

            <DotsIndicator currentPage={0} totalPages={3} />
          </Flex>
        </div>
      </Container>
    </Box>
  );
}
