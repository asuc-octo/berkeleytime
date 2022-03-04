import { SectionFragment } from "graphql/graphql";
import React, { CSSProperties } from "react";
import { Table } from "react-bootstrap";
import { formatSectionTime } from "utils/sections/section";
import { sortSections } from "utils/sections/sort";

import denero from "../../assets/img/eggs/denero.png";
import garcia from "../../assets/img/eggs/garcia.png";
import hilf from "../../assets/img/eggs/hilf.png";
import hug from "../../assets/img/eggs/hug.png";
import kubi from "../../assets/img/eggs/kubi.png";
import sahai from "../../assets/img/eggs/sahai.png";
import scott from "../../assets/img/eggs/scott.png";

const easterEggImages = new Map<string, string>([
  ["DENERO J", denero],
  ["HUG J", hug],
  ["SAHAI A", sahai],
  ["HILFINGER P", hilf],
  ["SHENKER S", scott],
  ["KUBIATOWICZ J", kubi],
  ["GARCIA D", garcia],
]);

function findInstructor(instr: string | null): CSSProperties {
  if (instr === null) return {};

  for (const [name, eggUrl] of easterEggImages) {
    if (instr.includes(name)) {
      return {
        "--section-cursor": `url("${eggUrl}")`,
      } as CSSProperties;
    }
  }

  return {};
}

type Props = {
  sections: SectionFragment[];
};

const SectionTable = ({ sections: allSections }: Props) => {
  const sections = sortSections(allSections);

  return (
    <Table className="table">
      <thead>
        <tr>
          <th style={{ width: "75px" }}>Type</th>
          <th style={{ width: "50px" }}>CCN</th>
          <th style={{ width: "100px" }}>Instructor</th>
          <th style={{ width: "130px" }}>Time</th>
          <th style={{ width: "85px" }}>Location</th>
          <th style={{ width: "75px" }}>Enrolled</th>
          <th style={{ width: "75px" }}>Waitlist</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section) => {
          return (
            <tr key={section.ccn} style={findInstructor(section.instructor)}>
              <td>{section.kind}</td>
              <td>{section.ccn}</td>
              <td>{section.instructor}</td>
              {section.startTime && section.endTime ? (
                <td>
                  {section.wordDays} {formatSectionTime(section)}
                </td>
              ) : (
                <td></td>
              )}
              <td>{section.locationName}</td>
              <td>
                {section.enrolled}/{section.enrolledMax}
              </td>
              <td>{section.waitlisted}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default SectionTable;
