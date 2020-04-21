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
    this.handleCheck = this.handleCheck.bind(this);
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

  handleCheck(event) {
    const target = event.target;
    const { responses } = this.state;
    if (responses[target.name]
        ? !responses[target.name].includes(target.id)
        : true
    ) {
      this.setState({
        responses: {
          ...responses,
          [target.name]: responses[target.name]
            ? responses[target.name].concat([target.id])
            : [target.id],
        }
      })
    } else {
      this.setState({
        responses: {
          ...responses,
          [target.name]: responses[target.name]
            ? responses[target.name].filter(item => item !== target.id)
            : [],
        }
      })
    }
  }

  createQuestion(question, responses) {
    if (question.type === "short") {
      return this.createShort(question, responses);
    } else if (question.type === "long") {
      return this.createLong(question, responses);
    } else if (question.type === "multiple_choice") {
      return this.createMutlipleChoice(question, responses);
    } else if (question.type === "file") {
      return this.createFile(question, responses);
    } else if (question.type === "multiple_select") {
      return this.createMultipleSelect(question, responses);
    } else {
      return null;
    }
  }

  createLong(question, responses) {
    return (
      <Form.Control
          name={ question.unique_name }
          placeholder={ question.placeholder }
          as="textarea" rows="3"
          onChange={ this.handleInputChange }
          value={ responses[question.unique_name] }
      />
    )
  }

  createShort(question, responses) {
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
          value={ responses[question.unique_name] }
      />
    )
  }

  createMutlipleChoice(question, responses) {
    return (
      <Form.Control
          name={ question.unique_name }
          as="select"
          onChange={this.handleInputChange}
          value={responses[question.unique_name]}
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

  createMultipleSelect(question, responses) {

    return (
        <div>
        { question.choices.map(item =>
            <Form.Check
            custom
            type="checkbox"
            id={ item }
            name={ question.unique_name }
            checked={ responses[question.unique_name]
                    ? responses[question.unique_name].includes(item)
                    : false }
            onChange={this.handleCheck}
            label={item}
          />
        )}
        </div>
    )
  }

  createFile(question, responses) {

    return (
      <Form.File
        label={ question.placeholder }
        accept={ question.accept ? question.accept : ""}
        multilple
        custom
      />
    )
  }

  render() {
    const { form, responses } = this.state;

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
              { this.createQuestion(item, responses) }
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
