import { useMemo } from 'react';
import { getEnrollmentDay, applyIndicatorEnrollment } from '../../utils/utils';

export default function EnrollmentInfoCard({
	title,
	subtitle,
	semester,
	instructor,
	selectedPoint,
	telebears,
	color,
	enrolledMax,
	waitlistedMax
}) {
	const { period, daysAfterPeriodStarts } = useMemo(
		() => getEnrollmentDay(selectedPoint, telebears),
		[selectedPoint, telebears]
	);

	return (
		<div className="enrollment-info">
			<div className="header">
				<div className="square" style={{ backgroundColor: color }} />
				<div className="course">{title}</div>
			</div>
			<div className="title">{subtitle}</div>
			<div className="info">{`${semester} • ${instructor}`}</div>

			<div className="stat-section">
				<div className="date">
					{daysAfterPeriodStarts} Days After {period}
				</div>
				<div className="enrolled-stat">
					<span className="text">Enrolled:</span>{' '}
					{applyIndicatorEnrollment(
						selectedPoint.enrolled,
						enrolledMax,
						selectedPoint.enrolled_percent
					)}
				</div>
				<div className="waitlisted-stat">
					<span className="text">Waitlisted:</span>{' '}
					{applyIndicatorEnrollment(
						selectedPoint.waitlisted,
						waitlistedMax,
						selectedPoint.waitlisted_percent
					)}
				</div>
			</div>
		</div>
	);
}
