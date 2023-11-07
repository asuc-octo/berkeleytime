import { SectionFragment } from 'graphql';
import { Clock, Group } from 'iconoir-react';
import { colorEnrollment } from '../service';
import { formatSectionTime } from 'utils/sections/section';


import denero from 'assets/img/eggs/denero.png';
import hug from 'assets/img/eggs/hug.png';
import hilf from 'assets/img/eggs/hilf.png';
import sahai from 'assets/img/eggs/sahai.png';
import scott from 'assets/img/eggs/scott.png';
import kubi from 'assets/img/eggs/kubi.png';
import garcia from 'assets/img/eggs/garcia.png';

import styles from './CatalogView.module.scss';
import { CSSProperties } from 'react';

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

interface SectionTableItem {
	section: SectionFragment;
}

const SectionTableItem = ({ section }: SectionTableItem) => {
	const color = colorEnrollment(section.enrolled / section.enrolledMax);

	return (
		<div className={styles.sectionContainer} key={section.ccn}>
			<h6>{section.locationName || 'Unknown Location'}</h6>
			<div className={styles.sectionFooter}>
				<span>
					<Clock width={16} height={24} />
					{section.wordDays} {formatSectionTime(section)}
				</span>
				•
				<span className={color}>
					<Group width={16} height={24} />
					{section.enrolled}/{section.enrolledMax} Enrolled
				</span>
				•<span>CCN: {section.ccn}</span>
			</div>
		</div>
	);
};

export default SectionTableItem;
