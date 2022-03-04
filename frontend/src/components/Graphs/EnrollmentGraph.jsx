import React from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Legend,
  ReferenceLine,
  Label,
  ResponsiveContainer,
} from "recharts";

import emptyImage from "../../assets/img/images/graphs/empty.svg";
import vars from "../../variables/Variables";

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

function getLargestEnrollment(graphData) {
  let max_percentage = -1;
  graphData.forEach((item) => {
    Object.keys(item).forEach(function (key) {
      if (key !== "name") {
        if (parseFloat(item[key]) > max_percentage) {
          max_percentage = parseFloat(item[key]);
        }
      }
    });
  });
  return max_percentage;
}

function getYTickRange(limit) {
  let step = 25;
  if (limit <= 100) {
    limit = 100;
  }
  let arr = Array.from(
    new Array(Math.floor(limit / step)),
    (x, i) => step * (i + 1)
  );
  if (limit % step > 0) {
    arr.push(step * (Math.floor(limit / step) + 1));
  }
  return arr;
}

export default function EnrollmentGraph({
  graphData,
  enrollmentData,
  updateLineHover,
  updateGraphHover,
  isMobile,
  graphEmpty,
  selectedCourses,
}) {
  const labelStyle = {
    textAnchor: "middle",
    fontSize: "12px",
  };
  return (
    <div>
      <div className="enrollment-recharts-container">
        <ResponsiveContainer width={isMobile ? 500 : "100%"} height={400}>
          <LineChart
            data={graphData}
            onMouseMove={updateGraphHover}
            margin={{ top: 0, right: 0, left: -15, bottom: 0 }}
          >
            <XAxis dataKey="name" interval={19} />
            <YAxis
              type="number"
              unit="%"
              domain={[0, Math.max(getLargestEnrollment(graphData), 100)]}
              ticks={getYTickRange(
                Math.max(getLargestEnrollment(graphData), 100)
              )}
            />

            <Tooltip
              formatter={(value) => `${value}%`}
              labelFormatter={(label) => `Day ${label - 1}`}
              cursor={graphEmpty ? false : true}
            />

            {!graphEmpty &&
              enrollmentData.map((item, i) => (
                <Line
                  key={i}
                  name={`${item.title} • ${item.section_name}`}
                  type="monotone"
                  dataKey={item.id}
                  stroke={vars.colors[item.colorId]}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ onMouseOver: updateLineHover }}
                  connectNulls
                />
              ))}
            {!graphEmpty && (
              <ReferenceLine
                x={enrollmentData[0].telebears.phase2_start_day}
                stroke="black"
                strokeDasharray="3 3"
              >
                <Label
                  angle={-90}
                  position="insideLeft"
                  style={labelStyle}
                  offset={10}
                >
                  {`Phase II Start (${selectedCourses[0].semester})`}
                </Label>
              </ReferenceLine>
            )}
            {!graphEmpty && (
              <ReferenceLine
                x={enrollmentData[0].telebears.adj_start_day}
                stroke="black"
                strokeDasharray="3 3"
              >
                <Label
                  angle={-90}
                  position="insideLeft"
                  style={labelStyle}
                  offset={10}
                >
                  {`Adjustment Start (${selectedCourses[0].semester})`}
                </Label>
              </ReferenceLine>
            )}

            {isMobile && (
              <Legend
                height={10}
                horizontalAlign="left"
                layout="vertical"
                iconType="circle"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {graphEmpty && <EmptyLabel />}
    </div>
  );
}

// <ReferenceLine
//   x={enrollmentData[0].telebears.phase2_start_day}
//   stroke="black"
//   strokeDasharray="3 3"
// >
//   <Label angle={-90} position="insideLeft" style={labelStyle} offset={10}>
//     {`Phase II Start (${enrollmentData[0].telebears.semester})`}
//   </Label>
// </ReferenceLine>
// <ReferenceLine
//   x={enrollmentData[0].telebears.adj_start_day}
//   stroke="black"
//   strokeDasharray="3 3"
// >
//   <Label angle={-90} position="insideLeft" style={labelStyle} offset={10}>
//     {`Adjustment Start (${enrollmentData[0].telebears.semester})`}
//   </Label>
// </ReferenceLine>
