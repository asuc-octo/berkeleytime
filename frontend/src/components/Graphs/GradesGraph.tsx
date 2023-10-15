import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { percentileToString } from '../../utils/utils';
import { useMemo } from 'react';

import vars from '../../utils/variables';
import emptyImage from '../../assets/img/images/graphs/empty.svg';
import { CourseFragment } from 'graphql';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart';

const EmptyLabel = () => {
	return (
		<div className="graph-empty">
			<div className="graph-empty-content">
				<img className="graph-empty-image" src={emptyImage} alt="empty state" />
				<h3 className="graph-empty-heading">
					You have not added any <br /> classes yet.
				</h3>
			</div>
		</div>
	);
};

const MobileTooltip = (props) => {
	const { active, payload, label } = props;
	if (active && payload) {
		const denominator = props.denominator;
		const percentile = props.selectedPercentiles;
		const numerator = percentile ? props.selectedPercentiles.numerator : 0;
		const percentileLow = percentile ? percentileToString(percentile.percentile_low) : 0;
		const percentileHigh = percentile ? percentileToString(percentile.percentile_high) : 0;

		return (
			<div className="grades-graph-tooltip">
				<h6> Grade: {label} </h6>
				<p style={{ color: props.color }}>
					{props.course} • {props.semester} • {props.instructor}
				</p>
				<p>
					{percentileLow} - {percentileHigh} percentile
				</p>
				<p>
					{numerator}/{denominator}
				</p>
			</div>
		);
	}
	return null;
};

const PercentageLabel = (props) => {
	//todo: change text color
	const { x, y, width, value } = props;
	const percentage = value === 0 ? '' : value < 1 ? '<1%' : Math.round(value * 10) / 10 + '%';
	return (
		<text x={x + width} y={y} dx={20} dy={15} fontSize={12} textAnchor="middle">
			{percentage}
		</text>
	);
};

const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P', 'NP'] as const;
type LetterGrade = (typeof grades)[number];

type legacyGradeData = {
	[key in LetterGrade]: {
		numerator: number;
		denominator: number;
	};
};

type legacyGradeObject = {
	colorId?: number;
	id: string;
	title: string;
	semester: string;
	instructor: string;
	denominator: number;
} & legacyGradeData;

interface GradesGraphProps {
	gradeData: legacyGradeObject[] | null;
	course: CourseFragment | null;
	color?: string;
	updateBarHover: CategoricalChartFunc;
}

export default function GradesGraph(props: GradesGraphProps) {
	const { gradeData, updateBarHover, color } = props;

	const graphData = useMemo(() => {
		if (!gradeData) return null;

		return grades.map((letterGrade) => {
			const result: Record<string, string | number> = { name: letterGrade };

			gradeData.forEach(({ denominator, id, ...grade }) => {
				if (denominator === 0) return;
				const percent = 100 * (grade[letterGrade].numerator / denominator);
				result[id] = percent;
			});

			return result;
		});
	}, [gradeData]);

	const formatTooltip = (value: ValueType, name: NameType) => [
		`${Math.round((value as number) * 10) / 10}%`,
		name
	];

	return (
		<div className="grades-graph">
			<ResponsiveContainer width="100%" height={400}>
				<BarChart
					data={graphData ?? []}
					onMouseMove={updateBarHover}
					margin={{ top: 0, right: 0, left: -15, bottom: 0 }}
				>
					<XAxis dataKey="name" type="category" interval={0} />
					<YAxis type="number" unit="%" domain={[0, 100]} fontSize="14px" />
					<Tooltip formatter={formatTooltip} />
					{gradeData &&
						gradeData.map((item, i) => (
							<Bar
								key={i}
								name={`${item.title} • ${item.semester} • ${item.instructor}`}
								dataKey={item.id}
								fill={color ? color : vars.colors[item.colorId ?? 0]}
								onMouseEnter={updateBarHover}
								radius={[4, 4, 0, 0]}
							/>
						))}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
	// return (
	// 	<ResponsiveContainer width="95%" height={!graphEmpty ? 200 + 1 * 400 : 600}>
	// 		<BarChart
	// 			data={graphData ?? []}
	// 			onMouseMove={updateGraphHover}
	// 			layout="vertical"
	// 			margin={{ left: -30, bottom: 50 }}
	// 		>
	// 			{!graphEmpty ? (
	// 				<XAxis type="number" unit="%" />
	// 			) : (
	// 				<XAxis type="number" unit="%" domain={[0, 100]} />
	// 			)}
	// 			<YAxis dataKey="name" type="category" interval={0} />
	// 			{!graphEmpty ? (
	// 				<Tooltip
	// 					content={
	// 						<MobileTooltip
	// 							course={course}
	// 							semester={semester}
	// 							instructor={instructor}
	// 							selectedPercentiles={selectedPercentiles}
	// 							color={color}
	// 							denominator={denominator}
	// 						/>
	// 					}
	// 				/>
	// 			) : null}
	// 			{gradeData && gradeData.map((item, i) => (
	// 				<Bar
	// 					key={i}
	// 					name={`${item.title} • ${item.semester} • ${item.instructor}`}
	// 					dataKey={item.id}
	// 					fill={vars.colors[item.colorId ?? 0]}
	// 					onMouseEnter={updateBarHover}
	// 					label={<PercentageLabel />}
	// 					radius={[0, 4, 4, 0]}
	// 				/>
	// 			))}
	// 			<Legend
	// 				wrapperStyle={{
	// 					paddingTop: 20,
	// 					paddingLeft: 10,
	// 					paddingRight: 10,
	// 					paddingBottom: 10
	// 				}}
	// 				layout="vertical"
	// 				verticalAlign="top"
	// 				iconType="circle"
	// 			/>
	// 		</BarChart>
	// 	</ResponsiveContainer>
	// );

	// 	{graphEmpty && <EmptyLabel />}
	// );
}
