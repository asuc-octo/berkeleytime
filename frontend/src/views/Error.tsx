import { Button } from 'bt/custom';
import { ButtonGroup, ButtonToolbar, Col, Container, Row } from 'react-bootstrap';
import empty_graph from '../assets/img/images/empty-graph.png';

export default function Error() {
	return (
		<div className="error viewport-app-404">
			<Container>
				<Row>
					<Col md={{ span: 5, order: 2 }} lg={4} className="img-container">
						<img src={empty_graph} alt="empty_graph" />
					</Col>
					<Col md={{ span: 5, offset: 1, order: 1 }} lg={6} className="content">
						<h1>404</h1>
						<h3>Uh oh. Looks like the page you&apos;re looking for doesn&apos;t exist.</h3>
						<p>Here are a couple of things you can do.</p>
						<ButtonToolbar>
							<ButtonGroup className="mr-3 mb-2">
								<Button className="bt-btn-primary" href={{ as_link: '/catalog' }}>
									Back to Courses
								</Button>
							</ButtonGroup>
						</ButtonToolbar>
					</Col>
				</Row>
			</Container>
		</div>
	);
}