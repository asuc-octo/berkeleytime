import BTSelect from 'components/Custom/Select';
import { CourseOverviewFragment } from 'graphql';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { courseToName } from 'lib/courses/course';
import { compareDepartmentName } from 'lib/courses/sorting';
import { hasCourseById, Schedule } from 'utils/scheduler/scheduler';
import { addCourse } from './onboard';

type CourseType = CourseOverviewFragment;

type CourseOptionType = {
	value: string;
	label: string;
	course: CourseType;
};

type Props = {
	allCourses: CourseType[];
	schedule: Schedule;
	setSchedule: Dispatch<SetStateAction<Schedule>>;
};

const CourseSelector = ({ allCourses, schedule, setSchedule }: Props) => {
	// Sort courses
	const sortedCourses: CourseOptionType[] = useMemo(
		() =>
			allCourses.sort(compareDepartmentName).map((course) => ({
				value: course.id,
				label: courseToName(course),
				course
			})),
		[allCourses]
	);

	return (
		<div className="course-selector">
			<BTSelect
				value={null}
				name="selectClass"
				placeholder="Search for a class..."
				options={sortedCourses.filter((course) => !hasCourseById(schedule, course.value))}
				onChange={(c) => c && addCourse(c.course, schedule, setSchedule)}
			/>
		</div>
	);
};

export default CourseSelector;
