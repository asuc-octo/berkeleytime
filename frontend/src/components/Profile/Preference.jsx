import React, { PureComponent } from 'react';
import Switch from 'react-ios-switch';

class Preference extends PureComponent {
  constructor(props){
    super(props);

    this.state = {
        checked: true,
    }
  }
  render() {
    const { text } = this.props;
    const { checked } = this.state;

    return (
      <div className="profile-row">
        <p>{text}</p>
        <div className="notifications-switch">
          <Switch
            checked={checked}
            onChange={checked => this.setState({ checked })}
          />
        </div>
      </div>
    );
  }
}

export default Preference;
