import React from 'react';
import { ICourse } from "@/lib/api";
import { useCourseSearch } from "@/hooks/useCourseSearch";

import { ClassType } from "../types"
import SearchBar from "./SearchBar";

interface AddClassProps  {
    // name: string;
    // onEdit: () => void;
    // onDelete: (name: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    addClass: (cls: ClassType) => void;
    handleOnConfirm: (cls: ClassType) => void;
};

function AddClass({ isOpen, setIsOpen, addClass, handleOnConfirm }: AddClassProps) {
    // Transform ICourse to ClassType
    const transformCourse = (course: ICourse): ClassType => ({
        id: `${course.subject}_${course.number}`,
        name: `${course.subject} ${course.number}`,
        title: course.title,
        units: 4, // Default units, could be made configurable
    });

    const { 
        filteredCourses: filteredClasses, 
        searchQuery: searchTerm, 
        setSearchQuery: setSearchTerm 
    } = useCourseSearch({
        skip: !isOpen,
        transform: transformCourse,
        useFuzzySearch: false,  // TODO(Daniel): Add fuzzy search
    });

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSelectClass = (cls: ClassType) => {
        addClass(cls);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div>
          <SearchBar 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            filteredClasses={filteredClasses}
            handleSelectClass={handleSelectClass} 
            handleOnConfirm={handleOnConfirm}
          />
        </div>
    )
}

export default AddClass;