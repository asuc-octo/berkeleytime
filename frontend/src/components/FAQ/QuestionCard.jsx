import React, { Component } from 'react';
import { Collapse } from 'react-bootstrap';

class QuestionCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle(open) {
    this.setState({
      open: open
    })
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
                <div className="example-collapse-text">
                    { answer }
                </div>
              </Collapse>
            </div>
        </div>
    );
  }

}

export default QuestionCard;
