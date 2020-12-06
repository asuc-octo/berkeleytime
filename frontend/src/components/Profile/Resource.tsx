import React, { PureComponent } from 'react';
import { Link as RoutingLink } from 'react-router-dom';

type Props = {
  text: string;
  link: string;
};

const Resource = ({ text, link }: Props) => {
  const isExternal = link.includes(':');
  const Component = (isExternal ? 'a' : RoutingLink) as any;
  const props = isExternal
    ? {
        href: link,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {
        to: link,
      };

  return (
    <div className="profile-row">
      <Component {...props}>
        <p
          className={`resource-text-${
            text === 'Delete Account' ? 'red' : 'blue'
          }`}
        >
          {text}
        </p>
      </Component>
    </div>
  );
};

export default Resource;
