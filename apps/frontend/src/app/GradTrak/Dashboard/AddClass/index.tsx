import React, { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";

import { GET_COURSE_NAMES, GetCoursesResponse } from "@/lib/api";

import { ClassType } from "../types";
import SearchBar from "./SearchBar";

interface AddClassProps {
  // name: string;
  // onEdit: () => void;
  // onDelete: (name: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addClass: (cls: ClassType) => void;
  handleOnConfirm: (cls: ClassType) => void;
}

function AddClass({
  isOpen,
  setIsOpen,
  addClass,
  handleOnConfirm,
}: AddClassProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<ClassType[]>([]);
  const [allClasses, setAllClasses] = useState<ClassType[]>([]);

  const { data } = useQuery<GetCoursesResponse>(GET_COURSE_NAMES, {
    skip: !isOpen,
  });

  const courses = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses;
  }, [data]);

  useMemo(() => {
    console.log("Courses count:", courses?.length);
    if (data?.courses) {
      const formattedClasses = data.courses.map((course) => ({
        id: `${course.subject}_${course.number}`,
        name: `${course.subject} ${course.number}`,
        title: course.title,
        units: 4,
        grading: "Graded",
        credit: "UC Berkeley",
      }));
      setAllClasses(formattedClasses);
    }
  }, [data]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    const filtered = allClasses.filter((cls) =>
      cls.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  const handleSelectClass = (cls: ClassType) => {
    addClass(cls);
    setFilteredClasses([]);
    setSearchTerm("");
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
  );
}

export default AddClass;
