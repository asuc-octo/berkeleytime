import React, { PureComponent } from 'react';
import Select from 'react-select';

class Property extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { attribute, value, options } = this.props;

    const style = {
      control: (base) => ({
        ...base,
        border: 0,
        boxShadow: 'none',
      }),
    };

    let body;
    switch (attribute) {
      case 'Major(s)':
        body = (
          <div className="major-select">
            <Select
              options={options}
              name="major-selector"
              isSearchable={true}
              isClearable={false}
              onChange={this.props.updateMajor}
              placeholder="Select major..."
              value={
                this.props.major
                  ? { label: this.props.major, value: this.props.major }
                  : null
              }
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={style}
            />
          </div>
        );
        break;
      case 'Full Name':
        body = (
          <div className="personal-value">
            <p>{value}</p>
            {/* <button className="personal-edit">edit</button> */}
          </div>
        );
        break;
      default:
        body = (
          <div className="personal-value">
            <p>{value}</p>
          </div>
        );
    }

    return (
      <div className="profile-row">
        <p className="personal-attribute">{attribute}</p>
        {body}
      </div>
    );
  }
}

export default Property;
