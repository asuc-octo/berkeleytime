import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import { percentileToString, getGradeColor } from '../../utils/utils';
import info from '../../assets/img/images/graphs/info.svg';

const courseAvgText =
	'<span class="info-text">Course average refers to the average of all <br />sections available across all instructors.</span>';
const sectionAvgText =
	'<span class="info-text">Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';
const percentileText =
	'<span class="info-text">Percentile refers to the percentile range out of students who <br />received a letter grade, while the count and percentage <br />also include students who received P/NP grades.</span>';

export default function GradesInfoCard({
	course,
	subtitle,
	semester,
	instructor,
	courseLetter,
	courseGPA,
	sectionLetter,
	sectionGPA,
	selectedPercentiles,
	selectedGrade,
	denominator,
	color
}: {
	course: string;
	subtitle: string;
	semester: string;
	instructor: string;
	courseLetter: string;
	courseGPA: number;
	sectionLetter: string;
	sectionGPA: number;
	selectedPercentiles: {
		numerator: number;
		percentile_low: number;
		percentile_high: number;
	};
	selectedGrade: string;
	denominator: number;
	color: string;
}) {
	return (
		<div className="grades-info">
			<div className="header">
				<div className="square" style={{ backgroundColor: color }} />
				<div className="course">{course}</div>
			</div>
			<div className="title">{subtitle}</div>
			<div className="info">{`${semester} • ${instructor}`}</div>
			<h6>
				Course Average
				<a data-tooltip-id="courseAvg" data-tooltip-html={courseAvgText}>
					<img src={info} className="info-icon" alt="" />
				</a>
				<ReactTooltip id="courseAvg" />
			</h6>
			<div className="course-average">
				<span className={courseLetter ? getGradeColor(courseLetter) : ''}>{courseLetter}</span>
				{courseGPA !== -1 ? '(' + courseGPA + ')' : null}
			</div>
			<h6>
				Section Average
				<a data-tooltip-id="sectionAvg" data-tooltip-html={sectionAvgText}>
					<img src={info} className="info-icon" alt="" />
				</a>
				<ReactTooltip id="sectionAvg" />
			</h6>
			<div className="section-average">
				<span className={sectionLetter ? getGradeColor(sectionLetter) : ''}>{sectionLetter}</span>
				{sectionGPA !== -1 ? '(' + sectionGPA + ')' : null}
			</div>
			{selectedGrade !== undefined &&
				selectedGrade !== null &&
				selectedPercentiles !== undefined &&
				selectedPercentiles !== null && (
					<div>
						<h6>
							{`${percentileToString(selectedPercentiles.percentile_low)}-${percentileToString(
								selectedPercentiles.percentile_high
							)} Percentile`}

							<a data-tooltip-id="percentileInfo" data-tooltip-html={percentileText}>
								<img src={info} className="info-icon" alt="" />
							</a>
							<ReactTooltip id="percentileInfo" />
						</h6>
						<span className={selectedGrade ? getGradeColor(selectedGrade) : ''}>
							{selectedGrade}
						</span>
						({selectedPercentiles.numerator}/{denominator},{' '}
						{Math.round((selectedPercentiles.numerator / denominator) * 1000) / 10}%)
					</div>
				)}
		</div>
	);
}
