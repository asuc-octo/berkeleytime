import { useState } from 'react';
import {useLocation} from 'react-router-dom';
import Select from 'react-select'
import { Separator, Flex } from "@radix-ui/themes";
import MAJORS from './majors.json';
import "./AddDegree.scss";
import DotsIndicator from '../DotsIndicator';

type DegreeOption = {
    label: string;
    value: string;
};

type AddDegreeProps = {
    isMajor: boolean;
    onNext: (selected: DegreeOption[]) => void;
    selectedList: DegreeOption[];
  };

export default function AddDegree({ isMajor }: AddDegreeProps) {
    const location = useLocation();
    const { startYear, gradYear, summerCheck } = location.state || {};
    const optionType = isMajor ? "Major" : "Minor";
    const [selectedDegree, setSelectedDegree] = useState<DegreeOption | null>(null);
    const [selectedDegreeList, setSelectedDegreeList] = useState<DegreeOption[]>([]);
    const [selectedMinorList, setSelectedMinorList] = useState<DegreeOption[]>([]);

    // Hardcoded majors for now
	const degreeOptions = MAJORS.map((degree) => ({
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
      

    const DegreeSelect = () => (
        <Select 
            className="degree-select" 
            options={degreeOptions} 
            isSearchable={true} 
            isClearable={true}
            placeholder={`Search for a ${optionType.toLowerCase()}...`}
            value={selectedDegree}
            onChange={(option) => setSelectedDegree(option as DegreeOption | null)} 
        />
      )

    return (
        <div>
            <Flex className="degree-container">
                <Flex className="header-container" align="center">
                    <h1>Add {optionType}s</h1>
                    <p className="secondary-text">
                        Search for your {optionType.toLowerCase()} and add it to Gradtrak to list specific requirements.
                    </p>
                </Flex>
                <Flex direction="column" align="start" gap="16px" width="100%">
                    <DegreeSelect/>
                    <a>Don't see your {optionType.toLowerCase()}?</a>
                    {isMajor && 
                    <button className="secondary" onClick={handleAddDegree}>Add</button>}
                    {!isMajor && 
                    <button className="secondary" onClick={handleAddMinor}>Add</button>}
                </Flex>
                <Separator size="4"/>
                <Flex direction="column" align="start" gap="16px"  width="100%">
                    <h2>Selected {optionType}s</h2>
                    {(selectedDegreeList.length === 0 && isMajor) || (selectedMinorList.length === 0 && !isMajor) ? (
                        <p className="secondary-text">None Selected</p>
                    ) : (
                        <div className="selected-degree-list" id={`${optionType.toLowerCase()}s-list`}>
                            {isMajor && selectedDegreeList.map((degree) => (
                                <div key={degree.value} className="degree-chip">
                                    {degree.label}
                                    <span className="delete-icon" onClick={() => handleRemoveDegree(degree)}>✕</span>
                                </div>
                            ))}
                            {!isMajor && selectedMinorList.map((degree) => (
                                <div key={degree.value} className="degree-chip">
                                    {degree.label}
                                    <span className="delete-icon" onClick={() => handleRemoveMinor(degree)}>✕</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Flex>
                <Flex gap="10px" width="100%">
                    <button className="secondary">Skip</button>
                    <button className="primary"  onClick={handleConfirmClick}>Confirm</button>
                </Flex>
                {isMajor && <DotsIndicator currentPage={1} totalPages={3} />}
                {!isMajor && <DotsIndicator currentPage={2} totalPages={3} />}
            </Flex>
        </div>
    );
}