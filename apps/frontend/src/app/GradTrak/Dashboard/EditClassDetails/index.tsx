import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
    Xmark,
    Calendar,
    Check
} from 'iconoir-react'
import './EditClassDetails.scss';

type ClassType = {
    id: number;
    name: string;
    units: number;
};

interface EditClassDetailsProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    classData: ClassType;
    onUpdate: (updatedClass: ClassType) => void;
}

const EditClassDetails = ({ isOpen, setIsOpen, classData, onUpdate }: EditClassDetailsProps) => {
    const [className, setClassName] = useState(classData.name);
    const [description, setDescription] = useState("Multivariable Calculus");
    const [units, setUnits] = useState(classData.units);
    const [semester, setSemester] = useState("Fall 2021");
    const [grading, setGrading] = useState("Graded");
    const [credit, setCredit] = useState("UC Berkeley");
    const [requirements, setRequirements] = useState<string[]>([]);

    // Update state when classData changes
    useEffect(() => {
        if (classData) {
            setClassName(classData.name);
            setUnits(classData.units);
        }
    }, [classData]);

    const handleSubmit = () => {
        const updatedClass = {
            ...classData,
            name: className,
            units: units,
        };
        onUpdate(updatedClass);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="edit-dialog-content">
                    <div className="edit-dialog-header">
                        <Dialog.Title className="edit-dialog-title">Edit Course Details</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="close-button" aria-label="Close">
                                <Xmark />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="edit-dialog-body">
                        <section className="section">
                            <h3 className="section-title">INFO</h3>
                            <div className="field-container">
                                <div className="icon-container">
                                    <span className="field-icon">📋</span>
                                </div>
                                <input
                                    type="text"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="field-input"
                                />
                            </div>
                            <div className="field-container">
                                <div className="icon-container">
                                    <span className="field-icon">📄</span>
                                </div>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="field-input"
                                />
                            </div>
                        </section>

                        <section className="section">
                            <h3 className="section-title">UNITS</h3>
                            <div className="units-container">
                                <span className="units-hash">#</span>
                                <input
                                    type="number"
                                    value={units}
                                    onChange={(e) => setUnits(Number(e.target.value))}
                                    min="1"
                                    max="12"
                                    className="units-input"
                                />
                            </div>
                        </section>

                        <section className="section">
                            <h3 className="section-title">SEMESTER</h3>
                            <div className="field-container">
                                <div className="icon-container">
                                    <Calendar className="field-icon" />
                                </div>
                                <input
                                    type="text"
                                    value={semester}
                                    readOnly
                                    className="field-input"
                                />
                            </div>
                        </section>

                        <section className="section">
                            <h3 className="section-title">GRADING</h3>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="grading"
                                        checked={grading === "Graded"}
                                        onChange={() => setGrading("Graded")}
                                        className="radio-input"
                                    />
                                    <div className="radio-circle">
                                        {grading === "Graded" && <div className="radio-dot"></div>}
                                    </div>
                                    <span className="radio-label">Graded</span>
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="grading"
                                        checked={grading === "P/NP"}
                                        onChange={() => setGrading("P/NP")}
                                        className="radio-input"
                                    />
                                    <div className="radio-circle">
                                        {grading === "P/NP" && <div className="radio-dot"></div>}
                                    </div>
                                    <span className="radio-label">P/NP</span>
                                </label>
                            </div>
                        </section>

                        <section className="section">
                            <h3 className="section-title">CREDIT</h3>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="credit"
                                        checked={credit === "UC Berkeley"}
                                        onChange={() => setCredit("UC Berkeley")}
                                        className="radio-input"
                                    />
                                    <div className="radio-circle">
                                        {credit === "UC Berkeley" && <div className="radio-dot"></div>}
                                    </div>
                                    <span className="radio-label">UC Berkeley</span>
                                </label>
                                <label className="radio-option">
                                    <input
                                        type="radio"
                                        name="credit"
                                        checked={credit === "Transfer"}
                                        onChange={() => setCredit("Transfer")}
                                        className="radio-input"
                                    />
                                    <div className="radio-circle">
                                        {credit === "Transfer" && <div className="radio-dot"></div>}
                                    </div>
                                    <span className="radio-label">Transfer</span>
                                </label>
                            </div>
                        </section>

                        <section className="section">
                            <h3 className="section-title">REQUIREMENTS FULFILLED</h3>
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search for a requirement..."
                                    className="search-input"
                                />
                            </div>
                        </section>
                    </div>

                    <button className="confirm-button" onClick={handleSubmit}>
                        Confirm
                    </button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default EditClassDetails;