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
import { CurrentCourse, CurrentFilters } from 'app/Catalog/types';
import { useHistory, useParams } from 'react-router';
import { sortByName } from '../service';
import { sortSections } from 'utils/sections/sort';

import styles from './CatalogView.module.scss';
import { useSelector } from 'react-redux';

interface CatalogViewProps {
	coursePreview: CourseOverviewFragment | null;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
}

const CatalogView = (props: CatalogViewProps) => {
	const { coursePreview, setCurrentFilters } = props;
	const history = useHistory();
	const { abbreviation, courseNumber, semester } = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const [course, setCourse] = useState<CurrentCourse>(coursePreview);

	const legacyId = useSelector((state: any) => {
		return (
			state.enrollment?.context?.courses?.find(
				(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
			)?.id ?? null
		);
	});

	const [getCourse, { error }] = useGetCourseForNameLazyQuery({
		onCompleted: (data) => {
			const course = data.allCourses.edges[0].node;
			if (course) {
				setCourse((prev) => ({ ...prev, ...course }));
			}
		}
	});

	useEffect(() => {
		const [sem, year] = semester?.split(' ') ?? [null, null];

		const variables = {
			abbreviation: abbreviation ?? null,
			courseNumber: courseNumber ?? null,
			semester: sem?.toLowerCase() ?? null,
			year: year
		};

		// Only fetch the course if every parameter has a value.
		if (Object.values(variables).every((value) => value !== null)) getCourse({ variables });
	}, [getCourse, abbreviation, courseNumber, semester]);

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

		return [sortByName(playlists ?? []), sections ?? [], semesters];
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

	const enrollPath = legacyId
		? `/enrollment/0-${legacyId}-${semester.replace(' ', '-')}-all`
		: `/enrollment`;

	const gradePath = legacyId ? `/grades/0-${legacyId}-all-all` : `/grades`;

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
							<a href={enrollPath} target="_blank" rel="noreferrer" className={styles.statLink}>
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
							<a href={gradePath} target="_blank" rel="noreferrer" className={styles.statLink}>
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
			{course.description.length > 0 && (
				<p className={styles.description}>
					<ReadMore>{course.description}</ReadMore>
				</p>
			)}
			<h5>Prerequisites</h5>
			{course.__typename === 'CourseType' && (
				<p>
					{course.prerequisites || 'There is no information on the prerequisites of this course.'}
				</p>
			)}
			<h5>Class Times - {semester ?? ''}</h5>
			{sections.length > 0 ? (
				<CatalogViewSections sections={sections} />
			) : (
				<div>This class has no sections for the selected semester.</div>
			)}
			<h5>Past Offerings</h5>
			<section className={styles.pills}>
				{pastSemesters ? (
					pastSemesters.map((req) => (
						<button
							className={styles.pill}
							key={req.id}
							onClick={() =>
								history.push(`/catalog/${req.name}/${course.abbreviation}/${course.courseNumber}`)
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

const ReadMore = ({ children }: { children: string }) => {
	const [isReadMore, setIsReadMore] = useState(true);
	return (
		<>
			{children.length > 150 ? (
				<>
					{isReadMore ? children.slice(0, 150) + '...' : children}
					<span onClick={() => setIsReadMore((prev) => !prev)}>
						{isReadMore ? 'See more' : 'See less'}
					</span>
				</>
			) : (
				children
			)}
		</>
	);
};

export default memo(CatalogView);
