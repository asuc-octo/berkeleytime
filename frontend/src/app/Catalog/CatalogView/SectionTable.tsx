import { SectionFragment } from 'graphql';
import { CSSProperties, useMemo } from 'react';
import { formatSectionTime } from 'utils/sections/section';
import { colorEnrollment, formatEnrollment } from '../service';
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
import clsx from 'clsx';

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
	const [lectures, discussions, labs] = useMemo(() => {
		if (!sections) return [null, null, null];

		const lectures = sections.filter((section) => section.kind === 'Lecture');
		const discussions = sections.filter((section) => section.kind === 'Discussion');
		const labs = sections.filter((section) => section.kind === 'Laboratory');

		return [lectures, discussions, labs];
	}, [sections]);

	if (!sections || sections.length === 0) {
		return (
			<Skeleton
				className={styles.sectionItem}
				count={6}
				height={65}
				style={{ marginBottom: '10px' }}
			/>
		);
	}

	return (
		<div className={styles.sectionRoot}>
			<div className={styles.sectionItem}>
				<h5>Lectures</h5>
				{lectures &&
					lectures.map((section) => {
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
									<span className={clsx(color, styles.enrolled)}>
										<Group width={16} height={24} />
										{section.enrolled}/{section.enrolledMax} Enrolled
									</span>
									•<span className={clsx(styles.enrolled)}>CCN: {section.ccn}</span>
								</div>
							</div>
						);
					})}
			</div>
			<div className={styles.sectionItem}>
				<h5>Discussions</h5>
				{discussions &&
					discussions.map((section) => {
						const color = colorEnrollment(section.enrolled / section.enrolledMax);

						return (
							<>
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
								{/* <div className={styles.separator} /> */}
							</>
						);
					})}
			</div>

			{/* {sections.length > 0 ? (
				sections.map((section) => {
					const color = colorEnrollment(section.enrolled / section.enrolledMax);
					const enrolledPercent = formatEnrollment(section.enrolled / section.enrolledMax);
					return (
						<div
							className={styles.sectionItem}
							style={findInstructor(section.instructor)}
							key={section.ccn}
						>
							<div className={styles.sectionContainer}>
								<div className={styles.sectionLeft}>
									<h6>{section.kind}</h6>
									<span className={styles.instructor}>
										<span>
											<User width={16} height={24} />
										</span>
										{section.instructor?.toLowerCase() || 'unknown'}
									</span>
									<span className={styles.instructor}>{section.waitlisted} Waitlisted</span>
								</div>

								<div className={styles.sectionRight}>
									<span className={clsx(color, styles.enrolled)}>
										<Group width={16} height={24} />
										{section.enrolled}/{section.enrolledMax}
									</span>

									<span>
										<PinAlt width={16} height={24} />
										{section.locationName || 'Unknown'}
									</span>

									<span>
										<Clock width={16} height={24} />
										{section.wordDays} {formatSectionTime(section)}
									</span>
								</div>
							</div>
						</div>
					);
				})
			) : (
				<div>There are no class sections for this course.</div>
			)} */}
		</div>
	);
};

export default SectionTable;
