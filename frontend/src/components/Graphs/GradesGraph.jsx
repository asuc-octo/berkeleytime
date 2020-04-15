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
import click from '../../assets/img/images/click.png';

const MobileTooltip = props => {
  const {active, payload, label } = props;
  if (active) {
    const denominator = props.denominator;
    const numerator = Math.round(denominator * (props.payload[0].value / 100));
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
    const {x, y, width, value} = props
    let percentage = value == 0 ? "": (value < 1 ? "<1%" : Math.round(value) + "%");
    return (
      <text
        x={x + width}
        y={y}
        dx={20}
        dy={15}
        fontSize={12}
        textAnchor="middle">{percentage}
      </text>
    );
  };

export default function GradesGraph({
  graphData, gradesData, updateBarHover, updateGraphHover, selectedPercentiles, denominator, color, isMobile
}) {

  let numClasses = gradesData.length;

  return (
      <div>
      {!isMobile ?
        <ResponsiveContainer width="100%" height={500}>
        <BarChart data={graphData} onMouseMove={updateGraphHover} margin={{ top: 0, right: 0, left: -50, bottom: 0 }} >
          <XAxis dataKey="name" />
          <YAxis type="number" unit="%" />
          <Tooltip
            formatter={(value, name) => [`${Math.round(value * 10) / 10}%`, name]}
            cursor={{fill: '#EAEAEA'}}
          />
          {gradesData.map((item, i) => (
            <Bar
              name={`${item.title} • ${item.semester} • ${item.instructor}`}
              dataKey={item.id}
              fill={vars.colors[item.colorId]}
              onMouseEnter={updateBarHover}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
        </ResponsiveContainer> :
        <ResponsiveContainer width="100%" height={numClasses*750} >
        <BarChart
          data={graphData}
          onMouseMove={updateGraphHover}
          layout="vertical"
          barSize={30}
          margin={{top: 65, left: -32, bottom: 50}}
        >

          <text
            y={30}
            textAnchor="top"
            dominantBaseline="left"
            fontSize={18}> Grade Distribution
          </text>
          <XAxis type="number" unit="%" />
          <YAxis dataKey="name" type="category" />
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
              name={`${item.title} • ${item.semester} • ${item.instructor}`}
              dataKey={item.id}
              fill={vars.colors[item.colorId]}
              onMouseEnter={updateBarHover}
              label={<PercentageLabel />}
            />
          ))}
          <Legend
            horizontalAlign="left"
            layout="vertical"
            iconType="circle"
          />
        </BarChart>
      </ResponsiveContainer>
      }
      </div>

  );
}
