import { FC } from 'react';
import { Row, Col } from 'react-bootstrap';

import { H3, P } from 'bt/custom';

import CurrentContributors from '../components/About/CurrentContributors';
import PastContributors from '../components/About/PastContributors';
import AboutCarousel from '../components/About/AboutCarousel';

import growth from 'assets/svg/about/growth.svg';
import curiosity from 'assets/svg/about/curiosity.svg';
import passion from 'assets/svg/about/passion.svg';

const values = [
	{
		svg: growth,
		name: 'Growth',
		desc: 'You’ll grow your technical skills as you tackle real challenging design and engineering problems.'
	},
	{
		svg: curiosity,
		name: 'Curiosity',
		desc: 'We value team members that are curious about solving difficult problems and seek out solutions independently.'
	},
	{
		svg: passion,
		name: 'Passion',
		desc: 'Genuine commitment and dedication are critical to moving the Berkeleytime product forward.'
	}
];

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
				{values.map((value) => (
					<Col key={value.name} xs={12} md={4} className="value-col">
						<div className="value">
							<div className="value-content">
								<img src={value.svg} alt="value" />
								<h6>{value.name}</h6>
								<p>{value.desc}</p>
							</div>
						</div>
					</Col>
				))}
			</Row>
		</div>
		<CurrentContributors />
		<PastContributors />
	</div>
);

export default About;
