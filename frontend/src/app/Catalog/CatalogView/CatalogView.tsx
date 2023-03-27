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
import { Tabs, Tab, Col } from 'react-bootstrap';
import styles from './CatalogView.module.scss';
import { connect, useDispatch, useSelector, MapStateToProps } from 'react-redux';
import SectionTable from './SectionTable';
import { getLatestSemester, Semester } from 'utils/playlists/semesters';
import EnrollmentGraphCard from 'components/GraphCard/EnrollmentGraphCard';
import GradesGraphCard from 'components/GraphCard/GradesGraphCard';
import { gradeReset, enrollReset, fetchGradeContext, fetchEnrollContext, fetchGradeFromUrl, fetchEnrollFromUrl, fetchGradeData, fetchEnrollData } from 'redux/actions';
import GradesGraph from 'components/Graphs/GradesGraph';
import axios from 'axios';
import BTLoader from 'components/Common/BTLoader';
import store from 'redux/store';
import EnrollmentGraph from 'components/Graphs/EnrollmentGraph';

interface CatalogViewProps {
	coursePreview: CourseFragment | null;
	setCurrentCourse: Dispatch<SetStateAction<CourseFragment | null>>;
	setCurrentFilters: Dispatch<SetStateAction<CurrentFilters>>;
	gradesData:any;
	enrollmentData:any;
	gradesGraphData:any;
	enrollGraphData:any;
	gradesSelectedCourses:any;
	enrollSelectedCourses:any;
	enrollContext:any;
}

const skeleton = [...Array(8).keys()];

var dict = new Map([
	['Field Work', 'FLD'],
	['Session', 'SES'],
	['Colloquium', 'COL'],
	['Recitation', 'REC'],
	['Internship', 'INT'],
	['Studio', 'STD'],
	['Demonstration', 'dem'],
	['Web-based Discussion', 'WBD'],
	['Discussion', 'DIS'],
	['Tutorial', 'TUT'],
	['Clinic', 'CLN'],
	['Independent Study', 'IND'],
	['Self-paced', 'SLF'],
	['Seminar', 'SEM'],
	['Lecture', 'LEC'],
	['Web-based Lecture', 'WBL'],
	['Web-Based Lecture', 'WBL'],
	['Directed Group Study', 'GRP'],
	['Laboratory', 'LAB'],
  ]);

