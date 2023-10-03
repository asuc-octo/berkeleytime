import { useState } from 'react';
import { Collapse } from 'react-bootstrap';

import { P } from 'bt/custom';

interface Props {
	question: string;
	answer: JSX.Element;
}

export default function QuestionCard({ question, answer }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<div className="faq-row">
			<div className="faq-question" onClick={() => setOpen(!open)}>
				<P bold>{question}</P>
				<span> {open ? '-' : '+'} </span>
			</div>
			<div className="faq-answer">
				<Collapse in={open} className="collapse-text">
					{answer}
				</Collapse>
			</div>
		</div>
	);
}
