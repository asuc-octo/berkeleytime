import React, { forwardRef, MouseEvent, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AccessStatus, ACCESS_STATUSES } from 'utils/scheduler/accessStatus';

import { ReactComponent as ExpandMore } from '../../assets/svg/common/expand.svg';

type ACToggleProps = {
  visibility: AccessStatus;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
};
const ACToggle = forwardRef<HTMLButtonElement, ACToggleProps>(
  ({ visibility, onClick }: ACToggleProps, ref) => {
    let status = ACCESS_STATUSES[visibility];

    return (
      <button ref={ref} onClick={onClick} className="access-control-toggle">
        {status?.icon} <span>{status?.name}</span>{' '}
        <ExpandMore className="access-control-toggle__expand ml-2" />
      </button>
    );
  }
);

ACToggle.displayName = 'ACToggle';

type Props = {
  visibility: AccessStatus;
  setVisibility: (newVisibility: AccessStatus) => void;
  scheduleId: string;
};

const AccessControl = ({
  visibility = 'private',
  setVisibility,
  scheduleId,
}: Props) => {
  const [isShowing, setIsShowing] = useState(false);

  const scheduleUUID = atob(scheduleId).split(':')[1];
  const scheduleLink = `${window.location.origin}/s/${scheduleUUID}`;

  return (
    <Dropdown
      alignRight
      onSelect={(eventKey) => setVisibility(eventKey as AccessStatus)}
      onToggle={(isOpen, event, metadata) => {
        if (metadata.source === 'select') return;
        setIsShowing(isOpen);
      }}
      show={isShowing}
    >
      <Dropdown.Toggle as={ACToggle} visibility={visibility} />
      <Dropdown.Menu className="access-control-menu">
        {visibility === 'public' && (
          <div className="access-control-menu__link">
            <h4>Schedule Link</h4>
            <p>Click below to copy your schedule&apos;s link.</p>
            <input
              value={scheduleLink}
              type="text"
              title="Click to copy."
              readOnly
              onClick={(e) => {
                (e.target as HTMLInputElement).select();
                document.execCommand('copy');
              }}
            />
          </div>
        )}
        {Object.entries(ACCESS_STATUSES).map(([key, details]) => (
          <Dropdown.Item key={key} eventKey={key}>
            {details.icon}
            <div className="ml-3">
              <div className="access-control-menu__name">{details.name}</div>
              <div className="access-control-menu__desc">
                {details.description}
              </div>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccessControl;
