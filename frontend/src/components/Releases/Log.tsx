import React, { FC } from 'react';
import { H3, H6 } from 'bt/custom';

export interface Props {
  date: string,
  whatsNew: string[],
  fixes: string[],
}

const Log: FC<Props> = (props) =>  {
  const { date, whatsNew, fixes } = props;

  return (
    <div className="mb-5">
      <div>
        <H3 bold className="mb-3">{date}</H3>
      </div>
      {whatsNew ? (
        <div className="releases-log-list">
          <H6 bold className="mb-2">&#129321; What&apos;s New</H6>
          <ul>
            {whatsNew.map((item, i) => (
              <li key={i}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {fixes ? (
        <div>
          <H6 bold className="mb-2">&#128027; Bug Fixes</H6>
          <ul>
            {fixes.map((item, i) => (
              <li key={i}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default Log;
