import React, { FC, useState } from 'react';
import { Collapse } from 'react-bootstrap';

import { H6, P } from 'bt/custom'

interface Props {
  question: string
  answer: JSX.Element
}

const QuestionCard: FC<Props> = (props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="faq-row">
      <div className="faq-question" onClick={() => setOpen(!open)}>
        <H6 bold>{ props.question }</H6>
        <span> {open ? '-' : '+'} </span>
      </div>
      <div className="faq-answer">
        <Collapse in={open} className="collapse-text">
          <div>{ props.answer }</div>
        </Collapse>
      </div>
    </div>
  )
}

export default QuestionCard
