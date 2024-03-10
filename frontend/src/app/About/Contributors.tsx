import { Globe } from 'iconoir-react';
import { contributorStructure } from './index';
import styles from "./Contributors.module.scss"

interface ContributorsProps {
	currContributors: contributorStructure[];
	alumniContributors: contributorStructure[];
}


const Contributors: React.FC<ContributorsProps> = ({ currContributors, alumniContributors }) => {
	/* 	console.log(currContributors)
		console.log(alumniContributors)
		console.log(currContributors[0]?.name)
		console.log(currContributors[0]?.img.seriousBase64);
	
	 */

	console.log(currContributors)
	const base64Root = 'data:image/jpeg;base64,'

	const alumniByGradYear: { [key: number]: contributorStructure[] } = {};

	// Populate the data structure
	alumniContributors.forEach((member) => {
		const gradYear = member.gradYr;
		if (gradYear in alumniByGradYear) {
			alumniByGradYear[gradYear].push(member);
		} else {
			alumniByGradYear[gradYear] = [member];
		}
	});



	return (
		<>
			<div className={styles.currentContributors}>
				<h1>
					Current Contributors
				</h1>
				<div>
					{currContributors.map(({ name, img, websiteURL, role }) => (
						<div key={name} className={styles.contributorCard}>
							<div className={styles.headshot}>
								<img className={styles.serious} src={img.seriousBase64 ? `${base64Root}${img.seriousBase64}` : ''} alt={name} />
								<img src={`${base64Root}${img.sillyBase64 || img.seriousBase64}`} alt={name} />
							</div>
							<div className={styles.name}>
								<p>{name}</p>
								{websiteURL ? (
									<a href={websiteURL} target="_blank" rel="noreferrer">
										<Globe width={16} height={16} color={'#8A8A8A'} />
									</a>
								) : null}
							</div>
							<div className={styles.role}>{role}</div>
						</div>
					))}
				</div>
			</div>

			<div>
				<h1 style={{ marginBottom: '24px', fontWeight: 'bold' }}>
					Alumni
				</h1>
				{Object.entries(alumniByGradYear).map(([key, alumniList]) => (
					<div className={styles.pastContributors}>
						<h1 style={{ marginBottom: '16px', fontWeight: 'bold' }}>
							{key.toString() === '00' ? 'Founders' : (key.toString() === '01' ? 'Founding Team' : `Class of ${key.toString()}`)}
						</h1>
						<div>
							{alumniList.map((alumni) => ( // Iterate over each alumni in the list
								<div key={alumni.name} className={styles.contributorCard}>
									<div className={styles.name}>
										<p style={{ fontWeight: 500 }}>{alumni.name}</p>
										{alumni.websiteURL && (
											<a href={alumni.websiteURL} target="_blank" rel="noreferrer">
												<Globe width={16} height={16} color={'#8A8A8A'} />
											</a>
										)}
									</div>
									{alumni.role && <div className={styles.role}>
										{key === '00' ? 'Co-Founder' : alumni.role}
									</div>}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default Contributors;