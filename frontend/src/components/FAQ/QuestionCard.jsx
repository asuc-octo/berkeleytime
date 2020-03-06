import React, { Component } from 'react';
import { Button, Collapse } from 'react-bootstrap';

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
            <div className="faq-question">
                <h3>{question}</h3>
                <Button
                  onClick={() => this.toggle(!open)}
                  aria-controls="example-collapse-text"
                  aria-expanded={open}
                >
                  click
                </Button>
            </div>
            <div className="faq-answer">
              <Collapse in={open}>
                <div id="example-collapse-text">
                  {answer}
                </div>
              </Collapse>
            </div>
        </div>
    );
  }

}


export default QuestionCard;
