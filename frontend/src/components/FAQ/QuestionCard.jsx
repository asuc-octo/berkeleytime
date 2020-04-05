import React, { Component } from 'react';
import { Button, Collapse } from 'react-bootstrap';

class QuestionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.toggle = this.toggle.bind(this);
    this.generateAnswers = this.generateAnswers.bind(this);
  }
  toggle(open) {
    this.setState({
      open: open
    })
  }
  generateAnswers() {
    const { question, answer } = this.props;
    if (question.includes("accurate")) {
      return (
        <div className="example-collapse-text">
          BerkeleyTime sources our historic course data directly from Berkeley <a className="link" href="https://sis.berkeley.edu/">Student Information System</a>’s Course and Enrollment APIs.
          We source grade data from <a className="link" href="https://calanswers.berkeley.edu/">CalAnswers</a>.
        </div>
      )
    } else if (question.includes("contact")) {
      return (
        <div className="example-collapse-text">
          Any questions or concerns that you have can be directed to <a className="link" href = "mailto: octo.berkeley@asuc.org">octo.berkeley@asuc.org</a>.
        </div>
      )
    } else if (question.includes("anyone")) {
      return (
        <div className="example-collapse-text">
          We’re here! Our team here at UC Berkeley is continually working to deliver you all the best experience in selecting the courses you need to exceed.
          You can learn more about us <a className="link" href="https://berkeleytime.com/about">here</a>.
        </div>
      )
    } else if (question.includes("feedback")) {
      return (
        <div className="example-collapse-text">
          Email us at <a className="link" href = "mailto: octo.berkeley@asuc.org">octo.berkeley@asuc.org</a>!
        </div>
      )
    } else if (question.includes("API")) {
      return (
        <div className="example-collapse-text">
          Yes! Our backend API is open and available for anyone to use. You can read the documentation <a className="link" href="https://berkeleytime.com/apidocs">here</a>.
        </div>
      )
    } else {
      return (
        <div className="example-collapse-text">
          {answer}
        </div>
      )
    }
  }

  render() {
    const { open } = this.state;
    const { answer, question } = this.props;
    return (
      <div className="faq-question-card">
            <div className="faq-question" onClick={() => this.toggle(!open)}>
                <div className="faq-question-text">{question}
                  <span className="faq-question-icon" > {open ? "-" : "+"} </span>
                </div>

            </div>
            <div className="faq-answer">
              <Collapse in={open}>
                {this.generateAnswers()}
              </Collapse>
            </div>
        </div>
    );
  }

}

//
// <Button
//   onClick={() => this.toggle(!open)}
//   aria-controls="example-collapse-text"
//   aria-expanded={open}
// >
//   click
// </Button>

export default QuestionCard;
