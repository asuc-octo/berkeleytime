import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react';
import people from 'assets/svg/catalog/people.svg';
import chart from 'assets/svg/catalog/chart.svg';
import book from 'assets/svg/catalog/book.svg';
import launch from 'assets/svg/catalog/launch.svg';
import { ReactComponent as BackArrow } from 'assets/img/images/catalog/backarrow.svg';
import catalogService from '../service';
import { applyIndicatorPercent, applyIndicatorGrade, formatUnits } from 'utils/utils';
import { CourseFragment, PlaylistType, useGetCourseForNameLazyQuery } from 'graphql';
import CatalogViewSections from './CatalogViewSections';
import { CurrentFilters } from 'app/Catalog/types';
import { useParams } from 'react-router';
import { sortSections } from 'utils/sections/sort';
import Skeleton from 'react-loading-skeleton';

import styles from './CatalogView.module.scss';
import { useSelector } from 'react-redux';

interface CatalogViewProps {
	coursePreview: CourseFragment | null;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
}

const skeleton = [...Array(8).keys()];

const CatalogView = (props: CatalogViewProps) => {
	const { coursePreview, setCurrentFilters } = props;
	const { abbreviation, courseNumber, semester } = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const [course, setCourse] = useState<CourseFragment | null>(coursePreview);
	const legacyId = useSelector((state: any) => {
		return (
			state.enrollment?.context?.courses?.find(
				(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
			)?.id ?? null
		);
	});

	const [getCourse, { error, loading }] = useGetCourseForNameLazyQuery({
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

	const [playlists, sections] = useMemo(() => {
		let playlists = null;
		let sections = null;
		// let semesters = null;

		if (course?.playlistSet) {
			const { edges } = course.playlistSet;
			playlists = catalogService.sortPills(
				edges.map((e) => e.node as PlaylistType).filter((n) => n.category !== 'semester')
			);

			// semesters = catalogService.sortSemestersByLatest(
			// 	edges.map((e) => e.node).filter((n) => n.category === 'semester')
			// );
		}

		if (course?.sectionSet) {
			const { edges } = course.sectionSet;
			sections = sortSections(edges.map((e) => e.node));
		}

		// return [playlists ?? skeleton, sections ?? [], semesters];
		return [playlists ?? skeleton, sections ?? null];
	}, [course]);

	const handlePill = (pillItem: PlaylistType) => {
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

	if (!course) return null;

	return (
		<div className={`${styles.root}`} data-modal={course !== null}>
			<button className={styles.modalButton} onClick={() => setCourse(null)}>
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
						<div>N/A</div>
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
						<div>N/A</div>
					)}
				</div>
				<div className={styles.statLine}>
					<img src={book} alt="" />
					{formatUnits(course?.units)}
				</div>
			</div>
			<div className={styles.pills}>
				<div>
					{playlists?.map((req) =>
						typeof req === 'number' ? (
							<Skeleton key={req} className={styles.pill} width={75} />
						) : (
							<span className={styles.pill} key={req.id} onClick={() => handlePill(req)}>
								{req.name}
							</span>
						)
					)}
				</div>
			</div>
			<ReadMore>
				{course.description !== '' ? course.description : 'This course has no description.'}
			</ReadMore>
			<h6>Prerequisites</h6>
			{loading ? (
				<Skeleton />
			) : (
				<ReadMore>
					{(course as CourseFragment)?.prerequisites ||
						'There is no information on the prerequisites of this course.'}
				</ReadMore>
			)}
			<h5>Class Times - {semester ?? ''}</h5>
			<CatalogViewSections sections={sections} />

			{/* TODO: DONT DELETE
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
					<Skeleton
						style={{ marginRight: '5px' }}
						inline
						count={10}
						width={80}
						height={28}
						borderRadius={12}
					/>
				)}
			</section> */}
		</div>
	);
};

const ReadMore = ({ children }: { children: string }) => {
	const [isReadMore, setIsReadMore] = useState(true);
	return (
		<p className={styles.description}>
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
		</p>
	);
};

export default memo(CatalogView);
