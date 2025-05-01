import * as Dialog from '@radix-ui/react-dialog';
import React, { useState } from 'react';
import { Button } from "@radix-ui/themes";

import CustomClass from '../../CustomClass';

import styles from '../AddClass.module.scss'

interface SearchBarProps  {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    searchTerm: string;
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    filteredClasses: ClassType[];
    handleSelectClass: (cls: ClassType) => void;
    handleOnConfirm: (cls: ClassType) => void;

};

type ClassType = {
    id: number;
    name: string;
    title: string;
    units: number;
  };

function SearchBar({isOpen, setIsOpen, searchTerm, handleSearch, filteredClasses, handleSelectClass, handleOnConfirm}: SearchBarProps) {
    const [isCustomClassOpen, setIsCustomClassOpen] = useState(false);

    console.log("Filtered classes:", filteredClasses);

    const openCustomClass = () => setIsCustomClassOpen(true);
    const closeCustomClass = () => {
      setIsOpen(false)  
      setIsCustomClassOpen(false)
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Content>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Type a class ID / name..."
                    />
                </div>
                
                {/* Dropdown for suggestions */}
                <div className={styles.suggestionPopover}>
                {(
                    <ul className={`${styles.list} ${filteredClasses.length > 0 ? styles.hasItems : ''}`}>
                    {filteredClasses.map((cls) => (
                        <li
                        key={cls.id}
                        onClick={() => handleSelectClass(cls)}
                        className={styles.item}
                        >
                        {cls.name} - {cls.units} units
                        </li>
                    ))}
                    </ul>
                )}
                    <div className={styles.footer}>
                        <Button className={styles.createCustomClassButton} onClick={openCustomClass}>
                            + Create custom class
                        </Button>
                    </div>
                </div>
            </Dialog.Content>
                {/* <ClassDetails
                    isCreateCustomClass={true}
                    isOpen={isCustomClassOpen}
                    setIsOpen={setIsEditClassOpen}
                    classData={classToEdit}
                    onUpdate={handleUpdateClass}
                /> */}
                {/* <CustomClass 
                    open={isCustomClassOpen} 
                    onClose={closeCustomClass} 
                    onConfirm={handleOnConfirm}>
                </CustomClass> */}
            </Dialog.Root>
    )
}

export default SearchBar;