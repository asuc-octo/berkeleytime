import React, { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Button, VisuallyHidden } from "@radix-ui/themes";

import { ILabel, ISelectedCourse } from "@/lib/api";

import { SelectedCourse } from "../../../index";
import ClassDetails from "../../ClassDetails";
import styles from "../AddClass.module.scss";

interface SearchBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  searchTerm: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredClasses: SelectedCourse[];
  handleSelectClass: (cls: SelectedCourse) => void;
  handleOnConfirm: (cls: ISelectedCourse) => void;
  labels: ILabel[];
  setShowLabelMenu: (v: boolean) => void;
}

function SearchBar({
  isOpen,
  setIsOpen,
  searchTerm,
  handleSearch,
  filteredClasses,
  handleSelectClass,
  handleOnConfirm,
  labels,
  setShowLabelMenu,
}: SearchBarProps) {
  const [isCustomClassOpen, setIsCustomClassOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className={styles.content}>
        <VisuallyHidden>
          <Dialog.Title>Add Class</Dialog.Title>
        </VisuallyHidden>
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Type a class ID / name..."
          />
        </div>

        {searchTerm.trim().length > 0 && (
          <div className={styles.suggestionPopover}>
            {
              <ul
                className={`${styles.list} ${filteredClasses.length > 0 ? styles.hasItems : ""}`}
              >
                {filteredClasses.map((cls) => (
                  <li
                    key={cls.courseID}
                    onClick={() => handleSelectClass(cls)}
                    className={styles.item}
                  >
                    {cls.courseName}
                    {cls.courseUnits > 0 ? ` - ${cls.courseUnits} units` : ""}
                  </li>
                ))}
              </ul>
            }
            <div className={styles.footer}>
              <Button
                className={styles.createCustomClassButton}
                onClick={() => setIsCustomClassOpen(true)}
              >
                + Create custom class
              </Button>
            </div>
          </div>
        )}
      </Dialog.Content>

      <ClassDetails
        isOpen={isCustomClassOpen}
        setIsOpen={setIsCustomClassOpen}
        onConfirm={handleOnConfirm}
        allLabels={labels}
        setShowLabelMenu={setShowLabelMenu}
      />
    </Dialog.Root>
  );
}

export default SearchBar;
