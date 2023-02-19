import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react';
import people from 'assets/svg/catalog/people.svg';
import chart from 'assets/svg/catalog/chart.svg';
import book from 'assets/svg/catalog/book.svg';
import launch from 'assets/svg/catalog/launch.svg';
import { ReactComponent as BackArrow } from 'assets/img/images/catalog/backarrow.svg';
import catalogService from '../service';
import { applyIndicatorPercent, applyIndicatorGrade, formatUnits } from 'utils/utils';
import { CourseOverviewFragment, useGetCourseForNameLazyQuery } from 'graphql';
import CatalogViewSections from './CatalogViewSections';
import BTLoader from 'components/Common/BTLoader';
import { courseToName } from 'utils/courses/course';
import { CurrentCourse, CurrentFilters } from 'app/Catalog/types';
import { useParams } from 'react-router';
import { sortByName } from '../service';
import { sortSections } from 'utils/sections/sort';

import styles from './CatalogView.module.scss';

interface CatalogViewProps {
	coursePreview: CourseOverviewFragment | null;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
}

const CatalogView = (props: CatalogViewProps) => {
	const { coursePreview, setCurrentFilters } = props;
	const [readMore, setReadMore] = useState<boolean | null>(false);
	const slug = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const [course, setCourse] = useState<CurrentCourse>(coursePreview);

	const [getCourse, { error }] = useGetCourseForNameLazyQuery({
		onCompleted: (data) => {
			const course = data.allCourses.edges[0].node;
			if (course) {
				setCourse((prev) => ({ ...prev, ...course }));
			}
		}
	});

	useEffect(() => {
		const variables = {
			abbreviation: slug?.abbreviation ?? null,
			courseNumber: slug?.courseNumber ?? null,
			year: slug?.semester?.split(' ')[1] ?? null,
			semester: slug?.semester?.split(' ')[0].toLowerCase() ?? null
		};

		// Only fetch the course if every parameter has a value.
		if (Object.values(variables).every((value) => value !== null)) getCourse({ variables });
	}, [slug, getCourse]);

	useEffect(() => {
		setCourse(coursePreview);
	}, [coursePreview]);

	const [playlists, sections, pastSemesters] = useMemo(() => {
		let playlists,
			sections,
			semesters = null;

		if (course?.__typename === 'CourseType') {
			if (course.playlistSet) {
				const { edges } = course.playlistSet;
				playlists = edges.map((e) => e.node).filter((n) => n.category !== 'semester');

				semesters = catalogService.sortSemestersByLatest(
					edges.map((e) => e.node).filter((n) => n.category === 'semester')
				);
			}

			if (course.sectionSet) {
				sections = sortSections(course.sectionSet.edges.map((e) => e.node));
			}
		}

		return [sortByName(playlists ?? []), sections, semesters];
	}, [course]);

	const handlePill = (pillItem: (typeof playlists)[number]) => {
		setCurrentFilters((prev) => {
			if (['haas', 'ls', 'engineering', 'university'].includes(pillItem.category)) {
				const reqs = prev.requirements;
				if (reqs?.find((el) => el.label === pillItem.name)) {
					return prev;
				}

				return {
					...prev,
					requirements: [...(reqs ?? []), { label: pillItem.name, value: pillItem }]
				};
			}

			return {
				...prev,
				[pillItem.category]: { label: pillItem.name, value: pillItem }
			};
		});
	};

	const checkOverridePrereqs = (prereqs: string) => {
		if (courseToName(course) === 'POL SCI 126A') {
			prereqs = 'No prerequisites. This field was modified as requested by the instructor.';
		}
		return prereqs;
	};

	// This is all 'Read more' logic.
	const charsPerRow = 80;
	const moreOffset = 15;
	let description = course?.description || '';
	let prereqs = '';
	let moreDesc: boolean | null = null;

	if (course?.__typename === 'CourseType') {
		// handles the 'Read More' functionality.
		if (readMore) {
			// expand
			if (course.prerequisites) {
				prereqs = checkOverridePrereqs(course.prerequisites);
			} else {
				moreDesc = false;
			}
		} else {
			// collapse
			const descRows = Math.round(course.description?.length / charsPerRow);
			if (descRows > 3 || (descRows === 3 && course.prerequisites)) {
				description = description.slice(0, 3 * charsPerRow - moreOffset) + '...';
				moreDesc = true;
			}
			if (descRows < 3 && course.prerequisites) {
				prereqs = checkOverridePrereqs(course.prerequisites);
				if (descRows >= 1 && prereqs.length > charsPerRow) {
					prereqs = prereqs.slice(0, charsPerRow - moreOffset) + '...';
				} else if (descRows === 0 && prereqs.length > 2 * charsPerRow) {
					prereqs = prereqs.slice(0, 2 * charsPerRow - moreOffset) + '...';
				}
			}
		}
	}

	return course ? (
		<div className={`${styles.catalogViewRoot}`} data-modal={course !== null}>
			<button onClick={() => setCourse(null)} className={styles.modalButton}>
				<BackArrow />
				Back to Courses
			</button>
			<h3>
				{course.abbreviation} {course.courseNumber}
			</h3>
			<h6>{course.title}</h6>
			<div className={styles.stats}>
				<div className={styles.statLine}>
					<img src={people} />
					Enrolled:
					{course.enrolled !== -1 ? (
						<div>
							{applyIndicatorPercent(
								`${course.enrolled}/${course.enrolledMax}`,
								course.enrolledPercentage
							)}
							<a
								// href={toEnrollment.pathname}
								target="_blank"
								rel="noreferrer"
								className={styles.statLink}
							>
								<img src={launch} alt="" />
							</a>
						</div>
					) : (
						'N/A'
					)}
				</div>
				<div className={styles.statLine}>
					<img src={chart} alt="" />
					Average Grade:
					{course && course.gradeAverage !== -1 ? (
						<div>
							{applyIndicatorGrade(course.letterAverage, course.letterAverage)}
							<a
								// href={toGrades.pathname}
								target="_blank"
								rel="noreferrer"
								className={styles.statLink}
							>
								<img src={launch} alt="" />
							</a>
						</div>
					) : (
						' N/A '
					)}
				</div>
				<div className={styles.statLine}>
					<img src={book} alt="" />
					{formatUnits(course?.units)}
				</div>
			</div>
			<section className={styles.pills}>
				{playlists.length > 0 ? (
					playlists.map((req) => (
						<div className={styles.pill} key={req.id} onClick={() => handlePill(req)}>
							{req.name}
						</div>
					))
				) : (
					<BTLoader />
				)}
			</section>
			{description.length > 0 && (
				<p className={styles.description}>
					{description}
					<span onClick={() => setReadMore((prev) => !prev)}>
						{moreDesc ? ' See more' : ' See less'}
					</span>
				</p>
			)}
			<h5>Prerequisites</h5>
			{course.__typename === 'CourseType' && (
				<p>
					{course.prerequisites || 'There is no information on the prerequisites of this course.'}
				</p>
			)}
			<h5>Class Times - {slug?.semester}</h5>
			<section className="table-container description-section">
				{sections ? (
					<CatalogViewSections sections={sections} />
				) : (
					<div className="table-empty">This class has no sections for the selected semester.</div>
				)}
			</section>
			<h5>Past Offerings</h5>
			<section className={styles.pills}>
				{pastSemesters ? (
					pastSemesters.map((req) => (
						<button
							className={styles.pill}
							key={req.id}
							onClick={() =>
								setCurrentFilters((prev) => ({
									...prev,
									semester: { label: req.name, value: req }
								}))
							}
						>
							{req.name}
						</button>
					))
				) : (
					<BTLoader />
				)}
			</section>
		</div>
	) : (
		<>{error && <div>A critical error occured loading the data.</div>}</>
	);
};

export default memo(CatalogView);
