import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-bootstrap';

class QuestionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  render() {
    const { open } = this.state;
    const { answer, question } = this.props;
    return (
      <div className="faq-question-card">
        <div className="faq-question" onClick={this.toggle}>
          <p>{ question }</p>
          <span> {open ? '-' : '+'} </span>
        </div>
        <div className="faq-answer">
          <Collapse in={open} className="collapse-text">
            { answer }
          </Collapse>
        </div>
      </div>
    );
  }
}

QuestionCard.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
};

export default QuestionCard;
