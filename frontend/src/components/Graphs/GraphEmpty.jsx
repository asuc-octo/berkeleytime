import { Tooltip as ReactTooltip } from 'react-tooltip';

import info from '../../assets/img/images/graphs/info.svg';

var courseAvgText =
	'<span class="info-text">Course average refers to the average of all <br />sections available across all instructors.</span>';
var sectionAvgText =
	'<span class="info-text">Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';

export default function GraphEmpty({ pageType }) {
	return (
		<div className="graph-empty">
			<div className="grades-info">
				<div className="header">
					<div className="square" />
					<div className="course">No Class Selected</div>
				</div>
				<div className="title">No Class Name Data</div>
				<div className="info">No Semester or Instructor Data</div>
				{pageType === 'enrollment' ? null : (
					<div>
						<div className="bt-h6">
							Course Average
							<a data-tooltip-id="courseAvg" data-tooltip-html={courseAvgText}>
								<img src={info} className="info-icon" alt="" />
							</a>
							<ReactTooltip id="courseAvg" />
						</div>
						<div className="course-average">
							<span className="bt-h6">No Data</span>
						</div>
						<div className="bt-h6">
							Section Average
							<a data-tooltip-id="sectionAvg" data-tooltip-html={sectionAvgText}>
								<img src={info} className="info-icon" alt="" />
							</a>
							<ReactTooltip id="sectionAvg" />
						</div>
						<div className="section-average">
							<span className="bt-h6">No Data</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
