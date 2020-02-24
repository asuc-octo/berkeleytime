import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

export class FilterModal extends Component {
  render() {
    const { requirements } = this.props.playlists;
    const { activeFilters } = this.props;
    return (
      <div className="filter">
        <a>Filters</a>
        <div className="filter-modal">
          <div className="filter-name">
            <p>Filters</p>
          </div>
          <ReactMultiSelectCheckboxes options={requirements} placeholderButtonLabel={"University Requirements"}
          getDropdownButtonLabel={"University Requirements"}/>
        </div>
      </div>
    );
  }
}

export default FilterModal;