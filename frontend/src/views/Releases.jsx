import { Container, Row, Col, ButtonToolbar } from 'react-bootstrap';
import releases from '../lib/releases';

import Log from '../components/Releases/Log';

export function Component() {
	return (
		<div className="releases">
			<Container>
				<Row>
					<Col lg={3}></Col>
					<Col lg={6}>
						<div className="releases-heading">
							<h2>Berkeleytime Releases</h2>
							<h3>Keep up-to-date with our releases and bug fixes.</h3>
							<ButtonToolbar className="releases-heading-button" />
						</div>
					</Col>
					<Col lg={3}></Col>
				</Row>
				<Row>
					<Col lg={3}></Col>
					<Col lg={6}>
						{releases.map((item) => (
							<Log key={item.date} {...item} />
						))}
					</Col>
					<Col lg={3}></Col>
				</Row>
			</Container>
		</div>
	);
}
