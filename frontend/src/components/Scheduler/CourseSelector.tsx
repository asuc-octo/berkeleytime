import React, { FC } from 'react';
import { StylesConfig } from 'react-select';
import Select from 'react-select-virtualized';
import Callout from './Callout';

const customStyles: StylesConfig = {
    clearIndicator: (provided, state) => ({
        ...provided,
        marginRight: 0,
        paddingRight: 0,
    }),
};

const CourseSelector: FC = () => {
    return (
        <div className="course-selector">
            <h2>Build Schedule</h2>
            <Select
                name="selectClass"
                placeholder="Choose a class..."
                options={[]}
                components={{
                    IndicatorSeparator: () => null
                }}
                styles={customStyles}
            />
            <p>Choose the sections to build your schedule.</p>
            <Callout message={<>
                You have <strong>≤20</strong> possible schedules remaining with
                the following course selections.
            </>}/>
        </div>
    );
};

export default CourseSelector;