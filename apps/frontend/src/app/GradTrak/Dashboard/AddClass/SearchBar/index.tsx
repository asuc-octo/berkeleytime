import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';
import { Button } from "@radix-ui/themes";

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
    id: string;
    name: string;
    title: string;
    units: number;
};  

function SearchBar({isOpen, setIsOpen, searchTerm, handleSearch, filteredClasses, handleSelectClass, handleOnConfirm}: SearchBarProps) {
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
                        onClick={() => handleSelectClass(cls)}
                        className={styles.item}
                        >
                            {cls.name} - {cls.units} units
                        </li>
                    ))}
                    </ul>
                )}
                    <div className={styles.footer}>
                        <Button className={styles.createCustomClassButton}>
                            + Create custom class
                        </Button>
                    </div>
                </div>
            </Dialog.Content>
            
            {/* <CustomClass 
                open={isCustomClassOpen} 
                onClose={closeCustomClass} 
                onConfirm={handleOnConfirm}>
            </CustomClass> */}
            </Dialog.Root>
    )
}

export default SearchBar;