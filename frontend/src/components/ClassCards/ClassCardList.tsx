import { Container, Row } from 'react-bootstrap';

import ClassCard from './ClassCard';
import vars from '../../utils/variables';
import { FormattedCourseType } from 'redux/types';
import { EnrollmentStatusType, TelebearsType } from 'redux/enrollment/types';

export default function ClassCardList({
	selectedCourses,
	removeCourse,
	additionalInfo,
	type,
	isMobile
}: {
	selectedCourses: FormattedCourseType[];
	removeCourse: (id: string, color: string) => void;
	additionalInfo:
		| [string, number, string, number][]
		| [EnrollmentStatusType, TelebearsType, number[], number[]][];
	type: 'grades' | 'enrollment';
	isMobile: boolean;
}) {
	return (
		<Container fluid className="class-card-list">
			<Row>
				{selectedCourses.map((item, i) => (
					<ClassCard
						key={item.id}
						id={item.id}
						course={item.course}
						title={item.title}
						fill={vars.colors[parseInt(item.colorId)]}
						semester={item.semester === 'all' ? 'All Semesters' : item.semester}
						instructor={item.instructor === 'all' ? 'All Instructors' : item.instructor}
						removeCourse={removeCourse}
						colorId={item.colorId}
						additionalInfo={additionalInfo ? additionalInfo[i] : undefined}
						type={type}
						isMobile={isMobile}
					/>
				))}
			</Row>
		</Container>
	);
}
