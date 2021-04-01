import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import yaml from 'js-yaml';

import { H3, H6, Button } from 'bt/custom';
import Log from 'components/Releases/Log';
import { ReduxState } from 'redux/store';
import { Theme } from 'bt/types';

type Release = {
  date: string,
  whatsNew: string[],
  fixes: string[]
}

const Releases: FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    fetch('/assets/releases.yaml')
      .then((result) => result.text())
      .then((data) => setReleases( yaml.load(data).releases ));
  }, []);

  const theme = useSelector<ReduxState, Theme>(state => state.common.theme);
  const themedReleases: Release[] = theme !== 'stanfurd' ? releases : [{date: 'Apr 1, 2021', whatsNew: ['Stanfurdtime baby!'], fixes: ['Got rid of the ugly Berkeley colors.']}]

  return (
    <div className="releases">
      <Container>
        <Row>
          <Col lg={{ span: 6, offset: 3 }}>
            <div className="releases-heading mb-5">
              <H3 bold className="mb-3">Berkeleytime Releases</H3>
              <H6 className="mb-3">Keep up-to-date with our releases and bug fixes.</H6>
              <Button variant="danger-inverted" href={{ as_link: "/bugs" }}>Report a Bug</Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={{ span: 6, offset: 3 }}>
            {themedReleases.map((item) => (
              <Log key={item.date} {...item} />
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Releases;
