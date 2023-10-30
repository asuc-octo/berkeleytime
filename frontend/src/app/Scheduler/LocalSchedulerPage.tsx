import BTLoader from 'components/Common/BTLoader';
import { useCreateSchedule } from 'graphql/hooks/schedule';
import { useSemester } from 'graphql/hooks/semester';
import { useUser } from 'graphql/hooks/user';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReduxState } from 'redux/store';
import { useLocalStorageState } from 'utils/hooks';
import { DEFAULT_SCHEDULE, SCHEDULER_LOCALSTORAGE_KEY, Schedule } from 'utils/scheduler/scheduler';
import Callout from '../../components/Scheduler/Callout';
import ScheduleEditor from '../../components/Scheduler/ScheduleEditor';

export function Component() {
	const [schedule, setSchedule] = useLocalStorageState<Schedule>(
		SCHEDULER_LOCALSTORAGE_KEY,
		DEFAULT_SCHEDULE
	);

	const { isLoggedIn, loading: loadingUser } = useUser();
	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();

	const stringToSemester = (string: string | null) => {
        if (!string) {
            return undefined
        }
		const [semester, year] = string.trim().toLowerCase().split(' ');
		return {
			semester,
			year
		};
	};

	const { semester, error: semesterError } = useSemester(
		searchParams.has('semester') && searchParams.get('semester')
			? stringToSemester(searchParams.get('semester'))
			: undefined
	);

	// useEffect(() => {
	// 	const hasSemester = searchParams.has('semester');
	// 	if (!hasSemester) return;
	// 	searchParams.delete('semester');
	// 	setSearchParams(searchParams);
	// }, [searchParams, setSearchParams]);

	const [createScheduleMutation, { loading: isSaving, error: creationError }] = useCreateSchedule({
		onCompleted: (data) => {
			if (data?.createSchedule?.schedule) {
				const scheduleId = data.createSchedule.schedule.id;

				// Clear the saved schedule
				setSchedule(DEFAULT_SCHEDULE);

				// Redirect to the saved schedule editor.
				const scheduleUUID = atob(scheduleId).split(':')[1];

				// Defer this to the next tick
				setTimeout(() => {
					navigate(`/scheduler/${scheduleUUID}`);
				});
			}
		}
	});

	const isMobile = useSelector((state: ReduxState) => state.common.mobile);

	if (isMobile) {
		return (
			<div className="scheduler viewport-app">
				<div className="onboard">
					<p className="py-5 px-2 mobile">
						Unfortunately, the Scheduler does not support mobile devices at this time.
					</p>
				</div>
			</div>
		);
	}

	if (!semester) {
		return <BTLoader message="Loading semester information..." error={semesterError} fill />;
	}

	const createSchedule = async () => await createScheduleMutation(schedule, semester!);

	const saveButton = (
		<Button
			className="bt-btn-primary px-3"
			size="sm"
			onClick={createSchedule}
			disabled={!isLoggedIn}
			style={{ pointerEvents: !isLoggedIn ? 'none' : undefined }}
		>
			Save
		</Button>
	);

	return (
		<div className="scheduler viewport-app">
			<ScheduleEditor
				schedule={schedule}
				semester={semester}
				setSchedule={setSchedule}
				saveWidget={
					isSaving ? (
						<span>Saving schedule...</span>
					) : creationError ? (
						<Callout type="warning" state="error" message="Could not save schedule." />
					) : !isLoggedIn ? (
						<OverlayTrigger
							overlay={
								<Tooltip id="schedule-save-popover">
									{loadingUser ? 'Loading account...' : 'You must be logged in to save.'}
								</Tooltip>
							}
							placement="bottom"
						>
							<span className="d-inline-block">{saveButton}</span>
						</OverlayTrigger>
					) : (
						saveButton
					)
				}
			/>
		</div>
	);
}
