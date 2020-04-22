import React, { Component } from 'react';
import { Row, FormFile, ListGroup, Form, Button } from 'react-bootstrap';

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
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  componentDidMount() {
    const { name } = this.props;
    fetch("/api/forms/config/" + name + "/")
      .then(result => result.json())
      .then(data => this.setState({ form: data }, function() {
        const { form } = this.state;
        let responses = {};
        form.questions.map(function(question) {
          if (question.type === "file") {
            responses[question.unique_name] = React.createRef();
          }
        });
        this.setState({
          responses: responses
        })
      }));
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
    const { form, responses } = this.state;
    event.preventDefault();
    if (this.validateRequired(form, responses) && this.validateLength(form, responses) && this.validateFormat(form, responses)) {
      alert("success");
    }
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

  handleFileUpload(event) {
    event.preventDefault();
    this.forceUpdate();
  }

  validateRequired(form, responses) {
    for (let question of form.questions) {
      if (question.required && !responses[question.unique_name]) {
        alert("Please complete " + question.unique_name + ".");
        return false;
      }
    }
    return true;
  }

  validateLength(form, responses) {
    for (let question of form.questions) {
      if (question.min) {
        if (!responses[question.unique_name] || responses[question.unique_name].length < question.min) {
          alert(question.unique_name + " requires at least " + question.min + " characters.");
          return false;
        }
      }
      if (question.max) {
        if (responses[question.unique_name].length > question.max) {
          alert(question.unique_name + " has a limit of at most " + question.max + " characters.");
          return false;
        }
      }
    }
    return true;
  }

  validateFormat(form, responses) {
    for (let question of form.questions) {
      if (question.format && responses[question.unique_name]) {
        if (question.format === 'email') {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!re.test(responses[question.unique_name].toLowerCase())){
             alert(question.unique_name + " requires an email.");
             return false;
          }
        } else if (question.format === 'number') {
          var re = /^\d+$/;
          if (!re.test(responses[question.unique_name].toLowerCase())){
             alert(question.unique_name + " requires an number.");
             return false;
          }
        } else if (question.format === 'date') {
          var re = /^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/((19|20)[0-9][0-9])$/;
          if (!re.test(responses[question.unique_name].toLowerCase())){
             alert(question.unique_name + " requires an date in the format MM/DD/YYYY.");
             return false;
          }
        }
      }
    }
    return true;
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

    let fileList = [];
    if (responses[question.unique_name] && responses[question.unique_name].current && responses[question.unique_name].current.files) {
      for (var i = 0; i < responses[question.unique_name].current.files.length; i++) {
        fileList.push(responses[question.unique_name].current.files[i].name);
      }
    }


    return (
      <div>
        <Form.File
          label={ fileList.length === 0
            ? question.placeholder
            : fileList.join(", ")
          }
          accept={ question.accept ? question.accept : ""}
          ref={ responses[question.unique_name] }
          onChange = { this.handleFileUpload }
          multiple
          custom
        />
      </div>
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
