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
} from 'recharts';

import vars from '../../variables/Variables';

export default function EnrollmentGraph({
  graphData, enrollmentData, updateLineHover, updateGraphHover
}) {
  let labelStyle = {
    textAnchor: 'middle',
    fontSize: '12px'
  }
  return (
    <div className="graph">
      <LineChart width={800} height={400} data={graphData} onMouseMove={updateGraphHover}>
        <XAxis dataKey="name" interval={19} />>
        <YAxis type="number" unit="%"/>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
            formatter={(value) => `${value}%`}
            labelFormatter={label => "Day " + label}
        />
        <Legend align="left" verticalAlign="bottom" height={36}/>
        {enrollmentData.map((item, i) => (
          <Line
            name={`${item.title} / ${item.section_name}`}
            type="monotone"
            dataKey={item.id}
            stroke={vars.colors[i % vars.colors.length]}
            strokeWidth={3}
            dot={false}
            activeDot={{onMouseOver: updateLineHover}}
            connectNulls={true}
          />
        ))}
        <ReferenceLine
          x={enrollmentData[0]['telebears']['phase2_start_day']}
          stroke="black"
          strokeDasharray="3 3"
        >
          <Label angle={-90} position='insideLeft' style={labelStyle} offset={10}>Phase II Start</Label>
        </ReferenceLine>
        <ReferenceLine
          x={enrollmentData[0]['telebears']['adj_start_day']}
          stroke="black"
          strokeDasharray="3 3"
        >
          <Label angle={-90} position='insideLeft' style={labelStyle} offset={10}>Adjustment Start</Label>
        </ReferenceLine>
      </LineChart>
    </div>
  )
}