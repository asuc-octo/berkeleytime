import React, { PureComponent } from 'react';
import BTForm from '../../components/Form/Form.jsx';

class DarkModeForm extends PureComponent {
  render() {
    return (
      <div className="bt-form-page">

        <BTForm name="DarkModeForm" />

      </div>

    );
  }
}

export default DarkModeForm;