import React from 'react';

import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Legend,
} from 'recharts';

import vars from '../../variables/Variables';

export default function EnrollmentGraph({
  graphData, enrollmentData, updateInfoCard
}) {
  return (
    <div className="graph">
      <LineChart width={800} height={400} data={graphData}>
        <XAxis dataKey="name" tickCount={5} />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />

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
      </LineChart>
    </div>
  )
}