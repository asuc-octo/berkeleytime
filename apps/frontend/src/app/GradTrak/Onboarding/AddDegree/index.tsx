import { useState } from 'react';

import { Separator } from "@radix-ui/themes";
import { 
    Flex, 
    Select,
    Box,
    Container,
    Button
 } from "@repo/theme"

import DEGREES from './degree-programs-types.json'
import DotsIndicator from '../DotsIndicator';

import styles from "./AddDegree.module.scss"

type DegreeOption = {
    label: string;
    value: string;
};

type AddDegreeProps = {
    isMajor: boolean;
    onNext: (selected: DegreeOption[]) => void;
  };

export default function AddDegree({
    isMajor,
    onNext,
}: AddDegreeProps) {
    const optionType = isMajor ? "Major" : "Minor";
    const [selectedDegree, setSelectedDegree] = useState<DegreeOption | null>(null);
    const [selectedDegreeList, setSelectedDegreeList] = useState<DegreeOption[]>([]);
    const [selectedMinorList, setSelectedMinorList] = useState<DegreeOption[]>([]);

	const majorOptions = DEGREES.majors.map((degree) => ({
		label: degree,
		value: degree
	}));

	const minorOptions = DEGREES.minors.map((degree) => ({
		label: degree,
		value: degree
	}));
    
    const handleAddDegree = () => {
        if (selectedDegree && !selectedDegreeList.some((degree) => degree.value === selectedDegree.value)) {
            setSelectedDegreeList([...selectedDegreeList, selectedDegree]);
            setSelectedDegree(null);
        }
    };

    const handleAddMinor = () => {
        if (selectedDegree && !selectedMinorList.some((degree) => degree.value === selectedDegree.value)) {
            setSelectedMinorList([...selectedMinorList, selectedDegree]);
            setSelectedDegree(null);
        }
    };
    
    const handleRemoveDegree = (degreeToRemove: DegreeOption) => {
        setSelectedDegreeList(selectedDegreeList.filter((degree) => degree.value !== degreeToRemove.value));
    };

    const handleRemoveMinor = (degreeToRemove: DegreeOption) => {
        setSelectedMinorList(selectedMinorList.filter((degree) => degree.value !== degreeToRemove.value));
    };

    const handleConfirmClick = () => {
        onNext(isMajor ? selectedDegreeList : selectedMinorList);
      };

    const handleSkipClick = () => {
        onNext(isMajor ? selectedDegreeList : selectedMinorList);
    };
      

    const DegreeSelect = () => (
        <Select 
            className={styles.degreeSelect}
            options={isMajor ? majorOptions : minorOptions} 
            isSearchable={true} 
            isClearable={true}
            placeholder={`Search for a ${optionType.toLowerCase()}...`}
            value={selectedDegree}
            onChange={(option) => setSelectedDegree(option as DegreeOption | null)} 
        />
      )

    return (
        <Box p="5">
        <Container style={{ marginTop: "0px" }}>
        <div className={styles.hero}>
            <Flex direction="column" gap="2rem">
                
                <Flex direction="column" align="center" gap="16px">
                    <h1>Add {optionType}s</h1>
                    <p>Search for your {optionType.toLowerCase()} and add it to Gradtrak to list specific requirements.</p>
                </Flex>

                <Flex direction="column" align="start" gap="16px" width="100%">
                    <DegreeSelect/>
                    <a>Don't see your {optionType.toLowerCase()}?</a>
                    {isMajor && 
                    <Button className={styles.addButton} variant="outline" onClick={handleAddDegree}>Add</Button>}
                    {!isMajor && 
                    <Button className={styles.addButton} variant="outline"  onClick={handleAddMinor}>Add</Button>}
                </Flex>

                <Separator size="4"/>

                <Flex direction="column" align="start" gap="16px"  width="100%">
                    <h2>Selected {optionType}s</h2>
                    {(selectedDegreeList.length === 0 && isMajor) || (selectedMinorList.length === 0 && !isMajor) ? (
                        <p>None Selected</p>
                    ) : (
                        <div className={styles.selectedDegreeList} id={`${optionType.toLowerCase()}s-list`}>
                            {isMajor && selectedDegreeList.map((degree) => (
                                <div key={degree.value} className={styles.degreeChip}>
                                    {degree.label}
                                    <span className={styles.deleteIcon} onClick={() => handleRemoveDegree(degree)}>✕</span>
                                </div>
                            ))}
                            {!isMajor && selectedMinorList.map((degree) => (
                                <div key={degree.value} className={styles.degreeChip}>
                                    {degree.label}
                                    <span className={styles.deleteIcon} onClick={() => handleRemoveMinor(degree)}>✕</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Flex>

                <Flex gap="10px">
                    <Button 
                        className={styles.secondary} 
                        variant="outline"
                        onclick={handleSkipClick}
                    >
                        Skip
                    </Button>
                    <Button
                        className={styles.primary}
                        variant="solid"
                        onClick={handleConfirmClick}
                        disabled={(isMajor && selectedDegreeList.length === 0) || (!isMajor && selectedMinorList.length === 0)}
                    >
                        Confirm
                    </Button>
                </Flex>

                {isMajor && <DotsIndicator currentPage={1} totalPages={3} />}
                {!isMajor && <DotsIndicator currentPage={2} totalPages={3} />}
            
            </Flex>
        </div>
        </Container>
        </Box>
    );
}