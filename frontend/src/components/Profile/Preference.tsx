import React from "react";
import Switch from "react-ios-switch";

type PreferenceProps = {
  text: string;
  isChecked: boolean;
  onChange?: (isChecked: boolean) => void;
};

const Preference = ({
  text,
  isChecked,
  onChange = () => {},
}: PreferenceProps) => {
  return (
    <div className="profile-row">
      <p>{text}</p>
      <div className="notifications-switch">
        <Switch checked={isChecked} onChange={onChange} />
      </div>
    </div>
  );
};

export default Preference;
