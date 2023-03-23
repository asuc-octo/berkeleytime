import { FC } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Leaf, LightBulbOn, EmojiTalkingHappy } from "iconoir-react";

import { H3, P } from 'bt/custom';

import CurrentContributors from '../components/About/CurrentContributors';
import PastContributors from '../components/About/PastContributors';
import AboutCarousel from '../components/About/AboutCarousel';

const About: FC = () => (
	<div className="about">
		<div className="about-our-team my-5">
			<H3 bold className="mb-2">
				About Our Team
			</H3>
			<P className="mb-3">
				We&apos;re a small group of student volunteers at UC Berkeley, dedicated to simplifying the
				course discovery experience. We actively build, improve and maintain Berkeleytime.
			</P>
			{/* <Button variant="inverted" link_to="/apply">Join Our Team</Button> */}
		</div>
		<AboutCarousel />
		<div className="values">
			<h5>Our Values</h5>
			<Row>
				<Col xs={12} md={4} className="value-col">
					<div className="value">
						<div className="value-content">
							<Leaf width={60} height={60} color={"#2F80ED"} />
							<h6>Growth</h6>
							<p>You’ll grow your technical skills as you tackle real challenging design and engineering problems.</p>
						</div>
					</div>
				</Col>

				<Col xs={12} md={4} className="value-col">
					<div className="value">
						<div className="value-content">
							<LightBulbOn width={60} height={60} color={"#2F80ED"} />
							<h6>Curiosity</h6>
							<p>We value team members that are curious about solving difficult problems and seek out solutions independently.</p>
						</div>
					</div>
				</Col>

				<Col xs={12} md={4} className="value-col">
					<div className="value">
						<div className="value-content">
							<EmojiTalkingHappy width={60} height={60} color={"#2F80ED"} />
							<h6>Passion</h6>
							<p>Genuine commitment and dedication are critical to moving the Berkeleytime product forward.</p>
						</div>
					</div>
				</Col>
			</Row>
		</div>
		<CurrentContributors />
		<PastContributors />
	</div>
);

export default About;
