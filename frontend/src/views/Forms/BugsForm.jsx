import React, { PureComponent } from "react";
import BTForm from "../../components/Form/Form.jsx";

class BugsForm extends PureComponent {
  render() {
    return (
      <div className="bt-form-page">
        <BTForm name="BugSurvey" />
      </div>
    );
  }
}

export default BugsForm;
