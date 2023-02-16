import { SectionFragment } from 'graphql';
import { CSSProperties } from 'react';
import { formatSectionTime } from 'utils/sections/section';
import people from 'assets/svg/catalog/people.svg';

import denero from 'assets/img/eggs/denero.png';
import hug from 'assets/img/eggs/hug.png';
import hilf from 'assets/img/eggs/hilf.png';
import sahai from 'assets/img/eggs/sahai.png';
import scott from 'assets/img/eggs/scott.png';
import kubi from 'assets/img/eggs/kubi.png';
import garcia from 'assets/img/eggs/garcia.png';

import styles from './CatalogView.module.scss';

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

function colorEnrollment(percentage: number) {
	const pct = percentage * 100;
	if (pct < 33) {
		return 'enrollment-first-third';
	} else if (pct < 67) {
		return 'enrollment-second-third';
	} else {
		return 'enrollment-last-third';
	}
}

type Props = {
	sections: SectionFragment[];
};

const CatalogViewSections = ({ sections }: Props) => {
	return (
		<div className={styles.sectionRoot}>
			{sections.map((section) => {
				return (
					<div
						className={styles.sectionItem}
						style={findInstructor(section.instructor)}
						key={section.ccn}
					>
						<div className={styles.sectionInfo}>
							<h5>
								<span>{section.kind}</span> - {section.locationName ? section.locationName : 'Unknown Location'}
							</h5>
							<h6>
								<span>{section.instructor ? section.instructor.toLowerCase() : 'instructor'}</span>,{' '}
								{section.wordDays} {formatSectionTime(section)}
							</h6>
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
				);
			})}
		</div>
	);
};

export default CatalogViewSections;
