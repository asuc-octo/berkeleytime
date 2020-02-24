import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

export class FilterModal extends Component {
  render() {
    const { requirements, departmentsPlaylist, unitsPlaylist, levelsPlaylist, semestersPlaylist} = this.props.playlists;
    const { activeFilters } = this.props;
    return (
      <div className="filter">
        <div className="filter-modal">
          <div className="filter-name">
            <p>Filters</p>
          </div>
          <ReactMultiSelectCheckboxes options={requirements} placeholderButtonLabel={"University Requirements"}/>
          <ReactMultiSelectCheckboxes options={departmentsPlaylist} placeholderButtonLabel={"Departments"}/>
          <ReactMultiSelectCheckboxes options={unitsPlaylist} placeholderButtonLabel={"Units"}/>
          <ReactMultiSelectCheckboxes options={levelsPlaylist} placeholderButtonLabel={"Levels"}/>
          <ReactMultiSelectCheckboxes options={semestersPlaylist} placeholderButtonLabel={"Semesters"}/>
        </div>
      </div>
    );
  }
}

export default FilterModal;