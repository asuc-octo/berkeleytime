import { Dispatch, memo, SetStateAction, useEffect, useMemo, useState } from 'react';
import people from 'assets/svg/catalog/people.svg';
import chart from 'assets/svg/catalog/chart.svg';
import book from 'assets/svg/catalog/book.svg';
import launch from 'assets/svg/catalog/launch.svg';
import { ReactComponent as BackArrow } from 'assets/img/images/catalog/backarrow.svg';
import catalogService from '../service';
import { applyIndicatorPercent, applyIndicatorGrade, formatUnits } from 'utils/utils';
import { CourseFragment, PlaylistType, useGetCourseForNameLazyQuery } from 'graphql';
import { CurrentFilters } from 'app/Catalog/types';
import { useHistory, useParams } from 'react-router';
import { sortSections } from 'utils/sections/sort';
import Skeleton from 'react-loading-skeleton';
import ReadMore from './ReadMore';
import styles from './CatalogView.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import BTLoader from 'components/Common/BTLoader';
import { enrollReset, fetchEnrollContext, fetchEnrollData, fetchEnrollFromUrl, fetchGradeContext, fetchGradeData, fetchGradeFromUrl, gradeReset } from 'redux/actions';
import axios from 'axios';
import store from 'redux/store';
import CatalogTabs from './CatalogTabs';
import { State } from '../types';

interface CatalogViewProps {
	coursePreview: CourseFragment | null;
	setCurrentCourse: Dispatch<SetStateAction<CourseFragment | null>>;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
}

const skeleton = [...Array(8).keys()];


