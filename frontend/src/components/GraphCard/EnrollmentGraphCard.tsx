import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { useDispatch } from 'react-redux';
import vars from '../../utils/variables';

import EnrollmentInfoCard from '../EnrollmentInfoCard/EnrollmentInfoCard.jsx';
import EnrollmentGraph from '../Graphs/EnrollmentGraph.jsx';
import GraphEmpty from '../Graphs/GraphEmpty.jsx';

import { EnrollmentDataType, EnrollmentStatusType, TelebearsType } from 'redux/enrollment/types';
import { useReduxSelector } from 'redux/store';
import { fetchEnrollData } from '../../redux/enrollment/actions';
import { FormattedCourseType } from 'redux/types';

export default function EnrollmentGraphCard({
	isMobile,
	updateClassCardEnrollment,
	...rest
}: {
	isMobile: boolean;
	updateClassCardEnrollment: (
		latest_point: EnrollmentStatusType[],
		telebears: TelebearsType[],
		enrolled_info: number[][],
		waitlisted_info: number[][]
	) => void;
} & HTMLAttributes<HTMLDivElement>) {
	const [hoveredClass, setHoveredClass] = useState<
		FormattedCourseType & EnrollmentDataType & { hoverDay: number }
	>();
	const { enrollmentData, graphData, selectedCourses } = useReduxSelector(
		(state) => state.enrollment
	);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchEnrollData(selectedCourses));
	}, [selectedCourses, dispatch]);

	const update = useCallback(
		(course: FormattedCourseType, day: number) => {
			if (!course || !enrollmentData || enrollmentData.length === 0) return;

			const selectedEnrollment = enrollmentData.filter((c) => course.id === c.id)[0];
			const valid =
				selectedEnrollment && selectedEnrollment.data.filter((d) => d.day === day).length;

			if (!valid) return;

			const hoverTotal = {
				...course,
				...selectedEnrollment,
				hoverDay: day
			};

			setHoveredClass(hoverTotal);
		},
		[enrollmentData]
	);

	useEffect(() => {
		if (enrollmentData.length > 0) {
			update(selectedCourses[0], 1);
		}

		const latest_point: EnrollmentStatusType[] = enrollmentData.map(
			(course) => course.data[course.data.length - 1]
		);
		const telebears = enrollmentData.map((course) => course.telebears);
		const enrolled_info = latest_point.map((course) => [
			course.enrolled,
			course.enrolled_max,
			course.enrolled_percent
		]);
		const waitlisted_info = latest_point.map((course) => [
			course.waitlisted,
			course.waitlisted_max,
			course.waitlisted_percent
		]);

		updateClassCardEnrollment(latest_point, telebears, enrolled_info, waitlisted_info);
	}, [enrollmentData, updateClassCardEnrollment, selectedCourses, update]);

	// Handler function for updating EnrollmentInfoCard on hover
	const updateLineHover = useCallback(
		({ dataKey: selectedClassID, index: day }: { dataKey: string; index: number }) => {
			update(selectedCourses.filter((course) => selectedClassID === course.id)[0], day);
		},
		[selectedCourses, update]
	);

	// Handler function for updating EnrollmentInfoCard on hover with single course
	const updateGraphHover = useCallback(
		({ isTooltipActive, activeLabel: day }: { isTooltipActive: boolean; activeLabel: number }) => {
			if (!isTooltipActive || selectedCourses.length !== 1) return;

			const selectedCourse = selectedCourses[0];

			update(selectedCourse, day);
		},
		[selectedCourses, update]
	);

	const telebears = useMemo(() => enrollmentData[0].telebears, [enrollmentData]);

	const graphEmpty = useMemo(
		() => enrollmentData.length === 0 || selectedCourses.length === 0,
		[enrollmentData, selectedCourses]
	);

	return (
		<div className="enrollment-graph" {...rest}>
			<Container fluid>
				<Row>
					<Col
						xs={{ span: 12, order: 2 }}
						sm={{ span: 12, order: 2 }}
						md={{ span: 8, order: 1 }}
						lg={{ span: 8, order: 1 }}
					>
						{isMobile && <div className="enrollment-mobile-heading"> Enrollment </div>}
						<EnrollmentGraph
							graphData={graphData}
							enrollmentData={enrollmentData}
							selectedCourses={selectedCourses}
							updateLineHover={updateLineHover}
							updateGraphHover={updateGraphHover}
							graphEmpty={graphEmpty}
							isMobile={isMobile}
						/>
					</Col>

					{graphEmpty && (
						<Col
							xs={{ span: 12, order: 1 }}
							sm={{ span: 12, order: 1 }}
							md={{ span: 4, order: 2 }}
							lg={{ span: 4, order: 2 }}
						>
							<GraphEmpty pageType="enrollment" />
						</Col>
					)}

					{!isMobile && !graphEmpty && (
						<Col md={{ span: 4, order: 2 }} lg={{ span: 4, order: 2 }}>
							{hoveredClass && (
								<EnrollmentInfoCard
									// {...hoveredClass}
									title={hoveredClass.title}
									subtitle={hoveredClass.subtitle}
									semester={hoveredClass.semester}
									instructor={
										hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor
									}
									selectedPoint={
										hoveredClass.data.filter((pt) => pt.day === hoveredClass.hoverDay)[0]
									}
									telebears={telebears}
									color={vars.colors[parseInt(hoveredClass.colorId)]}
									enrolledMax={hoveredClass.enrolled_max}
									waitlistedMax={hoveredClass.waitlisted_max}
								/>
							)}
						</Col>
					)}
				</Row>
			</Container>
		</div>
	);
}
