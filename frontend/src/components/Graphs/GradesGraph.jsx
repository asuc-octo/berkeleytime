import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import vars from '../../variables/Variables';

export default function GradesGraph({
  graphData, gradesData, updateInfoCard
}) {
  return (
    <div className="graph">
      <BarChart width={800} height={400} data={graphData}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />

        {gradesData.map((item, i) => (
          <Bar
            dataKey={item.id}
            fill={vars.colors[i % vars.colors.length]}
            onMouseEnter={updateInfoCard}
          />
        ))}

      </BarChart>
    </div>
  )
}