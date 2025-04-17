
import "./CustomClass.scss";
import { useState } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Separator } from "@radix-ui/themes";
import { 
    Xmark,
    Barcode,
    MultiplePages,
    Hashtag,
    Calendar // I am confused why this is used.
 } from 'iconoir-react';
import Select from 'react-select'

type CustomClassProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: (cls: { id: number; name: string; units: number }) => void;
  };

// TODO: Make sure UI aligns with the design.
function CustomClass({open, onClose, onConfirm}: CustomClassProps) {
    const [classId, setClassId] = useState('');
    const [className, setClassName] = useState('');
    const [classUnits, setClassUnits] = useState('')

    const handleConfirm = () => {
        if (className && Number(classUnits) > 0) {
          onConfirm({ id: Number(classId), name: className, units: Number(classUnits) });
          setClassId('');
          setClassName('');
          setClassUnits('');
          onClose(); // Close the dialog
        }
      };

      const RequirementSelect = () => (
        <Select 
            className="requirement-select" 
            options={["check1", "check2"]} 
            isSearchable={true} 
            isClearable={true}
            placeholder={`Select requirement...`}
            value={'Select requirement...'}
        />
      )

    return (
        <>
            <Dialog.Root open={open} onOpenChange={onClose}>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                    <Dialog.Title className="dialog-title">Add Custom Class<Xmark onClick={onClose}/></Dialog.Title>
                    <div className="sections">
                        <p className="info">Info</p>
                        <div className="s1">
                            <Barcode className="dialog-icon"/>
                            <input type="text" placeholder='Add Class ID' value={classId} onChange={(e) => setClassId((e.target.value))} />
                        </div>
                        <div className="s1">
                            <MultiplePages className="dialog-icon"/>
                            <input placeholder="Add Class Title" type="text" value={className} onChange={(e) => setClassName(e.target.value)}/>
                        </div>
                    </div>
                    {/* <div className="divider-line" /> */}
                    <Separator size="4" className="separate"/>

                    <div className="sections">
                        <p className="info">Units</p>
                        <div className="s1">
                            <Hashtag className="dialog-icon"/>
                            <input placeholder="Units" type="text" value={classUnits} onChange={(e) => setClassUnits((e.target.value))}/>
                        </div>
                    </div>
                    <Separator size="4" className="separate"/>

                    <div className="sections">
                        <p className="info">Semester</p>
                        <div className="s1">
                            <Calendar className="dialog-icon"/>
                            <input placeholder="Search for a semester..."/>
                        </div>
                    </div>
                    <Separator size="4" className="separate"/>

                    <div className="sections">
                        <p className="info">Grading</p>
                        <RadioGroup.Root
                            className="RadioGroupRoot"
                            defaultValue="default"
                            aria-label="View density"
		                >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <RadioGroup.Item className="RadioGroupItem" value="default" id="r1">
                                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                                </RadioGroup.Item>
                                <label className="Label" htmlFor="r1">
                                    Graded
                                </label>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <RadioGroup.Item className="RadioGroupItem" value="comfortable" id="r2">
                                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                                </RadioGroup.Item>
                                <label className="Label" htmlFor="r2">
                                    P/NP
                                </label>
                            </div>
                        </RadioGroup.Root>
                    </div>
                    <Separator size="4" className="separate"/>

                    <div className="sections">
                        <p className="info">Credit</p>
                        <RadioGroup.Root
                            className="RadioGroupRoot"
                            defaultValue="default"
                            aria-label="View density"
		                >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <RadioGroup.Item className="RadioGroupItem" value="default" id="r1">
                                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                                </RadioGroup.Item>
                                <label className="Label" htmlFor="r1">
                                    UC Berkeley
                                </label>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <RadioGroup.Item className="RadioGroupItem" value="comfortable" id="r2">
                                    <RadioGroup.Indicator className="RadioGroupIndicator" />
                                </RadioGroup.Item>
                                <label className="Label" htmlFor="r2">
                                    Transfer
                                </label>
                            </div>
                        </RadioGroup.Root>
                    </div>
                    <Separator size="4" className="separate"/>

                    <div className="sections">
                        <p className="info">REQUIREMENTS FULFILLED</p>
                        <RequirementSelect />
                        {/* Stubbing out for now <RequirementDropdown></RequirementDropdown> */}
                    </div>
                    <Separator size="4" className="separate"/>  

                    <Dialog.Close asChild>
                        <button className="primary custom-class" onClick={handleConfirm}>Confirm</button>
                    </Dialog.Close>

                </Dialog.Content>
            </Dialog.Root>
        </>
    )
}

export default CustomClass;