const CatalogView = (props: CatalogViewProps) => {

	const { coursePreview, setCurrentFilters, setCurrentCourse} = props;
	const { abbreviation, courseNumber, semester } = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const dispatch = useDispatch();

	const [course, setCourse] = useState<CourseFragment | null>(coursePreview);
	const [isOpen, setOpen] = useState(false);

	const history = useHistory();

	const legacyId = useSelector(
		(state: any) =>
			state.enrollment?.context?.courses?.find(
				(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
			)?.id ?? null
	);

	const enrollPath = legacyId
		? `/enrollment/0-${legacyId}-${semester.replace(' ', '-')}-all`
		: `/enrollment`;

	const gradePath = legacyId ? `/grades/0-${legacyId}-all-all` : `/grades`;

	const [getCourse, { data, loading }] = useGetCourseForNameLazyQuery({
		onCompleted: (data) => {
			const course = data.allCourses.edges[0].node;
			if (course) {
				setCourse(course);
				setOpen(true);
			}
		}
	});

	useEffect(() => {
		if (!abbreviation || !courseNumber) {
			setOpen(false);
		}
	}, [abbreviation, courseNumber]);

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
		const course = data?.allCourses.edges[0].node;

		if (course && course?.id === coursePreview?.id) {
			setCourse(course);
			setOpen(true);
		} else if (coursePreview) {
			setCourse(coursePreview);
			setOpen(true);
		}
	}, [coursePreview, data]);
	
	
	useEffect(() => {
		if (course !== null) {	
			if (false && legacyId !== null) {		
				dispatch(gradeReset())
				dispatch(enrollReset())
				dispatch(fetchEnrollContext());
				dispatch(fetchGradeContext());
				// let temp = semester.split(' ');
				// dispatch(fetchGradeFromUrl(`/grades/0-${legacyId}-all-all`));
				// axios.get(`/api/enrollment/sections/${legacyId}/`).then((res) => {
				// 	dispatch(fetchEnrollFromUrl(`/enrollment/0-${legacyId}-${temp[0]}-${temp[1]}-${res.data[0].sections[0].section_id}`))
				// 	});	
			} else {
				dispatch(gradeReset())
				dispatch(enrollReset())
				dispatch(fetchEnrollContext());
				dispatch(fetchGradeContext());
			}
		}
	}, [course?.courseNumber]);


	const gradesData = useSelector((state: State) => state.grade?.gradesData ?? null);
	
	//may need in the future if graphs are rewritten
	const enrollmentData = useSelector((state: State) => state.enrollment?.enrollmentData ?? null);
	
	const gradesGraphData = useSelector((state: State) => state.grade.graphData ?? null);
	
	//may need in the future if graphs are rewritten
	const enrollGraphData = useSelector((state: State) => state.enrollment.graphData ?? null);
	
	const gradesSelectedCourses = useSelector((state: State) => state.grade.selectedCourses ?? null);
	
	const enrollSelectedCourses = useSelector((state: State) => state.enrollment.selectedCourses ?? null);
	
	//may need in the future if graphs are rewritten
	const enrollContext = useSelector((state: State) => state.enrollment.context.courses ?? null);

	useEffect(() => {
		console.log(courseNumber)
		if (course !== null) {
			if (legacyId !== null) {	
				setTab(0)	
				dispatch(gradeReset())
				dispatch(enrollReset())
				dispatch(fetchEnrollContext());
				dispatch(fetchGradeContext());
				
				if (legacyId !== null) {
					let temp = semester.split(' ');
					dispatch(fetchGradeFromUrl(`/grades/0-${legacyId}-all-all`));
					axios.get(`/api/enrollment/sections/${legacyId}/`).then((res) => {
						dispatch(fetchEnrollFromUrl(`/enrollment/0-${legacyId}-${temp[0]}-${temp[1]}-${res.data[0].sections[0].section_id}`))
						});
				}
			} else {
				setTab(0)	
				dispatch(gradeReset())
				dispatch(enrollReset())
				dispatch(fetchEnrollContext());
				dispatch(fetchGradeContext());

				let legacyId = (store.getState() as any).enrollment?.context?.courses?.find(
					(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
				)?.id ?? null
				
				if (legacyId !== null) {
					let temp = semester.split(' ');
					dispatch(fetchGradeFromUrl(`/grades/0-${legacyId}-all-all`));
					axios.get(`/api/enrollment/sections/${legacyId}/`).then((res) => {
						dispatch(fetchEnrollFromUrl(`/enrollment/0-${legacyId}-${temp[0]}-${temp[1]}-${res.data[0].sections[0].section_id}`))
						});
				}
			}
		}
	}, [course?.courseNumber]);
	

	useEffect(() => {
		//console.log(gradesSelectedCourses)
		if (course !== null) {
			if (gradesSelectedCourses?.length == 1) {
				dispatch(fetchGradeData(gradesSelectedCourses));
			}
		}
	}, [gradesSelectedCourses])

	useEffect(() => {
		if (course !== null) {
			if (enrollSelectedCourses?.length == 1) {
				dispatch(fetchEnrollData(enrollSelectedCourses));
			}
		}
	}, [enrollSelectedCourses])


	const [playlists, sections, links] = useMemo(() => {
		let playlists = null;
		let sections = null;
		// let semesters = null;

		if (course?.playlistSet) {
			const { edges } = course.playlistSet;
			playlists = catalogService.sortPills(edges.map((e) => e.node as PlaylistType));

			// semesters = catalogService.sortSemestersByLatest(
			// 	edges.map((e) => e.node).filter((n) => n.category === 'semester')
			// );
		}

		if (course?.sectionSet) {
			const { edges } = course.sectionSet;
			sections = sortSections(edges.map((e) => e.node));
		}


		let links:string[] = catalogService.getLinks(sections, semester, abbreviation, courseNumber);

		// return [playlists ?? skeleton, sections ?? [], semesters];
		return [playlists ?? skeleton, sections ?? null, links ?? null];
	}, [course]);

	const [tab, setTab] = useState<Number>(0);

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

	return (
		<div className={`${styles.root}`} data-modal={isOpen}>
			{course && (
				<>
					<button
						className={styles.modalButton}
						onClick={() => {
							setCurrentCourse(null);
							setCourse(null);
							history.replace(`/catalog/${semester}`);
						}}
					>
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
							{course.gradeAverage !== -1 ? (
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
					{loading ? 
						<BTLoader></BTLoader> 
						:
						<div>
						
							{<CatalogTabs 
								tab={tab} 
								semester={semester} 
								course={course} 
								sections={sections} 
								links={links} 
								loading={loading} 
								gradesGraphData={gradesGraphData} 
								gradesData={gradesData} 
								setTab={setTab} />}

							{/*
							Redesigned catalog sections
							<CatalogViewSections sections={sections} />
							*/
							/* Good feature whenever we want...
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
					}
				</>
			)}
		</div>
	);
};


export default (memo(CatalogView));

