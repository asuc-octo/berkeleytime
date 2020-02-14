import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import vars from '../../variables/Variables';

export default function GradesGraph({
  graphData, gradesData, updateBarHover, updateGraphHover,
}) {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={graphData} onMouseMove={updateGraphHover}>
        <XAxis dataKey="name" />
        <YAxis type="number" unit="%" />
        <Tooltip
          formatter={(value, name) => [`${Math.round(value * 10) / 10}%`, name]}
        />
        {gradesData.map((item, i) => (
          <Bar
            name={`${item.title} / ${item.semester} / ${item.instructor}`}
            dataKey={item.id}
            fill={vars.colors[i % vars.colors.length]}
            onMouseEnter={updateBarHover}
          />
        ))}

      </BarChart>
    </ResponsiveContainer>
  );
}
