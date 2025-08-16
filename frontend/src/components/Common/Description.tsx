import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface DescriptionProps {
	title: string;
	bodyURL: string;
}

interface LinkBarProps {
	link: string;
	linkName: string;
}

export default function Description({
	title,
	link,
	linkName,
	bodyURL
}: LinkBarProps & DescriptionProps) {
	const [body, setBody] = useState('');

	useEffect(() => {
		const initialize = async () => {
			const response = await fetch(bodyURL);
			const text = await response.text();
			setBody(text);
		};

		initialize();
	}, [bodyURL]);

	return (
		<div className="positions">
			<Container>
				<Row>
					<Col lg={2}></Col>
					<Col lg={8}>
						<div className="positions-heading">
							<h2>{title}</h2>
						</div>
						<Markdown escapeHTML={false} className="positions-body">
							{body}
						</Markdown>
					</Col>
					<Col lg={2}></Col>
					<LinkBar link={link} linkName={linkName} />
				</Row>
			</Container>
		</div>
	);
}

export function LinkBar({ link, linkName }: LinkBarProps) {
	return (
		<div className="positions-bar">
			<Button className="position-button" variant="bt-primary" size="bt-md" as={Link} to={link}>
				{linkName} &rarr;{' '}
			</Button>
		</div>
	);
}
