import * as Dialog from '@radix-ui/react-dialog';
import React, { useState } from 'react';
import { Button } from "@radix-ui/themes";
import CustomClass from '../../CustomClass';
import '../AddClass.scss'

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
    units: number;
  };

function SearchBar({isOpen, setIsOpen, searchTerm, handleSearch, filteredClasses, handleSelectClass, handleOnConfirm}: SearchBarProps) {
    const [isCustomClassOpen, setIsCustomClassOpen] = useState(false);

    const openCustomClass = () => setIsCustomClassOpen(true);
    const closeCustomClass = () => {
      setIsOpen(false)  
      setIsCustomClassOpen(false)
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                        <Dialog.Content className="searchContent">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Type a class ID / name..."
                                className="searchBar"
                            />
                            
                            {/* Dropdown for suggestions */}
                            {(
                                <ul className="suggestion-list">
                                {filteredClasses.map((cls) => (
                                    <li
                                    key={cls.id}
                                    onClick={() => handleSelectClass(cls)}
                                    className="suggestion-item"
                                    >
                                    {cls.name} - {cls.units} units
                                    </li>
                                ))}
                                <li key="default" className='suggestion-item'>
                                    <Button className='add-custom-btn' onClick={openCustomClass}>
                                        + Add Custom Class
                                    </Button>
                                </li>
                                </ul>
                            )}
                        </Dialog.Content>
                        <CustomClass 
                            open={isCustomClassOpen} 
                            onClose={closeCustomClass} 
                            onConfirm={handleOnConfirm}>
                        </CustomClass>
            </Dialog.Root>
    )
}

export default SearchBar;