import { H3 } from 'bt/custom';
import { current } from '../../lib/contributors';
import { Globe } from "iconoir-react";

const CurrentContributors = () => (
	<div className="current-contributors mb-5">
		<H3 bold className="mb-4">
			{current.name}
		</H3>
		<div>
			{current.items.map(({ name, img, site, role }) => (
				<div key={name} className="contributor-card">
					<div className="headshot">
						<img className="serious" src={img?.base} alt={name} />
						<img src={img?.silly ? img?.silly : img?.base} alt={name} />
					</div>
					<div className="name">
						<p className="bt-light-bold">{name}</p>
						{site ? (
							<a href={site}>
								<Globe width={16} height={16} color={"#8A8A8A"} />
							</a>
						) : null}
					</div>
					<div className="role">{role}</div>
				</div>
			))}
		</div>
	</div>
);

export default CurrentContributors;
