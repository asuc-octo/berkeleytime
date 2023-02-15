import { memo, useEffect, useMemo, useState } from 'react';

import people from 'assets/svg/catalog/people.svg';
import chart from 'assets/svg/catalog/chart.svg';
import book from 'assets/svg/catalog/book.svg';
import launch from 'assets/svg/catalog/launch.svg';
import catalogService from '../service';
import { applyIndicatorPercent, applyIndicatorGrade, formatUnits } from 'utils/utils';
import { CourseFragment, CourseOverviewFragment, useGetCourseForNameLazyQuery } from 'graphql';
import CatalogViewSections from './CatalogViewSections';
import BTLoader from 'components/Common/BTLoader';
import { courseToName } from 'utils/courses/course';
import { CurrentCourse } from 'app/Catalog/types';
import { useParams } from 'react-router';
import { sortByName } from '../service';

import styles from './CatalogView.module.scss';

interface CatalogViewProps {
	coursePreview: CourseOverviewFragment | null;
}

const CatalogView = (props: CatalogViewProps) => {
	const { coursePreview } = props;
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

	const playlists = useMemo(() => {
		if (course?.__typename === 'CourseType' && course?.playlistSet) {
			const { edges } = course.playlistSet;
			const playlists = edges.map((e) => e.node).filter((n) => n.category !== 'semester');
			return sortByName(playlists ?? []);
		}
		return null;
	}, [course]);

	const sections = useMemo(
		() => (course as CourseFragment)?.sectionSet?.edges?.map((e) => e.node) ?? [],
		[course]
	);

	const pastSemesters = useMemo(
		() =>
			(course as CourseFragment)?.playlistSet
				? catalogService.sortSemestersByLatest(
						(course as CourseFragment).playlistSet.edges
							?.map((e) => e.node)
							.filter((n) => n.category === 'semester')
				  )
				: null,
		[course]
	);

	// TODO
	if (!course) {
		return null;
	}

	const toGrades = {
		pathname: `/grades/0-${course.id}-all-all`,
		state: { course: course }
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
	let description = course?.description;
	let prereqs = '';
	let moreDesc: boolean | null = null;

	if (course?.__typename === 'CourseType') {
		// No idea how this works, but this is what
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

	return (
		<div className={`${styles.catalogViewRoot}`} data-modal={course !== null}>
			<button onClick={() => setCourse(null)} className={styles.modalButton}>
				<svg
					width="32"
					height="32"
					viewBox="0 0 32 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<circle cx="16" cy="16" r="16" fill="#C4C4C4" />
					<path
						d="M24 15H11.83L17.42 9.41L16 8L8 16L16 24L17.41 22.59L11.83 17H24V15Z"
						fill="white"
					/>
				</svg>
				Back to Courses{' '}
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
					{course.gradeAverage !== -1 ? (
						<div>
							{applyIndicatorGrade(course.letterAverage, course.letterAverage)}
							<a
								href={toGrades.pathname}
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
					{formatUnits(course.units)}
				</div>
			</div>
			<section className={styles.pillContainer}>
				{playlists ? (
					playlists.map((req) => (
						<div className={styles.pill} key={req.id}>
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
			{course?.__typename === 'CourseType' && (
				<>
					<h5>Prerequisites</h5>
					<p>
						{course?.prerequisites ||
							'There is no information on the prerequisites for this course.'}
					</p>
				</>
			)}
			<h5>Class Times</h5>
			<section className="table-container description-section">
				{sections && (
					<>
						{sections.length === 0 ? (
							<div className="table-empty">
								This class has no sections for the selected semester.
							</div>
						) : (
							<CatalogViewSections sections={sections} />
						)}
					</>
				)}
			</section>
			<h5>Past Offerings</h5>
			<section className={styles.pillContainer}>
				{pastSemesters ? (
					pastSemesters.map((req) => (
						<div className={styles.pill} key={req.id}>
							{req.name}
						</div>
					))
				) : (
					<BTLoader />
				)}
			</section>
			{error && <div>A critical error occured loading the data.</div>}
		</div>
	);
};

export default memo(CatalogView);
