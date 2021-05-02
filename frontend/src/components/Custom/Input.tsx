import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

type Props = {
  icon?: ReactNode;
  inputClassName?: string;
};

const BTInput = ({
  icon,
  className = '',
  inputClassName = '',
  ...props
}: Props &
  DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >) => {
  const iconClass = icon ? ' bt-input--icon' : '';

  return (
    <div className={'bt-input' + iconClass + ' ' + className}>
      <input type="text" className={inputClassName} {...props} />
      {icon}
    </div>
  );
};

export default BTInput;
