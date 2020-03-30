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
import {
  percentileToString
} from '../../utils/utils';

import vars from '../../variables/Variables';

const MobileTooltip = props => {
  const {active, payload, label } = props;
  if (active) {
    const denominator = props.denominator;
    const numerator = denominator * (props.payload[0].value / 100);
    let percentile = props.selectedPercentiles;
    let percentileLow = percentile ? percentileToString(percentile.percentile_low) : 0;
    let percentileHigh = percentile ? percentileToString(percentile.percentile_high): 0;
    let courseName = payload[0].name.split('/')[0];
    return (
      <div className="grades-graph-tooltip">
        <h6> Grade: {label} </h6>
        <p style={{ color: props.color }}> {courseName} </p>
        <p> {percentileLow} - {percentileHigh} percentile </p>
        <p>{numerator}/{denominator}</p>
      </div>
    );
  }
  return null;
};

const PercentageLabel = props => {
    //todo: change text color
    const {x, y, value} = props
    let percentage = value == 0 ? "": (value < 1 ? "<1%" : Math.round(value) + "%");
    return (
      <text 
        x={x} 
        y={y} 
        dx={13}
        dy={-10}
        textAnchor="middle">{percentage}
      </text>
    );
  };

export default function GradesGraph({
  graphData, gradesData, updateBarHover, updateGraphHover, selectedPercentiles, denominator, color, isMobile
}) {

  return (
      <div>
      {!isMobile ?
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
              fill={vars.colors[item.colorId]}
              onMouseEnter={updateBarHover}
            />
          ))}
        </BarChart> 
        </ResponsiveContainer> :
        <ResponsiveContainer width={500} height={500}>
        <BarChart data={graphData} onMouseMove={updateGraphHover} layout="horizontal">
          <XAxis dataKey="name" />
          <YAxis type="number" unit="%" />
          <Tooltip
            content={
              <MobileTooltip 
                selectedPercentiles={selectedPercentiles}
                color={color}
                denominator={denominator}
              />
            }
          />
          {gradesData.map((item, i) => (
            <Bar
              name={`${item.title} / ${item.semester} / ${item.instructor}`}
              dataKey={item.id}
              fill={vars.colors[item.colorId]}
              onMouseEnter={updateBarHover}
              label={<PercentageLabel />}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      }
      </div>
    
  );
}
