import { EnrollmentStatusType, TelebearsType } from 'redux/enrollment/types';
import { getGradeColor, getEnrollmentDay, applyIndicatorEnrollment } from '../../utils/utils';

function ClassCardMobile({
	additionalInfo,
	type
}: {
	additionalInfo:
		| [string, number, string, number]
		| [EnrollmentStatusType, TelebearsType, number[], number[]]
		| undefined;
	type: 'grades' | 'enrollment';
}) {
	if (type === 'grades') {
		additionalInfo = additionalInfo as [string, number, string, number];

		const courseLetter = additionalInfo ? additionalInfo[0].toString() : undefined;
		const courseGPA = additionalInfo ? additionalInfo[1] : undefined;
		const sectionLetter = additionalInfo ? additionalInfo[2].toString() : undefined;
		const sectionGPA = additionalInfo ? additionalInfo[3] : undefined;

		return (
			<div className="class-card-mobile">
				<div className="class-card-mobile-column">
					<div className="bt-h6">Course Average</div>
					{courseLetter ? (
						<div className="bt-h6">
							<span className={getGradeColor(courseLetter)}>{courseLetter}</span> (GPA: {courseGPA})
						</div>
					) : (
						'--'
					)}
				</div>
				<div className="class-card-mobile-column">
					<div className="bt-h6">Section Average</div>
					{sectionLetter ? (
						<div className="bt-h6">
							<span className={getGradeColor(sectionLetter)}>{sectionLetter}</span> (GPA:{' '}
							{sectionGPA})
						</div>
					) : (
						'--'
					)}
				</div>
			</div>
		);
	} else {
		additionalInfo = additionalInfo as [EnrollmentStatusType, TelebearsType, number[], number[]];

		const latest_point = additionalInfo ? additionalInfo[0] : undefined;
		const telebears = additionalInfo ? additionalInfo[1] : undefined;
		const enrollment_info = additionalInfo ? additionalInfo[2] : undefined;
		const waitlisted_info = additionalInfo ? additionalInfo[3] : undefined;

		let date_info;
		if (latest_point != null && telebears != null) {
			date_info = getEnrollmentDay(latest_point, telebears);
		}

		return (
			<div className="class-card-mobile">
				<div className="class-card-mobile-column">
					<div className="bt-h6">
						{date_info ? date_info['period'] + ': ' + date_info['daysAfterPeriodStarts'] : '--'}
					</div>
					<div className="bt-h6">
						Enrollment Percent:
						{enrollment_info !== undefined &&
						waitlisted_info !== null &&
						enrollment_info.length === 3
							? applyIndicatorEnrollment(...(enrollment_info as [number, number, number]))
							: '--'}
					</div>
					<div className="bt-h6">
						Waitlist Percent:
						{waitlisted_info !== undefined &&
						waitlisted_info !== null &&
						waitlisted_info.length === 3
							? applyIndicatorEnrollment(...(waitlisted_info as [number, number, number]))
							: '--'}
					</div>
				</div>
			</div>
		);
	}
}

export default ClassCardMobile;
