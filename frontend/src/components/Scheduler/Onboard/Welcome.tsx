import { Button } from 'bt/custom';
import BTSelect from 'components/Custom/Select';
import { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { getNodes } from 'utils/graphql';
import { useLocalStorageState } from 'utils/hooks';
import {
	Semester,
	playlistToSemester,
	semesterToString,
	stringToSemester
} from 'utils/playlists/semesters';
import {
	DEFAULT_SCHEDULE,
	SCHEDULER_LOCALSTORAGE_KEY,
	Schedule,
	isScheduleEmpty
} from 'utils/scheduler/scheduler';
import { useUser } from '../../../graphql/hooks/user';
import ProfileScheduleCard from './../../Profile/ProfileScheduleCard';
import { useGetSemestersQuery } from 'graphql';
import { useSemester } from 'graphql/hooks/semester';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SEMESTER_VALUES: { [label: string]: number } = {
	spring: 0.0,
	summer: 0.1,
	fall: 0.2
};

const Welcome = () => {
	const { user } = useUser();

	const [schedule, setSchedule] = useLocalStorageState<Schedule>(
		SCHEDULER_LOCALSTORAGE_KEY,
		DEFAULT_SCHEDULE
	);

	const savedSchedules = user
		? getNodes(user.schedules).sort(
				(a, b) => Date.parse(b.dateCreated as string) - Date.parse(a.dateCreated as string)
		  )
		: [];

	const SemesterToValue = (semester: Semester) => {
		return parseInt(semester.year, 10) + SEMESTER_VALUES[semester.semester];
	};

	const sortSemestersByLatest = (semester: Semester[]) => {
		return semester.sort((a, b) => SemesterToValue(b) - SemesterToValue(a));
	};

	const { data } = useGetSemestersQuery({});

	const allSemesters: { label: string; value: Semester }[] = [];

	if (data) {
		sortSemestersByLatest(
			getNodes(data.allPlaylists).map((semester) => playlistToSemester(semester))
		).map((semester) => allSemesters.push({ label: semesterToString(semester), value: semester }));
	}

	const latestSemester = allSemesters[0];

	const [selectedSemester, setSelectedSemester] = useState(latestSemester);

	const navigate = useNavigate();

	return (
		<Container className="welcome">
			<Row>
				<Col md={{ span: 6, offset: 3 }}>
					<div className="scheduler-title">Welcome to Berkeleytime&apos;s Scheduler</div>
					<div className="prompt">
						Use our scheduler to build your ideal schedule. Search our catalog to add new classes or
						select from saved ones, and add your own time preferences.
					</div>

					<div className="buttons">
						{!isScheduleEmpty(schedule) && (
							<Button variant="inverted" href="/scheduler/new" className="mr-3">
								Continue Draft
							</Button>
						)}
						<BTSelect
							className="dropdown"
							value={selectedSemester}
							closeMenuOnSelect={true}
							isSearchable={false}
							options={allSemesters}
							onChange={(newValue) => {
								newValue && setSelectedSemester(newValue);
							}}
							defaultValue={latestSemester && latestSemester}
						/>
						<Button
							onClick={() => {
								setSchedule(DEFAULT_SCHEDULE);
								navigate(
									`/scheduler/new/${latestSemester ? '?semester=' + selectedSemester.label : ''}`
								);
							}}
						>
							Start
						</Button>
					</div>
				</Col>
			</Row>
			<Row>
				<Col md={{ span: 8, offset: 2 }}>
					{savedSchedules.length > 0 && (
						<div className="saved-schedules">
							<div className="scheduler-heading">Saved Schedules</div>
							<div className="profile-card-grid">
								{savedSchedules.map((course) => (
									<ProfileScheduleCard key={course.id} schedule={course} />
								))}
							</div>
						</div>
					)}
				</Col>
			</Row>
		</Container>
	);
};

export default Welcome;
