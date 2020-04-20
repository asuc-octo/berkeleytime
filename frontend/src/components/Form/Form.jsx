import React, { Component } from 'react';
import { Row, Col, ButtonToolbar, Form, Button } from 'react-bootstrap';

class BTForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: null,
      responses: {}
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { name } = this.props;
    fetch("/api/forms/config/" + name + "/")
      .then(result => result.json())
      .then(data => this.setState({ form: data }));
  }

  handleInputChange(event) {
    const target = event.target;

    this.setState(prevState => ({
      ...prevState,
      responses: {
        ...prevState.responses,
        [target.name]: target.value,
      }
    }))
  }

  handleSubmit(event) {
    console.log(this.state);
    event.preventDefault();
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
      return null;
    }
  }

  createLong(question) {
    return (
      <Form.Control
          name={ question.unique_name }
          placeholder={ question.placeholder }
          as="textarea" rows="3"
          onChange={ this.handleInputChange }
          value={ this.state.responses[question.unique_name] }
      />
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
      <Form.Control
          name={ question.unique_name }
          type={ qType }
          placeholder={ question.placeholder }
          onChange={ this.handleInputChange }
          value={ this.state.responses[question.unique_name] }
      />
    )
  }

  createMutlipleChoice(question) {
    return (
      <Form.Control
          name={ question.unique_name }
          as="select"
          onChange={this.handleInputChange}
          value={this.state.responses[question.unique_name]}
          placeholder={ question.placeholder }
          custom
      >
        {question.placeholder ? (
            <option value="" style={{color: "grey"}} selected disabled>
              { question.placeholder }
            </option>
        ): null }
        {question.choices.map(item =>
          <option value={ item }>{ item }</option>
        )}
      </Form.Control>
    )
  }

  createFile(question) {
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
      return null;
    }

    return (
      <div className="application">
        <div className="application-header">
          <h5> { form.info.public_name } </h5>
          <p>
            { form.info.description }
          </p>
        </div>

        <Form onSubmit={ this.handleSubmit }>
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

         <Button variant="primary" type="submit" className="btn btn-bt-primary btn-bt-sm">
            Submit
          </Button>
        </Form>

      </div>
    );
  }
}

export default BTForm;
