import { Container, Row, Col } from 'react-bootstrap';
import { H6, A } from '../../bt/custom';

export default function Footer() {
	return (
		<footer className="py-5">
			<Container>
				<Row noGutters>
					<Col xs={4} lg={{ span: 2, offset: 3 }}>
						<div className="footer-col-container">
							<div className="footer-col">
								<H6 bold className="mb-3">
									Support
								</H6>
								<A href="mailto:octo.berkeleytime@asuc.org" className="mb-2">
									Contact Us
								</A>
								<A href={{ as_link: '/faq' }} className="mb-2">
									FAQ
								</A>
							</div>
						</div>
					</Col>
					<Col xs={4} lg={2}>
						<div className="footer-col-container">
							<div className="footer-col">
								<H6 bold className="mb-3">
									Updates
								</H6>
								<A href={{ as_link: '/releases' }} className="mb-2">
									Releases
								</A>
								<A href="https://github.com/asuc-octo/berkeleytime" className="mb-2">
									GitHub
								</A>
								<A href="https://discord.gg/uP2bTPh99U" className="mb-2">
									Discord
								</A>
								<A href="https://facebook.com/berkeleytime" className="mb-2">
									Facebook
								</A>
							</div>
						</div>
					</Col>
					<Col xs={4} lg={2}>
						<div className="footer-col-container">
							<div className="footer-col">
								<H6 className="bt-bold mb-3">About Us</H6>
								<A href={{ as_link: '/about' }} className="mb-2">
									Our Team
								</A>
								<A href="https://octo.asuc.org" className="mb-2">
									ASUC OCTO
								</A>
								<A href={{ as_link: '/legal/privacy' }} className="mb-2">
									Privacy Policy
								</A>
								<A href={{ as_link: '/legal/terms' }} className="mb-2">
									Terms of Service
								</A>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</footer>
	);
}
