import React, { Component } from 'react';
import { Row, FormFile, ListGroup, Form, Button } from 'react-bootstrap';

class BTForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      form: null,
      responses: {},
      validated: false,
      validation: {},
      filesUploaded: {},
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.removeFile = this.removeFile.bind(this);
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
            responses[question.unique_name] = {
              ref: React.createRef(),
              files: [],
            };
          }
        });
        this.setState({
          responses: responses
        })
      }));
  }

  handleInputChange(event) {
    const target = event.target;
    const { form, responses } = this.state;
    let validation = {};
    this.validateAll(form, {
      ...responses,
      [target.name]: target.value,
    }, validation);
    this.setState(prevState => ({
      ...prevState,
      responses: {
        ...prevState.responses,
        [target.name]: target.value,
      },
        validation: prevState.validated ? validation : {},
    }))
  }

  handleSubmit(event) {
    const { form, responses } = this.state;
    const target = event.currentTarget;
    let validation = {};
    event.preventDefault();
    if (this.validateAll(form, responses, validation)) {
      alert('success');
    }
    this.setState({
      validation: validation,
      validated: true,
    })
  }

  handleCheck(event) {
    const target = event.target;
    const { form, responses } = this.state;
    let validation = {};
    this.validateAll(form, {
          ...responses,
          [target.name]: responses[target.name]
            ? responses[target.name].concat([target.id])
            : [target.id],
        }, validation);
    if (responses[target.name]
        ? !responses[target.name].includes(target.id)
        : true
    ) {
      this.setState(prevState => ({
        responses: {
          ...prevState.responses,
          [target.name]: responses[target.name]
            ? responses[target.name].concat([target.id])
            : [target.id],
        },
        validation: prevState.validated ? validation : {},
      }))
    } else {
      this.setState(prevState => ({
        responses: {
          ...prevState.responses,
          [target.name]: responses[target.name]
            ? responses[target.name].filter(item => item !== target.id)
            : [],
        },
        validation: prevState.validated ? validation : {},
      }))
    }
  }

  handleFileUpload(event) {
    const target = event.target;
    const { form, responses } = this.state;
    const files = [...responses[target.name].files];
    const fileNames = responses[target.name].files.map(file => file.name);
    for (let i = 0; i < target.files.length; i++) {
      if (!fileNames.includes(target.files[i].name)) {
        files.push(target.files[i]);
        fileNames.push(target.files[i].name);
      }
    }

    let validation = {};
    this.validateAll(form, {
          ...responses,
          [target.name]: {
            ...responses[target.name],
            files: files
          }
        }, validation);
    for (let i = 0; i < target.files.length; i++) {
      let reader = new FileReader();
      const file = target.files[i];
      reader.onload = (event) => {
        this.setState(prevState => ({
          filesUploaded: {
            ...prevState.filesUploaded,
            [target.name]: {
              ...prevState.filesUploaded[target.name] ? {...prevState.filesUploaded[target.name]} : {...{}},
              [file.name]: event.target.result,
            }
          }
        }))
      };
      reader.readAsBinaryString(file);
    }

    this.setState(prevState => ({
        responses: {
          ...prevState.responses,
          [target.name]: {
            ...prevState.responses[target.name],
            files: files
          }
        },
        validation: prevState.validated ? validation : {},
      }));
    event.preventDefault();
  }

  removeFile(question, removedFile) {
    const { form, responses, filesUploaded } = this.state;
    const files = responses[question].files.filter(file => file.name !== removedFile);
    let validation = {};
    this.validateAll(form, {
          ...responses,
          [question]: {
            ...responses[question],
            files: files
          }
        }, validation);
    this.setState(prevState => ({
        responses: {
          ...prevState.responses,
          [question]: {
            ...prevState.responses[question],
            files: files
          }
        },
        validation: prevState.validated ? validation : {},
      }));
  }

  setValidation(question, message, valid, validation) {
    if (!validation[question.unique_name]) {
      validation[question.unique_name] = {
        valid: valid,
        message: message,
      };
      return true;
    }
    return false;
  }

  validateAll(form, responses, validation) {
    this.validateRequired(form, responses, validation);
    this.validateLength(form, responses, validation);
    this.validateFormat(form, responses, validation);
    return this.setRemaingValid(form, validation);
  }

  setRemaingValid(form, validation) {
    return form.questions.map(question => this.setValidation(question, "", true, validation))
        .every(item => item === true);
  }

  validateRequired(form, responses, validation) {
    for (let question of form.questions) {
      if (question.required) {
        if (question.type === "file" && responses[question.unique_name].files.length === 0) {
          this.setValidation(question, "This question is required", false, validation);
        } else if (question.type === "multiple_select") {
          if (!responses[question.unique_name] || responses[question.unique_name].length === 0) {
            this.setValidation(question, "This question is required", false, validation);
          }
        }
        else if (!responses[question.unique_name] || responses[question.unique_name].length === 0) {
          this.setValidation(question, "This question is required", false, validation);
        }
      }
    }
  }

  validateLength(form, responses, validation) {
    for (let question of form.questions) {
      if (question.min && responses[question.unique_name]) {
        if (!responses[question.unique_name] || responses[question.unique_name].length < question.min) {
          this.setValidation(question, "Input must be at least " + question.min + " characters.", false, validation);
        }
      }
      if (question.max && responses[question.unique_name]) {
        if (responses[question.unique_name].length > question.max) {
          this.setValidation(question, "Input must be at most " + question.max + " characters.", false, validation);
        }
      }
    }
    return true;
  }

  validateFormat(form, responses, validation) {
    for (let question of form.questions) {
      if (question.format && responses[question.unique_name]) {
        if (question.format === 'email') {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!re.test(responses[question.unique_name].toLowerCase())){
             this.setValidation(question, "Please enter a valid email.", false, validation);
          }
        } else if (question.format === 'number') {
          var re = /^\d+$/;
          if (!re.test(responses[question.unique_name].toLowerCase())){
             this.setValidation(question, "Please enter a number.", false, validation);
          }
        } else if (question.format === 'date') {
          var re = /^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/((19|20)[0-9][0-9])$/;
          if (!re.test(responses[question.unique_name].toLowerCase())){
             this.setValidation(question, "Please enter a date in MM/DD/YYYY format.", false, validation);
          }
        }
      }
    }
    return true;
  }

  createQuestion(question, responses, validation) {
    if (question.type === "short") {
      return this.createShort(question, responses, validation);
    } else if (question.type === "long") {
      return this.createLong(question, responses, validation);
    } else if (question.type === "multiple_choice") {
      return this.createMutlipleChoice(question, responses, validation);
    } else if (question.type === "file") {
      return this.createFile(question, responses, validation);
    } else if (question.type === "multiple_select") {
      return this.createMultipleSelect(question, responses, validation);
    } else {
      return null;
    }
  }

  createLong(question, responses, validation) {
    let valid = validation[question.unique_name] ? validation[question.unique_name].valid : false;
    let invalid = validation[question.unique_name] ? !validation[question.unique_name].valid : false;
    return (
      <Form.Control
          name={ question.unique_name }
          placeholder={ question.placeholder }
          as="textarea" rows="3"
          onChange={ this.handleInputChange }
          value={ responses[question.unique_name] }
          required={ question.required }
          isInvalid={invalid}
          isValid={valid}
      />
    )
  }

  createShort(question, responses, validation) {
    let qType;
    if (question.html_type) {
      qType = question.type;
    } else {
      qType = "text";
    }
    let valid = validation[question.unique_name] ? validation[question.unique_name].valid : false;
    let invalid = validation[question.unique_name] ? !validation[question.unique_name].valid : false;

    return (
      <Form.Control
          name={ question.unique_name }
          type={ qType }
          placeholder={ question.placeholder }
          onChange={ this.handleInputChange }
          value={ responses[question.unique_name] }
          required={ question.required }
          isInvalid={invalid}
          isValid={valid}
      />
    )
  }

  createMutlipleChoice(question, responses, validation) {
    let valid = validation[question.unique_name] ? validation[question.unique_name].valid : false;
    let invalid = validation[question.unique_name] ? !validation[question.unique_name].valid : false;
    return (
      <Form.Control
          name={ question.unique_name }
          as="select"
          onChange={this.handleInputChange}
          value={responses[question.unique_name]}
          placeholder={ question.placeholder }
          required={ question.required }
          custom
          isInvalid={invalid}
          isValid={valid}
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

  createMultipleSelect(question, responses, validation) {
    let valid = validation[question.unique_name] ? validation[question.unique_name].valid : false;
    let invalid = validation[question.unique_name] ? !validation[question.unique_name].valid : false;
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
            required={ question.required }
            label={item}
            isInvalid={invalid}
            isValid={valid}
          />
        )}
        </div>
    )
  }

  createFile(question, responses, validation) {
    let valid = validation[question.unique_name] ? validation[question.unique_name].valid : false;
    let invalid = validation[question.unique_name] ? !validation[question.unique_name].valid : false;
    let fileList = [];
    if (responses[question.unique_name] && responses[question.unique_name].files) {
      for (var i = 0; i < responses[question.unique_name].files.length; i++) {
        fileList.push(responses[question.unique_name].files[i].name);
      }
    }
    return (
      <div>
        <Form.File
          label={ question.placeholder }
          name={ question.unique_name }
          accept={ question.accept ? question.accept : ""}
          ref={ responses[question.unique_name] }
          onChange = { this.handleFileUpload }
          required={ question.required }
          isInvalid={invalid}
          isValid={valid}
          multiple
          custom
        />
        <ListGroup>
          { fileList.map(file =>
              <ListGroup.Item>{ file }
              <span className="uploaded-file-remove"
                onClick={ ()=> { this.removeFile(question.unique_name, file) }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.00001 19C6.00001 20.1 6.90001 21 8 21H16C17.1 21 18 20.1 18 19V7H6.00001V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="#FC7676"/>
                </svg>
              </span>
              </ListGroup.Item>
            )
          }
        </ListGroup>
      </div>
    )
  }

  render() {
    const { form, responses, filesUploaded, validation } = this.state;

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

        <Form noValidate onSubmit={ this.handleSubmit }>
          {form.questions.map(item =>
            <Form.Group>
              <Form.Label className={item.required ? "required" : ""}>
                {item.title}
              </Form.Label>
              { item.description ? (
                <p className="descriptor"> { item.description } </p>
              ) : null }
              { this.createQuestion(item, responses, validation) }
              { validation[item.unique_name]
                  ? <Form.Control.Feedback type={validation[item.unique_name].valid ? 'valid' : 'invalid'}>
                    { validation[item.unique_name].message }
                  </Form.Control.Feedback>
                  : null
              }
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
