import React, { useState } from "react";

import { ISelectedCourse } from "@/lib/api";
import Fuse from "fuse.js";

import SearchBar from "./SearchBar";

interface AddClassProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addClass: (cls: ISelectedCourse) => void;
  handleOnConfirm: (cls: ISelectedCourse) => void;
  index: Fuse<{ title: string; name: string; alternateNames: string[] }> | null;
  catalogCourses: ISelectedCourse[];
}

function AddClass({
  isOpen,
  setIsOpen,
  addClass,
  handleOnConfirm,
  index,
  catalogCourses,
}: AddClassProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<ISelectedCourse[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filtered = term && index
      ? index.search(term.slice(0, 24)).map(({ refIndex }) => catalogCourses[refIndex])
      : catalogCourses;

    setFilteredClasses(filtered);
  };

  const handleSelectClass = (cls: ISelectedCourse) => {
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
