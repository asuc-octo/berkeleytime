import React, { FC, useState } from 'react';
import { Collapse } from 'react-bootstrap';

import { P } from 'bt/custom'

interface Props {
  question: JSX.Element,
  answer: JSX.Element
}

const QuestionCard: FC<Props> = (props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="faq-row">
      <div className="faq-question" onClick={() => setOpen(!open)}>
        <P bold>{ props.question }</P>
        <span> {open ? '-' : '+'} </span>
      </div>
      <div className="faq-answer">
        <Collapse in={open} className="collapse-text">
          { props.answer }
        </Collapse>
      </div>
    </div>
  )
}

export default QuestionCard
