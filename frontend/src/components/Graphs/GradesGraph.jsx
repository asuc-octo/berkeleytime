import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import { percentileToString } from "../../utils/utils";

import vars from "../../variables/Variables";
import click from "../../assets/img/images/click.png";
import emptyImage from "../../assets/img/images/graphs/empty.svg";

const EmptyLabel = (props) => {
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

const MobileTooltip = (props) => {
  const { active, payload, label } = props;
  if (active && payload) {
    const denominator = props.denominator;
    const percentile = props.selectedPercentiles;
    const numerator = percentile ? props.selectedPercentiles.numerator : 0;
    const percentileLow = percentile
      ? percentileToString(percentile.percentile_low)
      : 0;
    const percentileHigh = percentile
      ? percentileToString(percentile.percentile_high)
      : 0;

    return (
      <div className="grades-graph-tooltip">
        <h6> Grade: {label} </h6>
        <p style={{ color: props.color }}>
          {" "}
          {props.course} • {props.semester} • {props.instructor}
        </p>
        <p>
          {" "}
          {percentileLow} - {percentileHigh} percentile{" "}
        </p>
        <p>
          {numerator}/{denominator}
        </p>
      </div>
    );
  }
  return null;
};

const PercentageLabel = (props) => {
  //todo: change text color
  const { x, y, width, value } = props;
  let percentage =
    value === 0 ? "" : value < 1 ? "<1%" : Math.round(value * 10) / 10 + "%";
  return (
    <text x={x + width} y={y} dx={20} dy={15} fontSize={12} textAnchor="middle">
      {percentage}
    </text>
  );
};

export default function GradesGraph({
  graphData,
  gradesData,
  updateBarHover,
  updateGraphHover,
  course,
  semester,
  instructor,
  selectedPercentiles,
  denominator,
  color,
  isMobile,
  graphEmpty,
}) {
  let numClasses = gradesData.length;

  return (
    <div>
      {!isMobile ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={graphData}
            onMouseMove={updateGraphHover}
            margin={{ top: 0, right: 0, left: -15, bottom: 0 }}
          >
            <XAxis dataKey="name" />
            {!graphEmpty ? (
              <YAxis type="number" unit="%" />
            ) : (
              <YAxis type="number" unit="%" domain={[0, 100]} />
            )}

            <Tooltip
              formatter={(value, name) => [
                `${Math.round(value * 10) / 10}%`,
                name,
              ]}
              cursor={graphEmpty ? { fill: "#fff" } : { fill: "#ebebeb" }}
            />

            {!graphEmpty &&
              gradesData.map((item, i) => (
                <Bar
                  name={`${item.title} • ${item.semester} • ${item.instructor}`}
                  dataKey={item.id}
                  fill={vars.colors[item.colorId]}
                  onMouseEnter={updateBarHover}
                  radius={[4, 4, 0, 0]}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer
          width="95%"
          height={!graphEmpty ? numClasses * 500 : 600}
        >
          <BarChart
            data={graphData}
            onMouseMove={updateGraphHover}
            layout="vertical"
            barSize={30}
            margin={{ left: -30, bottom: 50 }}
          >
            {!graphEmpty ? (
              <XAxis type="number" unit="%" />
            ) : (
              <XAxis type="number" unit="%" domain={[0, 100]} />
            )}
            <YAxis dataKey="name" type="category" />
            {!graphEmpty ? (
              <Tooltip
                content={
                  <MobileTooltip
                    course={course}
                    semester={semester}
                    instructor={instructor}
                    selectedPercentiles={selectedPercentiles}
                    color={color}
                    denominator={denominator}
                  />
                }
              />
            ) : null}
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
              wrapperStyle={{
                paddingTop: 20,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 10,
              }}
              layout="vertical"
              iconSize="10"
              iconType="circle"
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {graphEmpty && <EmptyLabel />}
    </div>
  );
}
