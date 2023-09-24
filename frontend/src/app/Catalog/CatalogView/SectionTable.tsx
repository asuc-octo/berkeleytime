import { SectionFragment } from 'graphql';
import { CSSProperties } from 'react';
import { formatSectionTime } from 'utils/sections/section';
import catalogService from '../service';
import Skeleton from 'react-loading-skeleton';

import denero from 'assets/img/eggs/denero.png';
import hug from 'assets/img/eggs/hug.png';
import hilf from 'assets/img/eggs/hilf.png';
import sahai from 'assets/img/eggs/sahai.png';
import scott from 'assets/img/eggs/scott.png';
import kubi from 'assets/img/eggs/kubi.png';
import garcia from 'assets/img/eggs/garcia.png';
import { Clock, Group, PinAlt, User } from 'iconoir-react';

import styles from './CatalogView.module.scss';

const { colorEnrollment, formatEnrollment } = catalogService;

const easterEggImages = new Map([
	['DENERO J', denero],
	['HUG J', hug],
	['SAHAI A', sahai],
	['HILFINGER P', hilf],
	['SHENKER S', scott],
	['KUBIATOWICZ J', kubi],
	['GARCIA D', garcia]
]);

function findInstructor(instr: string | null): CSSProperties {
	if (instr === null) return {};

	for (const [name, eggUrl] of easterEggImages) {
		if (instr.includes(name)) {
			return {
				cursor: `url("${eggUrl}"), pointer`
			} as CSSProperties;
		}
	}

	return {};
}

interface Props {
	sections: SectionFragment[] | null;
}

const SectionTable = ({ sections }: Props) => {
	if (!sections) {
		return (
			<Skeleton
				className={styles.sectionItem}
				count={3}
				height={65}
				style={{ marginBottom: '10px' }}
			/>
		);
	}

	return (
		<div className={styles.sectionRoot}>
			{sections.length > 0 ? (
				sections.map((section) => {
					const color = colorEnrollment(section.enrolled / section.enrolledMax);

					return (
						<div
							className={styles.sectionItem}
							style={findInstructor(section.instructor)}
							key={section.ccn}
						>
							<div className={styles.sectionInfo}>
								<h6>{section.kind}</h6>
								<span className={styles.instructor}>
									<User width={14} />
									{section.instructor?.toLowerCase() || 'unknown'}
								</span>
								<div className={styles.sectionStats}>
									<div>
										<PinAlt width={14} />
										{section.locationName || 'Unknown'}
										{' • '}
									</div>
									<div>
										<Clock width={14} />
										{section.wordDays} {formatSectionTime(section)}
									</div>
								</div>
							</div>
							<div className={styles.sectionContent}>
								<div className={`${color} ${styles.enrolled}`}>
									<Group width={14} />
									{section.enrolled}/{section.enrolledMax} (
									{formatEnrollment(section.enrolled / section.enrolledMax)})
								</div>
								<span>{section.waitlisted} Waitlisted</span>
							</div>
						</div>
					);
				})
			) : (
				<div>There are no class sections for this course.</div>
			)}
		</div>
	);
};

export default SectionTable;
