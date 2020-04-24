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
import emptyImage from '../../assets/img/images/graphs/empty.svg';

const EmptyLabel = props => {
  return (
    <div className="graph-empty">
      <div className="graph-empty-content">
        <img className="graph-empty-image" src={emptyImage} alt="empty state" />
        <h3 className="graph-empty-heading" align="center">
          You have not added any <br /> classes yet.
        </h3>
      </div>
    </div>
  );
};

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
    let percentage = value === 0 ? "": (value < 1 ? "<1%" : Math.round(value) + "%");
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
  graphData, gradesData, updateBarHover, updateGraphHover, selectedPercentiles, denominator, color, isMobile, graphEmpty,
}) {

  let numClasses = gradesData.length;

  return (
      <div>
      {!isMobile ?
        <ResponsiveContainer width="100%" height={400}>
        <BarChart data={graphData} onMouseMove={updateGraphHover} margin={{ top: 0, right: 0, left: -15, bottom: 0 }} >
          <XAxis dataKey="name" />
          { !graphEmpty ? 
            <YAxis type="number" unit="%" /> : <YAxis type="number" unit="%" domain={[0, 100]}/>
          }
          { !graphEmpty ? 
            <Tooltip
              formatter={(value, name) => [`${Math.round(value * 10) / 10}%`, name]}
              cursor={{fill: '#EAEAEA'}}
            /> :
            <Tooltip
              cursor={{fill: '#fff'}}
              content={<EmptyLabel />}
              position={{ x: 150, y: 450 }}
              wrapperStyle={{visibility: 'visible'}}
            />
          }

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
        <ResponsiveContainer width="100%" height={!graphEmpty ? numClasses*750 : 600} >
        <BarChart
          data={graphData}
          onMouseMove={updateGraphHover}
          layout="vertical"
          barSize={30}
          margin={{top: 65, left: -30, bottom: 50}}
        >

          <text
            y={30}
            textAnchor="top"
            dominantBaseline="left"
            fontSize={18}> Grade Distribution
          </text>
          { !graphEmpty ? 
            <XAxis type="number" unit="%" /> : <XAxis type="number" unit="%" domain={[0, 100]}/>
          }
          <YAxis dataKey="name" type="category" />
          { !graphEmpty ?
            <Tooltip
              content={
                <MobileTooltip
                  selectedPercentiles={selectedPercentiles}
                  color={color}
                  denominator={denominator}
                /> 
              }
            /> :
              <Tooltip
                cursor={{fill: '#fff'}}
                content={<EmptyLabel />}
                position={{ x: 80, y: 500 }}
                wrapperStyle={{visibility: 'visible'}}
              />
          }
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
