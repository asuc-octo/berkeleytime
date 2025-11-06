import React, { useState } from "react";

import { ILabel, ISelectedCourse } from "@/lib/api";
import { FuzzySearch } from "@/utils/fuzzy-find";

import { SelectedCourse } from "../../index";
import SearchBar from "./SearchBar";

interface AddClassProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addClass: (cls: SelectedCourse) => void;
  handleOnConfirm: (cls: ISelectedCourse) => void;
  labels: ILabel[];
  setShowLabelMenu: (v: boolean) => void;
  index: FuzzySearch<{
    title: string;
    name: string;
    alternateNames: string[];
  }> | null;
  catalogCourses: SelectedCourse[];
}

function AddClass({
  isOpen,
  setIsOpen,
  addClass,
  handleOnConfirm,
  labels,
  setShowLabelMenu,
  index,
  catalogCourses,
}: AddClassProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState<SelectedCourse[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filtered =
      term && index
        ? index
            .search(term.slice(0, 24))
            .map(({ refIndex }) => catalogCourses[refIndex])
        : [];

    setFilteredClasses(filtered);
  };

  const handleSelectClass = (cls: SelectedCourse) => {
    addClass(cls);
    setFilteredClasses([]);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <SearchBar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        filteredClasses={filteredClasses}
        handleSelectClass={handleSelectClass}
        handleOnConfirm={handleOnConfirm}
        labels={labels}
        setShowLabelMenu={setShowLabelMenu}
      />
    </div>
  );
}

export default AddClass;
