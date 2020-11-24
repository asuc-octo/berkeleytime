import React from 'react';
import Color from 'color';

export type Props = {
  title: string;
  description: string;
  color: string;
};

const CalendarCard = ({ title, description, color }: Props) => {
  const isLightCard = Color(color).luminosity() > 0.5;

  return (
    <div
      className="calendar-card"
      style={{
        background: color,
        color: isLightCard ? '#535353' : '#FFF',
      }}
    >
      <div className="calendar-card__title">{title}</div>
      <p>{description}</p>
    </div>
  );
};

export default CalendarCard;
