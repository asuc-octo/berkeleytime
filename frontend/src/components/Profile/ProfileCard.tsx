import React, { ComponentProps, ElementType, ReactNode } from "react";
import TrashButton from "components/Common/TrashButton";

type Props<T extends ElementType> = ComponentProps<T> & {
  removable?: boolean;
  component: T;
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  didRemove?: () => void;
};

const ProfileCard = <Component extends ElementType>({
  removable = true,
  component: WrapperComponent = "div",
  title,
  subtitle,
  description,
  aside,
  didRemove,
  ...props
}: Props<Component>) => {
  return (
    <WrapperComponent {...props} className="profile-card">
      <div className="profile-card-info">
        <h6>{title}</h6>
        <p className="profile-card-info-desc">{subtitle}</p>
        <div className="profile-card-info-stats">{description}</div>
      </div>
      {aside && (
        <div className="profile-card-sort profile-card-grade">{aside}</div>
      )}
      {removable && (
        <TrashButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            didRemove?.();
          }}
        />
      )}
    </WrapperComponent>
  );
};

export default ProfileCard;
