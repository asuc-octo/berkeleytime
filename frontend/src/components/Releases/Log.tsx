import { ReleaseType } from 'lib/releases';

export default function Log({ date, whatsNew, fixes }: ReleaseType) {
	return (
		<div className="releases-log">
			<div className="releases-log-date">
				<h3>{date}</h3>
			</div>
			{whatsNew ? (
				<div className="releases-log-list">
					<h2>&#129321; What&apos;s New</h2>
					<ul>
						{whatsNew.map((item, i) => (
							<li key={i}>
								<span dangerouslySetInnerHTML={{ __html: item }} />
							</li>
						))}
					</ul>
				</div>
			) : null}
			{fixes ? (
				<div className="releases-log-list">
					<h2>&#128027; Bug Fixes</h2>
					<ul>
						{fixes.map((item, i) => (
							<li key={i}>
								<span dangerouslySetInnerHTML={{ __html: item }} />
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
}
