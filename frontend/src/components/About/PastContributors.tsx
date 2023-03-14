import { H3, H6 } from 'bt/custom';
import { past } from '../../lib/contributors';

import { ReactComponent as Web } from '../../assets/svg/about/web.svg';

const PastContributors = () => (
	<div>
		<H3 className="mb-4" bold>
			Alumni
		</H3>
		{past.map((section) => (
			<div key={section.name} className="past-contributors">
				<H6 className="mb-3" bold>
					{section.name}
				</H6>
				<div>
					{section.items.map((member) => (
						<div key={member.name} className="contributor-card">
							<div className="name">
								<p className="bt-light-bold">{member.name}</p>
								{member.site ? (
									<a href={member.site}>
										<Web />
									</a>
								) : null}
							</div>
							{member.role ? <div className="role">{member.role}</div> : null}
						</div>
					))}
				</div>
			</div>
		))}
	</div>
);

export default PastContributors;
