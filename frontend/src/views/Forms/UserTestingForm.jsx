import React, { PureComponent } from "react";
import BTForm from "../../components/Form/Form.jsx";

class UserTestingForm extends PureComponent {
  render() {
    return (
      <div className="bt-form-page">
        <BTForm name="UserTestingSurvey" />
      </div>
    );
  }
}

export default UserTestingForm;
