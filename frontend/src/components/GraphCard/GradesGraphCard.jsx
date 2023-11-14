import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGradeData } from 'redux/grades/actions';
import colors from 'utils/colors';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard';
import GradesGraph from '../Graphs/GradesGraph';
import GraphEmpty from '../Graphs/GraphEmpty';

export default function GradesGraphCard({ isMobile, updateClassCardGrade }) {
	const { gradesData, graphData, selectedCourses } = useSelector((state) => state.grade);
	const [hoveredClass, setHoveredClass] = useState(false);
	const [updateMobileHover, setUpdateMobileHover] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchGradeData(selectedCourses));
	}, [selectedCourses, dispatch]);

	const update = useCallback(
		(course, grade) => {
			if (!course || !gradesData || gradesData.length === 0) return;

			const selectedGrades = gradesData.filter((c) => course.id === c.id)[0];
			const hoverTotal = {
				...course,
				...selectedGrades,
				hoverGrade: grade
			};

			setHoveredClass(hoverTotal);
		},
		[gradesData]
	);

	useEffect(() => {
		if (gradesData.length > 0 && selectedCourses.length === 1) {
			update(selectedCourses[0], 0);
		}

		const course_letter = gradesData.map((course) => course.course_letter);
		const course_gpa = gradesData.map((course) => course.course_gpa);
		const section_letter = gradesData.map((course) => course.section_letter);
		const section_gpa = gradesData.map((course) => course.section_gpa);
		updateClassCardGrade(course_letter, course_gpa, section_letter, section_gpa);
	}, [gradesData, selectedCourses, update, updateClassCardGrade]);

	// Handler function for updating GradesInfoCard on hover
	const updateBarHover = useCallback(
		(barData) => {
			const { payload, name, value } = barData;

			let selectedClassID = '';

			for (const key in payload) {
				if (payload[key] === value) {
					selectedClassID = key;
				}
			}

			const selectedCourse = selectedCourses.filter((course) => selectedClassID === course.id)[0];
			update(selectedCourse, name);

			setUpdateMobileHover(false);
		},
		[selectedCourses, update]
	);

	// Handler function for updating GradesInfoCard on hover with single course
	const updateGraphHover = useCallback(
		(data) => {
			const { isTooltipActive, activeLabel } = data;

			const noBarMobile = updateMobileHover && isMobile;

			// Update the selected course if no bar is clicked if in mobile
			if (isTooltipActive && (selectedCourses.length === 1 || noBarMobile)) {
				const selectedCourse = selectedCourses[0];
				const grade = activeLabel;
				update(selectedCourse, grade);
			}

			// Update mobile hover records if there actually is a bar (then we only want updateBarHover to run)
			setUpdateMobileHover(true);
		},
		[isMobile, selectedCourses, update, updateMobileHover]
	);

	const graphEmpty = useMemo(
		() => gradesData.length === 0 || selectedCourses.length === 0,
		[gradesData, selectedCourses]
	);

	return (
		<div className="grades-graph">
			<Container fluid>
				<Row>
					<Col
						xs={{ span: 12, order: 2 }}
						sm={{ span: 12, order: 2 }}
						md={{ span: 8, order: 1 }}
						lg={{ span: 8, order: 1 }}
					>
						{isMobile && <div className="grades-mobile-heading"> Grade Distribution </div>}
						<GradesGraph
							graphData={graphData}
							gradesData={gradesData}
							updateBarHover={updateBarHover}
							updateGraphHover={updateGraphHover}
							course={hoveredClass.course}
							semester={hoveredClass.semester === 'all' ? 'All Semesters' : hoveredClass.semester}
							instructor={
								hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor
							}
							selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
							denominator={hoveredClass.denominator}
							color={colors[hoveredClass.colorId]}
							isMobile={isMobile}
							graphEmpty={graphEmpty}
						/>
					</Col>

					{graphEmpty && (
						<Col
							xs={{ span: 12, order: 1 }}
							sm={{ span: 12, order: 1 }}
							md={{ span: 4, order: 2 }}
							lg={{ span: 4, order: 2 }}
						>
							<GraphEmpty pageType="grades" />
						</Col>
					)}

					{!isMobile && !graphEmpty && (
						<Col md={{ span: 4, order: 2 }} lg={{ span: 4, order: 2 }}>
							{hoveredClass && (
								<GradesInfoCard
									course={hoveredClass.course}
									subtitle={hoveredClass.subtitle}
									semester={
										hoveredClass.semester === 'all' ? 'All Semesters' : hoveredClass.semester
									}
									instructor={
										hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor
									}
									courseLetter={hoveredClass.course_letter}
									courseGPA={hoveredClass.course_gpa}
									sectionLetter={hoveredClass.section_letter}
									sectionGPA={hoveredClass.section_gpa}
									denominator={hoveredClass.denominator}
									selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
									selectedGrade={hoveredClass.hoverGrade}
									color={colors[hoveredClass.colorId]}
								/>
							)}
						</Col>
					)}
				</Row>
			</Container>
		</div>
	);
}
