import React, { useMemo, useState } from 'react';
import SearchBar from "./SearchBar";

import { gql, useQuery } from "@apollo/client";
// import styles from "./AddClass.module.scss"

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
    title: string;
    units: number;
  };

const GET_CLASSES = gql`
  query GetCatalog(
    $year: Int!
    $semester: Semester!
  ) {
    catalog(
      year: $year
      semester: $semester
    ) {
      courseNumber
      title
      unitsMax
      unitsMin
      subject
    }
  }`

interface GetClassesResponse {
  catalog: IGradTrakClass[];
}

interface IGradTrakClass {
  subject: string;
  courseNumber: string;
  title: string | null;
  unitsMax: number;
  unitsMin: number;
}

function AddClass({ isOpen, setIsOpen, addClass, handleOnConfirm }: AddClassProps) {
    const { data, loading, error } = useQuery<GetClassesResponse>(GET_CLASSES, {
      variables: {
        year: 2025,
        semester: "Spring"
      },
    });

    const classes = useMemo(() => {
      if (!data?.catalog) {
        console.log("NO DATA RETRIEVED")
        return []
      };
      return data.catalog.map((cls, index) => ({
        id: index + 1,
        name: `${cls.subject} ${cls.courseNumber}`,
        title: cls.title ?? "",
        units: cls.unitsMin, 
      }));
    }, [data]);
d
    console.log(data);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredClasses, setFilteredClasses] = useState<ClassType[]>([]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        const filtered = classes.filter((cls) =>
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