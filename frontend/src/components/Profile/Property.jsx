import React, { PureComponent } from 'react';
import Select from 'react-select';

class Property extends PureComponent {

  constructor(props){
    super(props);

    this.state = {
      major: this.props.options[0],
    }
  }

  majorHandler = (major) => {
    this.setState({ major });
  }

  render() {
    const { attribute, value, options } = this.props;
    const { major } = this.state;

    const style = {
      control: (base) => ({
        ...base,
        border: 0,
        boxShadow: "none"
      })
    };

    let body;
    switch(attribute) {
      case "Major(s)":
        body = <div className="major-select">
          <Select
            options={options}
            defaultValue={major}
            isSearchable={false}
            onChange={this.majorHandler}
            value={major}
            components={{
              IndicatorSeparator: () => null
            }}
            styles={style}
          />
        </div>;
        break;
      case "Full Name":
        body = <div className="personal-value">
          <p>{value}</p>
          <button className="personal-edit">edit</button>
        </div>
        break;
      default:
        body = <div className="personal-value">
          <p>{value}</p>
        </div>;
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
