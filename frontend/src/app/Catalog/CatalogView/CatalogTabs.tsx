import EnrollmentGraphCard from 'components/GraphCard/EnrollmentGraphCard';
import GradesGraph from 'components/Graphs/GradesGraph';
import { CourseFragment, SectionFragment } from 'graphql';
import catalogService from '../service';
import { useState } from 'react';
import { enrollReset } from 'redux/actions';
import store from 'redux/store';
import styles from './CatalogView.module.scss';
import SectionTable from './SectionTable';
import { useSelector } from 'react-redux';
import { State } from '../types';

interface CatalogTabsProps {
	semester: string;
	course: CourseFragment | null;
	sections: SectionFragment[] | null;
	loading: boolean;
	abbreviation: string;
	courseNumber: string;
}

const CatalogTabs = (props: CatalogTabsProps) => {
	const { semester, course, sections, loading, abbreviation, courseNumber } = props;

	const [hoveredClass, setHoveredClass] = useState<any>(false);
	const [updateMobileHover, setUpdateMobileHover] = useState<any>(true);
	const [tab, setTab] = useState<number>(0);

	const gradesGraphData = useSelector((state: State) => state.grade.graphData ?? null);
	const gradesData = useSelector((state: State) => state.grade?.gradesData ?? null);

	const links: string[] = catalogService.getLinks(sections, semester, abbreviation, courseNumber);

	function update(course: any, grade: any) {
		const gradesData = (store.getState() as any).grade.gradesData;
		if (course && gradesData && gradesData.length > 0) {
			const selectedGrades = gradesData.filter((c: any) => course.id === c.id)[0];
			const hoverTotal = {
				...course,
				...selectedGrades,
				hoverGrade: grade
			};

			setHoveredClass(hoverTotal);
		}
	}

	// Handler function for updating GradesInfoCard on hover with single course
	function updateGraphHover(data: any) {
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

	if (tab == 0) {
		return (
			<div>
				<nav className={styles.tabContainer}>
					<button className={styles.tabButtonAct} onClick={() => setTab(0)}>{`Class Times - ${
						semester ?? ''
					}`}</button>
					<button className={styles.tabButton} onClick={() => setTab(1)}>
						Grades
					</button>
					<button className={styles.tabButton} onClick={() => setTab(2)}>
						Enrollment
					</button>
				</nav>
				{sections && sections.length > 0 ? (
					<div className={styles.gradesBox}>
						<SectionTable links={links} sections={sections} />
					</div>
				) : !loading ? (
					<span className={styles.gradesBox}>
						There are no class times for the selected course.
					</span>
				) : null}
			</div>
		);
	} else if (tab == 1) {
		return (
			<>
				<nav className={styles.tabContainer}>
					<button className={styles.tabButton} onClick={() => setTab(0)}>{`Class Times - ${
						semester ?? ''
					}`}</button>
					<button className={styles.tabButtonAct} onClick={() => setTab(1)}>
						Grades
					</button>
					<button className={styles.tabButton} onClick={() => setTab(2)}>
						Enrollment
					</button>
				</nav>
				{gradesData?.length > 0 ? (
					<div className={styles.gradesBox}>
						<GradesGraph
							graphData={gradesGraphData}
							gradesData={gradesData}
							updateBarHover={null}
							updateGraphHover={updateGraphHover}
							course={course?.abbreviation + ' ' + course?.courseNumber}
							semester={'All Semesters'}
							instructor={'All Instructors'}
							selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
							denominator={hoveredClass.denominator}
							color={0}
							isMobile={window.innerWidth < 768 ? true : false}
							graphEmpty={false}
						/>
					</div>
				) : (
					<div>no grade data found</div>
				)}
			</>
		);
	} else {
		return (
			<>
				<nav className={styles.tabContainer}>
					<button className={styles.tabButton} onClick={() => setTab(0)}>{`Class Times - ${
						semester ?? ''
					}`}</button>
					<button className={styles.tabButton} onClick={() => setTab(1)}>
						Grades
					</button>
					<button className={styles.tabButtonAct} onClick={() => setTab(2)}>
						Enrollment
					</button>
				</nav>
				<div className={styles.gradesBox}>
					<EnrollmentGraphCard
						id="gradesGraph"
						title="Enrollment"
						updateClassCardEnrollment={() => {
							enrollReset();
						}}
						isMobile={window.innerWidth < 768 ? true : false}
					/>
				</div>
			</>
		);
	}
};

export default CatalogTabs;
