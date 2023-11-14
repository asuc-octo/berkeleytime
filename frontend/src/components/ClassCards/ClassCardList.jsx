import { Container, Row } from 'react-bootstrap';
import colors from 'utils/colors';
import ClassCard from './ClassCard';

export default function ClassCardList({
	selectedCourses,
	removeCourse,
	additionalInfo,
	type,
	isMobile
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
						fill={colors[item.colorId]}
						semester={item.semester === 'all' ? 'All Semesters' : item.semester}
						faculty={item.instructor === 'all' ? 'All Instructors' : item.instructor}
						removeCourse={removeCourse}
						colorId={item.colorId}
						additionalInfo={additionalInfo ? additionalInfo[i] : 0}
						type={type}
						isMobile={isMobile}
					/>
				))}
			</Row>
		</Container>
	);
}
