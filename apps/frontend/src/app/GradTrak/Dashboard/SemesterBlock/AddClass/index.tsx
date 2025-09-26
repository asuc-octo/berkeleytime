import React, { useState, useMemo } from 'react';
import { GET_COURSE_NAMES, GetCoursesResponse } from "@/lib/api";
import { useQuery } from '@apollo/client';

import { ISelectedCourse } from '@/lib/api';
import SearchBar from "./SearchBar";

interface AddClassProps  {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    addClass: (cls: ISelectedCourse) => void;
    handleOnConfirm: (cls: ISelectedCourse) => void;
};

function AddClass({ isOpen, setIsOpen, addClass, handleOnConfirm }: AddClassProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredClasses, setFilteredClasses] = useState<ISelectedCourse[]>([]);
    const [allClasses, setAllClasses] = useState<ISelectedCourse[]>([]);
 
    const { data } = useQuery<GetCoursesResponse>(GET_COURSE_NAMES, {skip: !isOpen});

    const courses = useMemo(() => {
      if (!data?.courses) return [];
      return data.courses;
    }, [data]);

    useMemo(() => {
        console.log('Courses count:', courses?.length);
        if (data?.courses) {
            const formattedClasses = data.courses.map(course => ({
                courseID: `${course.subject}_${course.number}`,
                courseName: `${course.subject} ${course.number}`,
                courseTitle: course.title,
                courseUnits: 4,  // TODO(Daniel): Fetch units (Look in ICourse)
                uniReqs: [],  // TODO(Daniel): Fetch reqs
                collegeReqs: [],  // TODO(Daniel): Fetch reqs
                pnp: false,
                transfer: false,
                labels: []
            }));
            setAllClasses(formattedClasses);
        }
    }, [data]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value;
      setSearchTerm(term);
      const filtered = allClasses.filter((cls) =>
          cls.courseName.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredClasses(filtered);
    };

    const handleSelectClass = (cls: ISelectedCourse) => {
      addClass(cls);
      setFilteredClasses([]);
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