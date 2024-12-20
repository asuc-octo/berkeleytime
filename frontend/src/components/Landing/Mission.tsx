import { Container, Row, Col } from 'react-bootstrap';

import { H3, P, Button } from '../../bt/custom';

import start from '../../assets/img/about/group/start.jpg';

export default function Mission() {
	return (
		<div className="landing-mission">
			<Container>
				<Row>
					<Col xs={12} md={7}>
						<img src={start} alt="group pic" />
					</Col>
					<Col xs={12} md={5} xl={{ span: 4, offset: 1 }}>
						<div className="mission">
							<H3 bold className="mb-3">
								Our Mission
							</H3>
							<P className="mb-3">
								Berkeleytime is an official organization under the
								<a href="http://octo.asuc.org/"> ASUC Office of the Chief Technology Officer.</a> We
								are dedicated to designing free, accessible software for students.
							</P>
							<Button variant="inverted" href={{ as_link: '/about' }}>
								About our Team
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
