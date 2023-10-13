/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useEffect, useMemo, useState } from 'react';
import people from 'assets/svg/catalog/people.svg';
import chart from 'assets/svg/catalog/chart.svg';
import book from 'assets/svg/catalog/book.svg';
import launch from 'assets/svg/catalog/launch.svg';
import { ReactComponent as BackArrow } from 'assets/img/images/catalog/backarrow.svg';
import { applyIndicatorPercent, applyIndicatorGrade, formatUnits } from 'utils/utils';
import { PlaylistType, useGetCourseForNameLazyQuery } from 'graphql';
import { useHistory, useParams } from 'react-router';
import { sortSections } from 'utils/sections/sort';
import Skeleton from 'react-loading-skeleton';
import ReadMore from './ReadMore';

import styles from './CatalogView.module.scss';
import { useSelector } from 'react-redux';
import SectionTable from './SectionTable';
import useCatalog, { CatalogActions } from '../useCatalog';
import { sortPills } from '../service';
import CatalogViewSections from './__new_SectionTable';

const skeleton = [...Array(8).keys()];

const CatalogView = () => {
	const [{ course }, dispatch] = useCatalog();
	const [isOpen, setOpen] = useState(false);
	const history = useHistory();
	const { abbreviation, courseNumber, semester } = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const legacyId = useSelector(
		(state: any) =>
			state.enrollment?.context?.courses?.find(
				(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
			)?.id ?? null
	);

	const [getCourse, { data, loading }] = useGetCourseForNameLazyQuery({
		onCompleted: (data) => {
			const course = data.allCourses.edges[0].node;
			if (course) {
				dispatch({ type: CatalogActions.SetCourse, course });
				setOpen(true);
			}
		}
	});

	useEffect(() => {
		const [sem, year] = semester?.split(' ') ?? [null, null];

		if (!abbreviation || !courseNumber) setOpen(false);

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
		const newCourse = data?.allCourses.edges[0].node;

		if (newCourse && newCourse?.id === course?.id) {
			dispatch({ type: CatalogActions.SetCourse, course: newCourse });
			setOpen(true);
		} else if (course) {
			dispatch({ type: CatalogActions.SetCourse, course });
			setOpen(true);
		}
	}, [course, data, dispatch]);

	const [playlists, sections] = useMemo(() => {
		let playlists = null;
		let sections = null;

		if (course?.playlistSet)
			playlists = sortPills(course.playlistSet.edges.map((e) => e.node as PlaylistType));

		if (course?.sectionSet) sections = sortSections(course.sectionSet.edges.map((e) => e.node));

		return [playlists ?? skeleton, sections];
	}, [course]);

	const enrollPath = legacyId
		? `/enrollment/0-${legacyId}-${semester.replace(' ', '-')}-all`
		: `/enrollment`;

	const gradePath = legacyId ? `/grades/0-${legacyId}-all-all` : `/grades`;

	return (
		<div className={`${styles.root}`} data-modal={isOpen}>
			<button
				className={styles.modalButton}
				onClick={() => {
					dispatch({ type: CatalogActions.SetCourse, course: null });
					history.replace(`/catalog/${semester}`);
				}}
			>
				<BackArrow />
				Back to Courses
			</button>
			{course && (
				<>
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
							{course.gradeAverage !== -1 ? (
								<div>
									{applyIndicatorGrade(course.letterAverage)}
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
									<span
										className={styles.pill}
										key={req.id}
										onClick={() => dispatch({ type: CatalogActions.SetPill, pillItem: req })}
									>
										{req.name}
									</span>
								)
							)}
						</div>
					</div>
					<ReadMore>
						{course?.description ?? ''}
						<>
							<h6>Prerequisites</h6>
							<p>
								{course.prerequisites !== ''
									? course.prerequisites
									: 'There is no information on the prerequisites of this course.'}
							</p>
						</>
					</ReadMore>
					<h5>Class Times - {semester ?? ''}</h5>
					{/* {sections && sections.length > 0 ? (
						<SectionTable sections={sections} />
					) : !loading ? (
						<span>There are no class times for the selected course.</span>
					) : null} */}


					{/* Redesigned catalog sections */}
					<CatalogViewSections sections={sections} />


					{/* Good feature whenever we want...
					<h5>Past Offerings</h5>
					<section className={styles.pills}>
						{pastSemesters ? (
							pastSemesters.map((req) => (
								<button
									className={styles.pill}
									key={req.id}
									onClick={() =>
										navigate(`/catalog/${req.name}/${course.abbreviation}/${course.courseNumber}`)
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
				</>
			)}
		</div>
	);
};

export default memo(CatalogView);
