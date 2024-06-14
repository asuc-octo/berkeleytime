import { SectionFragment } from 'graphql';
import { CSSProperties } from 'react';
import { formatSectionTime } from '../../../utils/sections/section';
import catalogService from '../service';
import Skeleton from 'react-loading-skeleton';

import people from '../../../assets/svg/catalog/people.svg';
import denero from '../../../assets/img/eggs/denero.png';
import hug from '../../../assets/img/eggs/hug.png';
import hilf from '../../../assets/img/eggs/hilf.png';
import sahai from '../../../assets/img/eggs/sahai.png';
import scott from '../../../assets/img/eggs/scott.png';
import kubi from '../../../assets/img/eggs/kubi.png';
import garcia from '../../../assets/img/eggs/garcia.png';

import styles from './CatalogView.module.scss';

const { colorEnrollment, formatEnrollment } = catalogService;

const easterEggImages = new Map<string, string>([
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

type Props = {
	sections: SectionFragment[] | null;
};

const CatalogViewSections = ({ sections }: Props) => {
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
				sections.map((section) => (
					<div
						className={styles.sectionItem}
						style={findInstructor(section.instructor)}
						key={section.ccn}
					>
						<div className={styles.sectionInfo}>
							<h5>
								<span>{section.kind}</span> -{' '}
								{section.locationName ? section.locationName : 'Unknown Location'}
							</h5>
							<h6>
								<span>{section?.instructor?.toLowerCase() ?? 'instructor'}</span>,{' '}
								{section.wordDays} {formatSectionTime(section)}
							</h6>
							<span className={styles.sectionStats}>
								<span className={colorEnrollment(section.enrolled / section.enrolledMax)}>
									{formatEnrollment(section.enrolled / section.enrolledMax)}
								</span>
								<span>• {section.waitlisted} waitlisted</span>
								<span>• CCN: {section.ccn}</span>
							</span>
						</div>
						<div
							className={`${colorEnrollment(section.enrolled / section.enrolledMax)} ${
								styles.enrolled
							}`}
						>
							<img src={people} />
							{section.enrolled}/{section.enrolledMax}
						</div>
					</div>
				))
			) : (
				<div>There are no class sections for this course.</div>
			)}
		</div>
	);
};

export default CatalogViewSections;