const CatalogView = (props: CatalogViewProps) => {

	const { coursePreview, setCurrentFilters, setCurrentCourse, gradesData, enrollmentData, gradesGraphData, enrollGraphData, gradesSelectedCourses, enrollSelectedCourses, enrollContext } = props;
	const { abbreviation, courseNumber, semester } = useParams<{
		abbreviation: string;
		courseNumber: string;
		semester: string;
	}>();

	const dispatch = useDispatch();

	const [course, setCourse] = useState<CourseFragment | null>(coursePreview);
	const [isOpen, setOpen] = useState(false);

	const history = useHistory();

	var legacyId = useSelector(
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

	useEffect(() => {
		legacyId = (store.getState() as any).enrollment?.context?.courses?.find(
			(c: any) => c.abbreviation === abbreviation && c.course_number === courseNumber
		)?.id ?? null
		
		if (legacyId !== null) {
			let temp = semester.split(' ');
			dispatch(fetchGradeFromUrl(`/grades/0-${legacyId}-all-all`));
			axios.get(`/api/enrollment/sections/${legacyId}/`).then((res) => {
				dispatch(fetchEnrollFromUrl(`/enrollment/0-${legacyId}-${temp[0]}-${temp[1]}-${res.data[0].sections[0].section_id}`))
				});
		}
		
	}, [enrollContext])

	useEffect(() => {
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

		let links:any = [];
		if (sections !== null) {
			sections = sortSections(sections);
			for (var i = 0; i < sections.length; i++) {
				var stre = '';
				let temp = semester.split(' ');
				var punctuation = ',';
				var regex = new RegExp('[' + punctuation + ']', 'g');
				var rmc = abbreviation.replace(regex, '');
				stre = `https://classes.berkeley.edu/content/${temp[1]}
				-${temp[0]}
				-${rmc}
				-${courseNumber}
				-${sections[i].sectionNumber}
				-${dict.get(sections[i].kind)}
				-${sections[i].sectionNumber}`;
				stre = stre.replace(/\s+/g, '');
				links.push(stre);
			}
		}
		
		return [playlists ?? skeleton, sections ?? null, links ?? null];
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

	


	const [hoveredClass, setHoveredClass] = useState<any>(false);
	const [updateMobileHover, setUpdateMobileHover] = useState<any>(true);
	

	function update(course:any, grade:any) {
		const gradesData = (store.getState() as any).grade.gradesData;
		if (course && gradesData && gradesData.length > 0) {
			const selectedGrades = gradesData.filter((c:any) => course.id === c.id)[0];
			const hoverTotal = {
				...course,
				...selectedGrades,
				hoverGrade: grade
			};

			setHoveredClass(hoverTotal);
		}
	}

	// Handler function for updating GradesInfoCard on hover with single course
	function updateGraphHover(data:any) {
		const { isTooltipActive, activeLabel } = data;
		const selectedCourses = (store.getState() as any).grade.selectedCourses;

		const noBarMobile = updateMobileHover && window.innerWidth < 768;

		// Update the selected course if no bar is clicked if in mobile
		if (isTooltipActive && (selectedCourses.length === 1 || noBarMobile)) {
			const selectedCourse = selectedCourses[0];
			const grade = activeLabel;
			update(selectedCourse, grade);
		}

		// Update mobile hover records if there actually is a bar (then we only want updateBarHover to run)
		setUpdateMobileHover({ updateMobileHover: true });
	}

	const [tab, setTab] = useState<Number>(0)
	const openTab = () => {
													
		if (tab == 0) {
			return (
				<>
					<nav className={styles.tabContainer}>
						<button className={styles.tabButtonAct} onClick={() => setTab(0)}>{`Class Times - ${semester ?? ''}`}</button>
						<button className={styles.tabButton} onClick={() => setTab(1)}>Grades</button>
						<button className={styles.tabButton} onClick={() => setTab(2)}>Enrollment</button>
					</nav>
					{sections && sections.length > 0 ? (
						<div className={styles.gradesBox}>
							<SectionTable links={links} sections={sections} />
						</div>
					) : !loading ? (
						<span className={styles.gradesBox} >There are no class times for the selected course.</span>
					) : null}
				</>
			)
		} else if (tab == 1) {
			return (
				<>
					<nav className={styles.tabContainer}>
						<button className={styles.tabButton} onClick={() => setTab(0)}>{`Class Times - ${semester ?? ''}`}</button>
						<button className={styles.tabButtonAct} onClick={() => setTab(1)}>Grades</button>
						<button className={styles.tabButton} onClick={() => setTab(2)}>Enrollment</button>
					</nav>
					{gradesData?.length > 0 ? 
						<div className={styles.gradesBox}>
							<GradesGraph
								graphData={gradesGraphData}
								gradesData={gradesData}
								updateBarHover={null}
								updateGraphHover={updateGraphHover}
								course={course?.abbreviation+' '+course?.courseNumber}
								semester={'All Semesters'}
								instructor={'All Instructors'}
								selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
								denominator={hoveredClass.denominator}
								color={0}
								isMobile={window.innerWidth < 768 ? true : false}
								graphEmpty={false}
							/>
						</div>
						:
						<div>no grade data found</div>
					}
				</>
			)
		} else {
			return (
				<>	
					<nav className={styles.tabContainer}>
						<button className={styles.tabButton} onClick={() => setTab(0)}>{`Class Times - ${semester ?? ''}`}</button>
						<button className={styles.tabButton} onClick={() => setTab(1)}>Grades</button>
						<button className={styles.tabButtonAct} onClick={() => setTab(2)}>Enrollment</button>
					</nav>
					<div className={styles.gradesBox}>
						<EnrollmentGraphCard
							id="gradesGraph"
							title="Enrollment"
							updateClassCardEnrollment={() => {enrollReset()}}
							isMobile={window.innerWidth < 768 ? true : false}
						/>
					</div>
				</>
			)
		}
	}

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
						
							{openTab()}

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

const mapStateToProps = (state:any) => {
	const gradesData = state.grade.gradesData 
	const enrollmentData = state.enrollment.enrollmentData
	const gradesGraphData = state.grade.graphData 
	const enrollGraphData = state.enrollment.graphData 
	const gradesSelectedCourses = state.grade.selectedCourses
	const enrollSelectedCourses = state.enrollment.selectedCourses
	const enrollContext = state.enrollment.context.courses
	return {
		gradesData,
		enrollmentData,
		gradesGraphData,
		enrollGraphData,
		gradesSelectedCourses,
		enrollSelectedCourses,
		enrollContext
	};
};

export default connect(mapStateToProps)(memo(CatalogView));

