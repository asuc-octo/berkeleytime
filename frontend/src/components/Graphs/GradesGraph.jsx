import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import vars from '../../variables/Variables';

export default function GradesGraph({
  graphData, gradesData, updateBarHover, updateGraphHover
}) {
  return (
    <div className="graph">
      <ResponsiveContainer width='100%' height={400}>
      <BarChart width={800} height={400} data={graphData} onMouseMove={updateGraphHover}>
        <XAxis dataKey="name"/>>
        <YAxis type="number" unit="%"/>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
            formatter={(value, name, props) => [Math.round(value * 10) / 10 + "%", name]}
        />
        <Legend align="left" verticalAlign="bottom" height={36}/>
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
    </div>
  )
}
