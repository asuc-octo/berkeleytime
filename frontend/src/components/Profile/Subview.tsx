import React, { FC, ReactNode } from 'react';

type Props = {
  title: string;
  className?: string;
  widget?: ReactNode;
};

const Subview: FC<Props> = ({ title, className, widget, children }) => (
  <div className={'profile-subview ' + (className ?? '')}>
    <div className="profile-subview-title">
      <h3>{title}</h3>
      {widget}
    </div>
    <div className="profile-subview-content">{children}</div>
  </div>
);

export default Subview;
