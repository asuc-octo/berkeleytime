import { H3, H6 } from "bt/custom";
import yaml from "js-yaml";
import React, { FC, useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";

import { ReactComponent as Web } from "../../assets/svg/about/web.svg";

type Contributor = {
  name: string;
  role: string;
  site?: string;
};

type Section = {
  name: string;
  rows: Contributor[][];
};

const PastContributors: FC = () => {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    fetch("/assets/past_contributors.yaml")
      .then((response) => response.text())
      // @ts-ignore
      .then((text) => setSections(yaml.load(text) ?? []));
  }, []); // only run once

  return (
    <div className="past-contributors mb-5">
      <H3 bold className="mb-4">
        Alumni
      </H3>
      {sections.map((section) => (
        <div key={section.name} className="section mb-4">
          <H6 bold className="mb-3">
            {section.name}
          </H6>
          {section.rows.map((row, index) => (
            <Row key={index}>
              {row.map((member) => (
                <Col
                  key={member.name}
                  xs={6}
                  md={3}
                  className="contributor-card"
                >
                  <div className="name">
                    <p className="bt-light-bold">{member.name}</p>
                    {member.site ? (
                      <a href={member.site}>
                        <Web />
                      </a>
                    ) : null}
                  </div>
                  {member.role ? (
                    <div className="role">{member.role}</div>
                  ) : null}
                </Col>
              ))}
            </Row>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PastContributors;
