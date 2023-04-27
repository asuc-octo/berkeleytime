import EnrollmentGraphCard from 'components/GraphCard/EnrollmentGraphCard';
import GradesGraph from 'components/Graphs/GradesGraph';
import { CourseFragment, GradeType, SectionFragment } from 'graphql';
import catalogService from '../service';
import { useState } from 'react';
import { enrollReset } from 'redux/actions';
import styles from './CatalogView.module.scss';
import SectionTable from './SectionTable';
import { useSelector } from 'react-redux';
import { State } from '../types';
import BTLoader from 'components/Common/BTLoader';

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

	const [hoveredClass, setHoveredClass] = useState<boolean>(false);
	const [updateMobileHover, setUpdateMobileHover] = useState<boolean>(true);
	const [tab, setTab] = useState<number>(0);

	const gradesGraphData = useSelector((state: State) => state.grade.graphData ?? null);
	const gradesData = useSelector((state: State) => state.grade?.gradesData ?? null);
	const selectedCourses = useSelector((state: State) => state.grade.selectedCourses ?? null);

	const links: string[] = catalogService.getLinks(sections, semester, abbreviation, courseNumber);

	function update(course: CourseFragment, grade: GradeType) {
		if (course && gradesData && gradesData.length > 0) {
			const selectedGrades = gradesData.filter((c: CourseFragment) => course.id === c.id)[0];
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

	const renderTabs = (currentTab: number) => {
		if (loading) {
			return <BTLoader />;
		}

		switch (currentTab) {
			case 0:
				return (
					<div className={styles.gradesBox}>
						{sections && sections.length > 0 ? (
							<SectionTable links={links} sections={sections} />
						) : (
							'There are no class times for the selected course.'
						)}
					</div>
				);

			case 1:
				return gradesData?.length > 0 ? (
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
					<div>There is no grade data found for the selected course.</div>
				);
			case 2:
				return (
					<div className={styles.gradesBox}>
						<EnrollmentGraphCard
							id="gradesGraph"
							title="Enrollment"
							updateClassCardEnrollment={enrollReset}
							isMobile={window.innerWidth < 768 ? true : false}
						/>
					</div>
				);
		}
	};

	return (
		<div>
			<nav className={styles.tabContainer}>
				{['Class Times', 'Grades', 'Enrollment'].map((title, index) => (
					<button
						key={title}
						className={`${styles.tabButton} ${tab === index && styles.selected}`}
						onClick={() => setTab(index)}
					>
						{title}
					</button>
				))}
			</nav>
			{renderTabs(tab)}
		</div>
	);
};

export default CatalogTabs;
