import React from 'react';

import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Legend,
  ReferenceLine,
  Label,
  ResponsiveContainer,
} from 'recharts';

import vars from '../../variables/Variables';

export default function EnrollmentGraph({
  graphData, enrollmentData, updateLineHover, updateGraphHover,
}) {
  const labelStyle = {
    textAnchor: 'middle',
    fontSize: '12px',
  };
  return (
    <div className="graph">
      <ResponsiveContainer width="90%" height={440}>
        <LineChart data={graphData} onMouseMove={updateGraphHover}>
          <XAxis dataKey="name" interval={19} />
          <YAxis type="number" unit="%" domain={[0, 100]}/>
          <Tooltip
            formatter={(value) => `${value}%`}
            labelFormatter={label => `Day ${label}`}
          />
          {enrollmentData.map((item, i) => (
            <Line
              name={`${item.title} / ${item.section_name}`}
              type="monotone"
              dataKey={item.id}
              stroke={vars.colors[item.colorId]}
              strokeWidth={3}
              dot={false}
              activeDot={{ onMouseOver: updateLineHover }}
              connectNulls
            />
          ))}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// <ReferenceLine
//   x={enrollmentData[0].telebears.phase2_start_day}
//   stroke="black"
//   strokeDasharray="3 3"
// >
//   <Label angle={-90} position="insideLeft" style={labelStyle} offset={10}>
//     {`Phase II Start (${enrollmentData[0].telebears.semester})`}
//   </Label>
// </ReferenceLine>
// <ReferenceLine
//   x={enrollmentData[0].telebears.adj_start_day}
//   stroke="black"
//   strokeDasharray="3 3"
// >
//   <Label angle={-90} position="insideLeft" style={labelStyle} offset={10}>
//     {`Adjustment Start (${enrollmentData[0].telebears.semester})`}
//   </Label>
// </ReferenceLine>
