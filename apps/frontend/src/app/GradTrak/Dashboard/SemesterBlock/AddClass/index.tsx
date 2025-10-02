import React, { useState } from "react";

import { ISelectedCourse } from "@/lib/api";
import Fuse from "fuse.js";

import SearchBar from "./SearchBar";
import { SelectedCourse } from "../../index";

interface AddClassProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addClass: (cls: SelectedCourse) => void;
  handleOnConfirm: (cls: ISelectedCourse) => void;
  index: Fuse<{ title: string; name: string; alternateNames: string[] }> | null;
  catalogCourses: SelectedCourse[];
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
  const [filteredClasses, setFilteredClasses] = useState<SelectedCourse[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filtered = term && index
      ? index.search(term.slice(0, 24)).map(({ refIndex }) => catalogCourses[refIndex])
      : catalogCourses;

    setFilteredClasses(filtered);
  };

  const handleSelectClass = (cls: SelectedCourse) => {
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
