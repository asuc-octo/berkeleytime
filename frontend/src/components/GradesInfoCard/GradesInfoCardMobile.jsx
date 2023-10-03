import GradesInfoCard from './GradesInfoCard';

export default function GradesInfoCardMobile({
	course,
	subtitle,
	semester,
	instructor,
	courseLetter,
	courseGPA,
	sectionLetter,
	sectionGPA,
	denominator,
	betterGrade,
	worseGrade,
	color
}) {
	const checkNullState = (item) => item || ' ';

	return (
		<GradesInfoCard
			course={checkNullState(course ? course : 'NO CLASS ADDED')}
			subtitle={checkNullState(subtitle)}
			semester={checkNullState(semester === 'all' ? 'All Semesters' : semester)}
			instructor={checkNullState(instructor === 'all' ? 'All Instructors' : instructor)}
			courseLetter={checkNullState(courseLetter)}
			courseGPA={checkNullState(courseGPA)}
			sectionLetter={checkNullState(sectionLetter)}
			sectionGPA={checkNullState(sectionGPA)}
			denominator={checkNullState(denominator)}
			selectedPercentiles={checkNullState(betterGrade)}
			selectedGrade={checkNullState(worseGrade)}
			color={checkNullState(color)}
		/>
	);
}
