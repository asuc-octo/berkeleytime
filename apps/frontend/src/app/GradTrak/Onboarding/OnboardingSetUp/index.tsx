import React from 'react';
import "./OnboardingSetUp.scss";
import { Flex, Text, Checkbox } from "@radix-ui/themes";
import DotsIndicator from '../DotsIndicator';
import YearDropdown from '../YearDropdown';

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

  const handleSelectYear = (id: string, year: string) => {
    if (id === 'startYear') setLocalStartYear(year);
    else if (id === 'gradYear') setLocalGradYear(year);
  };

  const handleNextClick = () => {
    onNext(localStartYear, localGradYear, localSummerCheck);
  };

  const handleSummerCheck = (checked: boolean) => {
    setLocalSummerCheck(checked);
  };

  return (
    <Flex className="setup-container" direction="column" gap="32px" width="100%" align="center">
      <Flex direction="column" gap="8px" width="100%" align="center">
        <Text className="setup">Set Up</Text>
        <Text className="enteryear">Enter your start year and graduation year</Text>
      </Flex>

      <Flex className="yearContainer" direction="row" gap="16px" align="center">
        <Flex direction="column" width="50%">
          <Text>Start Year</Text>
          <YearDropdown id="startYear" onSelectYear={handleSelectYear} />
        </Flex>

        <Flex direction="column" width="50%">
          <Text>Graduation Year</Text>
          <YearDropdown id="gradYear" onSelectYear={handleSelectYear} />
        </Flex>
      </Flex>

      <Text as="label" size="2" className='summer-sem-check'>
        <Flex gap="2">
          <Checkbox
            defaultChecked
            checked={localSummerCheck}
            onCheckedChange={handleSummerCheck}
          />
          Include Summer Semesters?
        </Flex>
      </Text>

      <button className="primary" onClick={handleNextClick}>Next</button>
      <DotsIndicator currentPage={0} totalPages={3} />
    </Flex>
  );
}