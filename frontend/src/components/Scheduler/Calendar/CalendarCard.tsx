import React, { CSSProperties, forwardRef, HTMLProps } from 'react';
import Color from 'color';

export type Props = HTMLProps<HTMLDivElement> & {
  title: string;
  description: string;
  color: string;
  className?: string;
  style?: CSSProperties;
};

const CalendarCard = forwardRef<HTMLDivElement, Props>(
  (
    { title, description, color, style = {}, className = '', ...props },
    ref
  ) => {
    const isLightCard = Color(color).luminosity() > 0.5;

    return (
      <div
        className={'calendar-card ' + className}
        style={{
          background: color,
          color: isLightCard ? '#535353' : '#FFF',
          ...style,
        }}
        title={title}
        ref={ref}
        {...props}
      >
        <div className="calendar-card__title">{title}</div>
        <p>{description}</p>
      </div>
    );
  }
);

CalendarCard.displayName = 'CalendarCard';

export default CalendarCard;
