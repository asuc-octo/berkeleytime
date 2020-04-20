import React, { Component } from 'react';
import { Row, Col, ButtonToolbar, Form } from 'react-bootstrap';

class BTForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: null,
    };
  }

  componentDidMount() {
    const { name } = this.props;
    fetch("/api/forms/config/" + name + "/")
      .then(result => result.json())
      .then(data => this.setState({ form: data }));
  }

  createQuestion(question) {
    if (question.type === "short") {
      return this.createShort(question);
    } else if (question.type === "long") {
      return this.createLong(question);
    } else if (question.type === "multiple_choice") {
      return this.createMutlipleChoice(question);
    } else if (question.type === "file") {
      return this.createFile(question);
    } else {
      return <div></div>;
    }
  }

  createLong(question) {
    return (
      <Form.Control placeholder={ question.placeholder } as="textarea" rows="3" />
    )
  }

  createShort(question) {
    let qType;
    if (question.html_type) {
      qType = question.type;
    } else {
      qType = "text";
    }

    return (
      <Form.Control type={ qType } placeholder={ question.placeholder } />
    )
  }

  createMutlipleChoice(question) {
    return (
      <Form.Control as="select">
        {question.choices.map(item =>
          <option>item</option>
        )}
      </Form.Control>
    )
  }

  createFile(question) {
    console.log("is this being called?");
    return (
      <Form.File
        label={ question.placeholder }
        custom
      />
    )
  }

  render() {
    const { form } = this.state;

    if (form === null) {
      return <div></div>;
    }

    return (
      <div className="application">
        <div className="application-header">
          <h5> { form.info.public_name } </h5>
          <p>
            { form.info.description }
          </p>
        </div>

        <Form>
          {form.questions.map(item =>
            <Form.Group>
              <Form.Label className={item.required ? "required" : ""}>
                {item.title}
              </Form.Label>
              { item.description ? (
                <p className="descriptor"> { item.description } </p>
              ) : null }
              { this.createQuestion(item) }
            </Form.Group>
           )}
        </Form>

        <ButtonToolbar className="releases-heading-button join">
          <button className="btn btn-bt-primary btn-bt-sm">
            Submit
          </button>
        </ButtonToolbar>

      </div>
    );
  }
}

export default BTForm;
