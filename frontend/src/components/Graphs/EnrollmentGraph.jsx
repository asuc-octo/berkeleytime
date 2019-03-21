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
  graphData, enrollmentData, updateInfoCard
}) {
  let labelStyle = {
    textAnchor: 'middle',
    fontSize: '12px'
  }
  return (
    <div className="graph">
      <LineChart width={800} height={400} data={graphData}>
        <XAxis dataKey="name" interval={19} />>
        <YAxis type="number" unit="%"/>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend align="left" verticalAlign="top" height={36}/>

        {enrollmentData.map((item, i) => (
          <Line
            name={`${item.title} / ${item.section_name}`}
            type="monotone"
            dataKey={item.id}
            stroke={vars.colors[i % vars.colors.length]}
            strokeWidth={3}
            dot={false}
            activeDot={{onMouseOver: updateInfoCard}}
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
        <ReferenceLine
          y={100}
          stroke="#FFB74D"
          strokeWidth={3}
        />
      </LineChart>
    </div>
  )
}