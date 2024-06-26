import { H3, P } from '../../bt/custom';

import asuc_logo from '../../assets/img/landing/asuc_logo.png';
import stf_logo from '../../assets/img/landing/stf_logo.jpeg';
import ocf_logo from '../../assets/img/landing/ocf_logo.png';

export default function Blurbs() {
	return (
		<>
			<div className="landing-blurbs">
				<div className="desc">
					<H3 bold className="mb-3">
						Sponsors
					</H3>
					<P className="mb-3">
						Thank you to the folks that help the Berkeleytime team continue to provide this service
						free-of-charge to students!
					</P>
				</div>
				<div className="sponsors">
					<a href="https://techfund.berkeley.edu/home">
						<img className="landing-sponsors-img" src={stf_logo} alt="stf" />
					</a>
					<a href="https://asuc.org">
						<img className="landing-sponsors-img" src={asuc_logo} alt="asuc" />
					</a>
					<a href="https://www.ocf.berkeley.edu">
						{' '}
						{/* https://www.ocf.berkeley.edu/docs/services/vhost/badges */}
						<img
							className="landing-sponsors-img"
							src={ocf_logo}
							alt="Hosted by the OCF"
							style={{ border: 0 }}
						/>
					</a>
				</div>
			</div>
			<div className="landing-blurbs">
				<div className="desc">
					<H3 bold className="mb-3">
						In Memory Of Courtney Brousseau
					</H3>
					<P>
						Berkeley Alum, ASUC Student Union Board of Directors Chair, ASUC Chief Communications
						Officer, and Berkeley Mobile Product Manager
					</P>
				</div>
			</div>
		</>
	);
}
