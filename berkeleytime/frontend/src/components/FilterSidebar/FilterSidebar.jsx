import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {FormGroup,
        ControlLabel,
        FormControl,
        Form,
        HelpBlock,
        ButtonToolbar,
        DropdownButton,
        MenuItem,} from 'react-bootstrap';
import Checkbox from '../../elements/CustomCheckbox/CustomCheckbox';
import Button from '../../elements/CustomButton/CustomButton';
import Tooltip from 'rc-tooltip';
import Slider from 'rc-slider';
import Select from 'react-select';

import 'font-awesome/css/font-awesome.min.css';
import 'rc-slider/assets/index.css';
import 'react-select/dist/react-select.css';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

function CheckboxGroup(props) {
    const { options, requirements, handler } = props;
    return (
        <div className="checkboxGroup">
            {
                options.map((option, i) => {
                    return (<Checkbox key={i} number={option} label={option} onClick={handler} isChecked={ requirements.has(option)} ></Checkbox>)
                })
            }
        </div>
    )
}

function ButtonToggleGroup(props) {
    const { requirements, toggleStatus, handleToggleDiv, handleCheckbox, selectedRequirements } = props;
    return (
        <div className="buttonToggleGroup">

            {
                Object.entries(requirements).map((item, i) => {
                    const name = item[0];
                    const title = item[1].title;
                    const options = item[1].options;
                    return (
                        <div key={i}>
                            <ButtonToolbar>
                                <Button name={'buttonToggle' + name} onClick={handleToggleDiv} bsStyle="link" className="btn-simple btn-block buttonToggleGroup-button">{title} <i className="fa fa-angle-down"></i></Button>
                            </ButtonToolbar>
                            { toggleStatus.has('buttonToggle' + name) &&
                                <CheckboxGroup options={options} requirements={selectedRequirements} handler={handleCheckbox}></CheckboxGroup>
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}

export class FilterSidebar extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleRange = this.handleRange.bind(this);
        this.handleToggleDiv = this.handleToggleDiv.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.handleSortBySelect = this.handleSortBySelect.bind(this);
        this.handleDepartmentSelect = this.handleDepartmentSelect.bind(this);

        this.state = {
            classSearch: '',
            sortBy: 'average-grades',
            units: [1, 4],
            department: 'default',
            toggleStatus: new Set(),
            selectedRequirements: new Set(),
            collapseLogistics: false,
        }
    }

    handleChange(e) {
        console.log(e);
        const name = e.target.name;
        const value = e.target.value;
        this.setState({[name]: value})
    }

    handleRange(range) {
        this.setState({units: range});
    }

    handleToggleDiv(e) {
        var name = e.target.name;
        if(this.state.toggleStatus.has(name)) {
            this.state.toggleStatus.delete(name);
        } else {
            this.state.toggleStatus.add(name);
        }
        this.setState({'toggleStatus': this.state.toggleStatus})
    }

    handleCheckbox(e) {
        var clicked = e.target.id;
        // console.log(this.state.selectedRequirements);
        // console.log(clicked);
        if(this.state.selectedRequirements.has(clicked)) {
            this.state.selectedRequirements.delete(clicked);
        } else {
            this.state.selectedRequirements.add(clicked);
        }
        this.setState({selectedRequirements: this.state.selectedRequirements})
        // console.log(this.state.selectedRequirements);
    }

    handleSortBySelect(updated) {
        this.setState({
            sortBy: updated
        })
    }

    handleDepartmentSelect(updated) {
        this.setState({
            department: updated
        })
    }

    render() {
        const { sortFilters , requirements, logistics, department } = this.props;
        return (
            <div className="card filter-sidebar">
                <div className="header">
                    <h2 className="filter-sidebar-header">Filters</h2>
                </div>
                <div className="content">
                    <Form className="side-filter">
                        <FormGroup controlId="classSearch">
                            <FormControl
                                name="classSearch"
                                type="text"
                                value={this.state.className}
                                placeholder="&#xf002;  Search for a class..."
                                onChange={this.handleChange}
                                className="filter-sidebar-classSearch"
                            />

                            <ControlLabel className="filter-label">Sort By</ControlLabel>
                            <Select
                                name="sortBy"
                                value={this.state.sortBy}
                                onChange={this.handleSortBySelect}
                                options={sortFilters}
                                className="filter-sidebar-sortBy"
                                searchable={false}
                                clearable={false}
                                autoFocus={false}
                                autoSize={true}
                            />

                            <ControlLabel className="filter-label">Requirements</ControlLabel>
                            <ButtonToolbar>
                                <ButtonToggleGroup requirements={requirements} toggleStatus={this.state.toggleStatus} handleToggleDiv={this.handleToggleDiv} handleCheckbox={this.handleCheckbox} selectedRequirements={this.state.selectedRequirements}/>
                            </ButtonToolbar>


                            <ControlLabel className="filter-label">Units</ControlLabel>
                            <HelpBlock className="filter-sidebar-range-helpBlock">1 Units - 4+ Units</HelpBlock>
                            <Range min={1} max={4} value={this.state.units} allowCross={false} onChange={this.handleRange} className="filter-sidebar-range-slider"/>

                            <ControlLabel className="filter-label">Department</ControlLabel>
                            <Select
                                name="department"
                                options={department}
                                value={this.state.department}
                                onChange={this.handleDepartmentSelect}
                                className="filter-sidebar-department"
                                searchable
                                clearable={false}
                            />

                            <ControlLabel className="filter-label">Logistics</ControlLabel>
                            <ButtonToggleGroup requirements={logistics} toggleStatus={this.state.toggleStatus} handleToggleDiv={this.handleToggleDiv} handleCheckbox={this.handleCheckbox} selectedRequirements={this.state.selectedRequirements}/>
                            
                            <div className="button-container">
                                <Button type="reset" className="filter-resetButton">Reset Filters</Button>
                            </div>
                        </FormGroup>
                    </Form>
                </div>
            </div>
        )
    }
}

FilterSidebar.defaultProps = {
    sortFilters: [
                    {value: 'average-grade', label: 'Average Grade'},
                    {value: 'most-favorited', label: 'Most Favorited'},
                    {value: 'department-name', label: 'Department Name'},
                    {value: 'open-seats', label: 'Open Seats'},
                    {value: 'enrolled-percentage', label: 'Enrolled Percentage'}
                 ],
    requirements: {
        university: {
            title: 'University Requirements',
            options: ['R&C A', 'R&C B', 'American Cultures', 'American History', 'American Institutions'],
        },
        ls: {
            title: 'L&S Breadths',
            options: ['Arts and Literature', 'International Studies', 'Historical Studies'],

        },
        engineering: {
            title: 'College of Engineering',
            options: ['Humanities and Social Sciences'],
        },
        haas: {
            title: 'Haas Breadths',
            options: ['Haas Biological Sciences', 'Haas Historical Studies', 'Haas International Studies'],
        }
    } ,
    logistics: {
        classLevel: {
            title: 'Class Level',
            options: ['Lower Division', 'Upper Division', 'Graduate', 'Professional', 'Freshman/Sophomore Seminars', 'Directed Group Study', 'Field Study'],
        },
        semesterOffered: {
            title: 'Semesters Offered',
            options: ['Spring 2018', 'Fall 2017', 'Spring 2017', 'Fall 2016', 'Spring 2016']
        }
    },
    department: [
        {value: 'aerospace-studies', label: 'Aerospace Studies'},
        {value: 'arabic', label: 'Arabic'},
        {value: 'chemistry', label: 'Chemistry'},
        {value: 'chinese', label: 'Chinese'},
        {value: 'dutch', label: 'Dutch'},
        {value: 'education', label: 'Education'},
        {value: 'geography', label: 'Geography'},
        {value: 'global-studies', label: 'Global Studies'},
        {value: 'history', label: 'History'},
        {value: 'japanese', label: 'Japanese'},
        {value: 'mathematics', label: 'Mathematics'}
    ],
}

FilterSidebar.propTypes = {
    sortFilters: PropTypes.array,
    requirements: PropTypes.object,
    logistics: PropTypes.object,
    department: PropTypes.array
}

export default FilterSidebar;