import React, { useState } from 'react';
import SearchBar from "./SearchBar";
import "./AddClass.scss"

// Stub for now.
// TODO: Replace with actual code.
const classesData = [
    { "id": 1, "name": "COLWRIT R4B", "units": 4 },
    { "id": 2, "name": "HISTORY 7A", "units": 4 },
    { "id": 3, "name": "CS 61A", "units": 4 },
    { "id": 4, "name": "MATH 51", "units": 4 },
    { "id": 5, "name": "MATH 53", "units": 4 },
    { "id": 6, "name": "MATH 54", "units": 4 },
    { "id": 7, "name": "MATH 1A", "units": 4 }
  ]

interface AddClassProps  {
    // name: string;
    // onEdit: () => void;
    // onDelete: (name: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    addClass: (cls: ClassType) => void;
    handleOnConfirm: (cls: ClassType) => void;
};

type ClassType = {
    id: number;
    name: string;
    units: number;
  };
  

function AddClass({ isOpen, setIsOpen, addClass, handleOnConfirm }: AddClassProps) {

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredClasses, setFilteredClasses] = useState<ClassType[]>([]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        const filtered = classesData.filter((cls) =>
          cls.name.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredClasses(filtered);
      };

      const handleSelectClass = (cls: ClassType) => {
        addClass(cls); // Update parent state
        setFilteredClasses([]); // Hide suggestions
        setSearchTerm(''); // Clear search field
        setIsOpen(false); // Close dialog after selection
      };

    return (
        <div>
            <SearchBar isOpen={isOpen} setIsOpen={setIsOpen} searchTerm={searchTerm} 
            handleSearch={handleSearch} filteredClasses={filteredClasses}
            handleSelectClass={handleSelectClass} handleOnConfirm={handleOnConfirm}></SearchBar>
        </div>
    )
}

export default AddClass;