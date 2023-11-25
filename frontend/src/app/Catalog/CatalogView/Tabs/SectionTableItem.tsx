import { SectionFragment } from 'graphql';
import { Clock, Group, User } from 'iconoir-react';
import { colorEnrollment } from '../../service';
import { formatSectionTime } from 'utils/sections/section';

import denero from 'assets/img/eggs/denero.png';
import hug from 'assets/img/eggs/hug.png';
import hilf from 'assets/img/eggs/hilf.png';
import sahai from 'assets/img/eggs/sahai.png';
import scott from 'assets/img/eggs/scott.png';
import kubi from 'assets/img/eggs/kubi.png';
import garcia from 'assets/img/eggs/garcia.png';

import styles from '../CatalogView.module.scss';
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
		<div
			className={styles.sectionItem}
			style={findInstructor(section.instructor)}
			key={section.ccn}
		>
			<div className={styles.sectionLeft}>
				<h6>{section.locationName || 'Unknown Location'}</h6>
				<span>
					<User width={16} height={24} />{' '}
					{section.instructor?.toLowerCase() || 'unknown instructor'}
				</span>
			</div>
			<div className={styles.sectionRight}>
				<h6 className={color}>
					<Group width={16} height={24} />
					{section.enrolled}/{section.enrolledMax} Enrolled
				</h6>
				<span>
					<Clock width={16} height={24} />
					{section.wordDays} {formatSectionTime(section)}
				</span>
			</div>
		</div>
	);
};

export default SectionTableItem;
