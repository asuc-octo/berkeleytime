import BTLoader from 'components/Common/BTLoader';
import React, { Component } from 'react';
import { ListGroup, Form, Button } from 'react-bootstrap';
import Markdown from 'react-markdown';

class BTForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: null,
      responses: {},
      validated: false,
      validation: {},
      submitting: false,
      submitted: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.removeFile = this.removeFile.bind(this);
  }

  componentDidMount() {
    const { name } = this.props;
    fetch('/api/forms/config/' + name + '/')
      .then((result) => result.json())
      .then((data) =>
        this.setState({ form: data }, function () {
          const { form } = this.state;
          let responses = {};
          form.questions.forEach((question) => {
            if (question.type === 'file') {
              responses[question.unique_name] = {
                files: [],
              };
            }
          });
          this.setState({
            responses: responses,
          });
        })
      );
  }

  handleInputChange(event) {
    const target = event.target;
    const { form, responses } = this.state;
    let validation = {};
    this.validateAll(
      form,
      {
        ...responses,
        [target.name]: target.value,
      },
      validation
    );
    this.setState((prevState) => ({
      ...prevState,
      responses: {
        ...prevState.responses,
        [target.name]: target.value,
      },
      validation: prevState.validated ? validation : {},
    }));
  }

  handleSubmit(event) {
    const { form, responses } = this.state;
    let validation = {};
    event.preventDefault();
    let validationSuccess = this.validateAll(form, responses, validation);
    this.setState({
      validation: validation,
      validated: true,
    });
    if (validationSuccess) {
      this.postResponses(form, responses);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  postResponses(form, responses) {
    let submission = {};
    for (let question of form.questions) {
      if (responses[question.unique_name]) {
        if (question.type === 'file') {
          if (responses[question.unique_name].files.length > 0) {
            submission[question.unique_name] = [];
            for (let file of responses[question.unique_name].files) {
              if (!responses[question.unique_name][file.name]) {
                alert('Files not finished uploading!');
                return;
              }
              submission[question.unique_name].push(
                responses[question.unique_name][file.name]
              );
            }
            submission[question.unique_name] = submission[
              question.unique_name
            ].join('\n');
          }
        } else if (
          question.type === 'multiple_select' &&
          responses[question.unique_name].length > 0
        ) {
          submission[question.unique_name] = responses[
            question.unique_name
          ].join('\n');
        } else {
          submission[question.unique_name] = responses[question.unique_name];
        }
      }
    }
    submission['Config'] = form.info.unique_name;
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    };
    this.setState({
      submitting: true,
    });
    fetch('/api/forms/submit/', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data['expired']) {
          alert('This form has closed. Sorry!');
        } else if (!data['success']) {
          alert(
            'There was an internal error with your submission. Please contact octo.berkeleytime@asuc.org. Error: ' +
              data['error']
          );
        } else {
          this.setState(
            {
              submitted: true,
            },
            () => {
              window.scroll({ top: 0, left: 0, behavior: 'smooth' });
            }
          );
        }
      })
      .then(() => this.setState({ submitting: false }));
  }

  handleCheck(event) {
    const target = event.target;
    const { form, responses } = this.state;
    let validation = {};
    if (
      responses[target.name]
        ? !responses[target.name].includes(target.id)
        : true
    ) {
      this.validateAll(
        form,
        {
          ...responses,
          [target.name]: responses[target.name]
            ? responses[target.name].concat([target.id])
            : [target.id],
        },
        validation
      );
      this.setState((prevState) => ({
        responses: {
          ...prevState.responses,
          [target.name]: responses[target.name]
            ? responses[target.name].concat([target.id])
            : [target.id],
        },
        validation: prevState.validated ? validation : {},
      }));
    } else {
      this.validateAll(
        form,
        {
          ...responses,
          [target.name]: responses[target.name]
            ? responses[target.name].filter((item) => item !== target.id)
            : [target.id],
        },
        validation
      );
      this.setState((prevState) => ({
        responses: {
          ...prevState.responses,
          [target.name]: responses[target.name]
            ? responses[target.name].filter((item) => item !== target.id)
            : [],
        },
        validation: prevState.validated ? validation : {},
      }));
    }
  }

  handleFileUpload(event) {
    const target = event.target;
    const { form, responses } = this.state;
    const files = [...responses[target.name].files];
    const fileNames = responses[target.name].files.map((file) => file.name);
    for (let i = 0; i < target.files.length; i++) {
      if (!fileNames.includes(target.files[i].name)) {
        files.push(target.files[i]);
        fileNames.push(target.files[i].name);
      }
    }

    let validation = {};
    this.validateAll(
      form,
      {
        ...responses,
        [target.name]: {
          ...responses[target.name],
          files: files,
        },
      },
      validation
    );
    for (let i = 0; i < target.files.length; i++) {
      let reader = new FileReader();
      const file = target.files[i];
      reader.onload = (event) => {
        const requestOptions = {
          method: 'POST',
          body: event.target.result,
        };
        fetch(
          '/api/forms/upload/' + form.info.unique_name + '/' + file.name + '/',
          requestOptions
        )
          .then((response) => response.json())
          .then((data) =>
            this.setState((prevState) => ({
              ...prevState,
              responses: {
                ...prevState.responses,
                [target.name]: {
                  ...prevState.responses[target.name],
                  [file.name]: data['success'] ? data['link'] : 'error',
                },
              },
            }))
          );
      };
      reader.readAsArrayBuffer(file);
    }

    this.setState((prevState) => ({
      responses: {
        ...prevState.responses,
        [target.name]: {
          ...prevState.responses[target.name],
          files: files,
        },
      },
      validation: prevState.validated ? validation : {},
    }));
    event.preventDefault();
  }

  removeFile(question, removedFile) {
    const { form, responses } = this.state;
    const files = responses[question].files.filter(
      (file) => file.name !== removedFile
    );
    let validation = {};
    this.validateAll(
      form,
      {
        ...responses,
        [question]: {
          ...responses[question],
          files: files,
        },
      },
      validation
    );
    this.setState((prevState) => ({
      ...prevState,
      responses: {
        ...prevState.responses,
        [question]: {
          ...prevState.responses[question],
          files: files,
          [removedFile]: 'removed',
        },
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
    return this.setRemainingValid(form, validation);
  }

  setRemainingValid(form, validation) {
    return form.questions
      .map((question) => this.setValidation(question, '', true, validation))
      .every((item) => item === true);
  }

  validateRequired(form, responses, validation) {
    for (let question of form.questions) {
      if (question.required) {
        if (
          question.type === 'file' &&
          responses[question.unique_name].files.length === 0
        ) {
          this.setValidation(
            question,
            'This question is required.',
            false,
            validation
          );
        } else if (question.type === 'multiple_select') {
          if (
            !responses[question.unique_name] ||
            responses[question.unique_name].length === 0
          ) {
            this.setValidation(
              question,
              'This question is required.',
              false,
              validation
            );
          }
        } else if (
          !responses[question.unique_name] ||
          responses[question.unique_name].length === 0
        ) {
          this.setValidation(
            question,
            'This question is required.',
            false,
            validation
          );
        }
      }
    }
  }

  validateLength(form, responses, validation) {
    for (let question of form.questions) {
      if (question.min && responses[question.unique_name]) {
        if (
          !responses[question.unique_name] ||
          responses[question.unique_name].length < question.min
        ) {
          let message =
            'Input must be at least ' +
            question.min +
            ' characters. Currently ' +
            responses[question.unique_name].length +
            ' character';
          if (responses[question.unique_name].length !== 1) {
            message += 's';
          }
          message += '.';
          this.setValidation(question, message, false, validation);
        }
      }
      if (question.max && responses[question.unique_name]) {
        if (responses[question.unique_name].length > question.max) {
          let message =
            'Input must be at most ' +
            question.min +
            ' characters. Currently ' +
            responses[question.unique_name].length +
            ' character';
          if (responses[question.unique_name].length !== 1) {
            message += 's';
          }
          message += '.';
          this.setValidation(question, message, false, validation);
        }
      }
    }
    return true;
  }

  validateFormat(form, responses, validation) {
    for (let question of form.questions) {
      if (question.format && responses[question.unique_name]) {
        if (question.format === 'email') {
          // eslint-disable-next-line no-useless-escape
          const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!re.test(responses[question.unique_name].toLowerCase())) {
            this.setValidation(
              question,
              'Please enter a valid email.',
              false,
              validation
            );
          }
        } else if (question.format === 'number') {
          const re = /^\d+$/;
          if (!re.test(responses[question.unique_name].toLowerCase())) {
            this.setValidation(
              question,
              'Please enter a number.',
              false,
              validation
            );
          }
        } else if (question.format === 'date') {
          const re = /^(0?[1-9]|1[012])\/(0?[1-9]|[12][0-9]|3[01])\/((19|20)[0-9][0-9])$/;
          if (!re.test(responses[question.unique_name].toLowerCase())) {
            this.setValidation(
              question,
              'Please enter a date in MM/DD/YYYY format.',
              false,
              validation
            );
          }
        }
      }
    }
    return true;
  }

  createQuestion(question, responses, validation) {
    if (question.type === 'short') {
      return this.createShort(question, responses, validation);
    } else if (question.type === 'long') {
      return this.createLong(question, responses, validation);
    } else if (question.type === 'multiple_choice') {
      return this.createMultipleChoice(question, responses, validation);
    } else if (question.type === 'file') {
      return this.createFile(question, responses, validation);
    } else if (question.type === 'multiple_select') {
      return this.createMultipleSelect(question, responses, validation);
    } else {
      return null;
    }
  }

  createLong(question, responses, validation) {
    let valid = validation[question.unique_name]
      ? validation[question.unique_name].valid
      : false;
    let invalid = validation[question.unique_name]
      ? !validation[question.unique_name].valid
      : false;
    return (
      <Form.Control
        name={question.unique_name}
        placeholder={question.placeholder}
        as="textarea"
        rows="3"
        onChange={this.handleInputChange}
        value={responses[question.unique_name]}
        required={question.required}
        isInvalid={invalid}
        isValid={valid}
      />
    );
  }

  createShort(question, responses, validation) {
    let qType;
    if (question.html_type) {
      qType = question.type;
    } else {
      qType = 'text';
    }
    let valid = validation[question.unique_name]
      ? validation[question.unique_name].valid
      : false;
    let invalid = validation[question.unique_name]
      ? !validation[question.unique_name].valid
      : false;

    return (
      <Form.Control
        name={question.unique_name}
        type={qType}
        placeholder={question.placeholder}
        onChange={this.handleInputChange}
        value={responses[question.unique_name]}
        required={question.required}
        isInvalid={invalid}
        isValid={valid}
      />
    );
  }

  createMultipleChoice(question, responses, validation) {
    let valid = validation[question.unique_name]
      ? validation[question.unique_name].valid
      : false;
    let invalid = validation[question.unique_name]
      ? !validation[question.unique_name].valid
      : false;
    return (
      <Form.Control
        name={question.unique_name}
        as="select"
        onChange={this.handleInputChange}
        value={responses[question.unique_name]}
        placeholder={question.placeholder}
        required={question.required}
        custom
        isInvalid={invalid}
        isValid={valid}
        defaultValue={'_DEFAULT_'}
      >
        {question.placeholder ? (
          <option value="_DEFAULT_" style={{ color: 'grey' }} disabled>
            {question.placeholder}
          </option>
        ) : null}
        {question.choices.map((item, index) => (
          <option key={index} value={item}>
            {item}
          </option>
        ))}
      </Form.Control>
    );
  }

  createMultipleSelect(question, responses, validation) {
    let valid = validation[question.unique_name]
      ? validation[question.unique_name].valid
      : false;
    let invalid = validation[question.unique_name]
      ? !validation[question.unique_name].valid
      : false;
    return (
      <div>
        {question.choices.map((item, index) => (
          <Form.Check
            custom
            type="checkbox"
            key={index}
            id={item}
            name={question.unique_name}
            checked={
              responses[question.unique_name]
                ? responses[question.unique_name].includes(item)
                : false
            }
            onChange={this.handleCheck}
            required={question.required}
            label={item}
            isInvalid={invalid}
            isValid={valid}
          />
        ))}
      </div>
    );
  }

  createFile(question, responses, validation) {
    let valid = validation[question.unique_name]
      ? validation[question.unique_name].valid
      : false;
    let invalid = validation[question.unique_name]
      ? !validation[question.unique_name].valid
      : false;
    let fileList = [];
    let fileStatus = {};
    if (
      responses[question.unique_name] &&
      responses[question.unique_name].files
    ) {
      for (var i = 0; i < responses[question.unique_name].files.length; i++) {
        let fileName = responses[question.unique_name].files[i].name;
        fileList.push(fileName);
        if (responses[question.unique_name][fileName]) {
          if (responses[question.unique_name][fileName] === 'error') {
            fileStatus[fileName] = '(error)';
          } else if (responses[question.unique_name][fileName] === 'removed') {
            fileStatus[fileName] = '(uploading)';
          } else {
            fileStatus[fileName] = 'loaded';
          }
        } else {
          fileStatus[fileName] = '(uploading)';
        }
      }
    }
    return (
      <div>
        <Form.File
          label={question.placeholder}
          name={question.unique_name}
          accept={question.accept ? question.accept : ''}
          onChange={this.handleFileUpload}
          required={question.required}
          isInvalid={invalid}
          isValid={valid}
          multiple
          custom
        />
        <ListGroup>
          {fileList.map((file, index) => (
            <ListGroup.Item key={index}>
              {file} {fileStatus[file] === 'loaded' ? null : fileStatus[file]}
              <span
                className="uploaded-file-remove"
                onClick={() => {
                  this.removeFile(question.unique_name, file);
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.00001 19C6.00001 20.1 6.90001 21 8 21H16C17.1 21 18 20.1 18 19V7H6.00001V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z"
                    fill="#FC7676"
                  />
                </svg>
              </span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    );
  }

  render() {
    const { form, responses, validation, submitting, submitted } = this.state;

    if (form === null) {
      return <BTLoader />;
    }

    if (form.expired) {
      return (
        <div className="bt-form submitted">
          <div className="bt-form-header">
            <h5>{form.info.public_name}</h5>
            <p className="submitted-text">Sorry, this form is now closed.</p>
          </div>
        </div>
      );
    }

    if (submitted) {
      return (
        <div className="bt-form submitted">
          <div className="bt-form-header">
            <h5>{form.info.public_name}</h5>
            <p className="submitted-text">
              Thank you for submitting this form! We have received your response
              and will get back to you as soon as we can.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bt-form">
        <div className="bt-form-header">
          <h5>{form.info.public_name} </h5>
          <Markdown
            source={form.info.description}
            escapeHTML={false}
            className="markdown"
          />
        </div>

        <Form noValidate onSubmit={this.handleSubmit}>
          {form.questions.map((item, index) => (
            <Form.Group
              key={index}
              className={'bt-question' + (item.gap === false ? ' no-gap' : '')}
            >
              <Form.Label className={item.required ? 'required' : ''}>
                {item.title}
              </Form.Label>
              {item.description ? (
                <p className="descriptor"> {item.description} </p>
              ) : null}
              {this.createQuestion(item, responses, validation)}
              {validation[item.unique_name] ? (
                <Form.Control.Feedback
                  type={
                    validation[item.unique_name].valid ? 'valid' : 'invalid'
                  }
                >
                  {validation[item.unique_name].message}
                </Form.Control.Feedback>
              ) : null}
            </Form.Group>
          ))}

          <Button
            variant="primary"
            type="submit"
            className="btn btn-bt-primary btn-bt-sm"
            disabled={submitting}
          >
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

export default BTForm;
