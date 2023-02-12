import { memo, useEffect, useMemo, useState } from 'react';

import people from 'assets/svg/catalog/people.svg';
import chart from 'assets/svg/catalog/chart.svg';
import book from 'assets/svg/catalog/book.svg';
import launch from 'assets/svg/catalog/launch.svg';

import { applyIndicatorPercent, applyIndicatorGrade, formatUnits } from 'utils/utils';
import { CourseFragment, CourseOverviewFragment, useGetCourseForNameLazyQuery } from 'graphql';
import SectionTable from 'components/ClassDescription/SectionTable';
import BTLoader from 'components/Common/BTLoader';
import { courseToName } from 'utils/courses/course';
import { CurrentCourse } from 'app/Catalog/types';
import { useParams } from 'react-router';
import { sortByName } from './service';

import styles from './Catalog.module.scss';

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

	const [getCourse, { loading, error }] = useGetCourseForNameLazyQuery({
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

	const playlists = useMemo(
		() => sortByName((course as CourseFragment)?.playlistSet?.edges?.map((e) => e.node) ?? []),
		[course]
	);

	const sections = useMemo(
		() => (course as CourseFragment)?.sectionSet?.edges?.map((e) => e.node) ?? [],
		[course]
	);

	// TODO
	if (loading) {
		return (
			<div className="catalog-description-container">
				{error ? (
					<div className="loading">A critical error occured loading the data.</div>
				) : (
					loading && <BTLoader fill />
				)}
			</div>
		);
	}

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
	let morePrereq: boolean | null = null;

	if (course?.__typename === 'CourseType') {
		// No idea how this works, but this is what
		// handles the 'Read More' functionality.
		if (readMore) {
			// expand
			if (course.prerequisites) {
				prereqs = checkOverridePrereqs(course.prerequisites);
				morePrereq = false;
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
					morePrereq = true;
				} else if (descRows === 0 && prereqs.length > 2 * charsPerRow) {
					prereqs = prereqs.slice(0, 2 * charsPerRow - moreOffset) + '...';
					morePrereq = true;
				}
			}
		}
	}

	// Render the contents of the catalog
	return (
		<div className={`catalog-description-container ${styles.catalogViewRoot}`}>
			<div className="catalog-description">
				<section>
					<h3>
						{course.abbreviation} {course.courseNumber}
					</h3>
					<h6>{course.title}</h6>
					<div className="stats">
						<div className="statline">
							<img src={people} alt="" />
							Enrolled: &nbsp;
							{course.enrolled !== -1 ? (
								<div className="statline-div">
									{applyIndicatorPercent(
										`${course.enrolled}/${course.enrolledMax}`,
										course.enrolledPercentage
									)}
									&nbsp;
									<a
										// href={toEnrollment.pathname}
										// eslint-disable-next-line react/jsx-no-target-blank
										target="_blank"
										rel="noreferrer"
										className="statlink"
									>
										<img src={launch} alt="" />
									</a>
								</div>
							) : (
								' N/A '
							)}
						</div>
						<div className="statline">
							<img src={chart} alt="" />
							Average Grade: &nbsp;
							{course.gradeAverage !== -1 ? (
								<div
									className="statline-div"
									title={
										course.gradeAverage
											? `Avg Grade: ${(course.gradeAverage * 25).toFixed(1)}%`
											: undefined
									}
								>
									{applyIndicatorGrade(course.letterAverage, course.letterAverage)} &nbsp;
									<a href={toGrades.pathname} target="_blank" rel="noreferrer" className="statlink">
										<img src={launch} alt="" />
									</a>
								</div>
							) : (
								' N/A '
							)}
						</div>
						<div className="statline">
							<img src={book} alt="" />
							{formatUnits(course.units)}
						</div>
					</div>
				</section>
				<section className="pill-container description-section">
					{playlists &&
						playlists.map((req) => (
							<div className="pill" key={req.id}>
								{req.name}
							</div>
						))}
				</section>
				{description.length > 0 && (
					<section>
						<p className="description">
							{description}
							{moreDesc != null && (
								<span onClick={() => setReadMore(moreDesc)}>
									{' '}
									{moreDesc ? ' See more' : ' See less'}
								</span>
							)}
						</p>
					</section>
				)}
				{prereqs.length > 0 && (
					<section className="prereqs">
						<h6>Prerequisites</h6>
						<p>
							{prereqs}
							{morePrereq != null && (
								<span onClick={() => setReadMore(morePrereq)}>
									{' '}
									{morePrereq ? ' See more' : ' See less'}
								</span>
							)}
						</p>
					</section>
				)}
				<section>
					<h5>Class Times</h5>
				</section>
				<section className="table-container description-section">
					<div>
						{sections && (
							<>
								{sections.length === 0 ? (
									<div className="table-empty">
										This class has no sections for the selected semester.
									</div>
								) : (
									<SectionTable sections={sections} />
								)}
							</>
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default memo(CatalogView);
