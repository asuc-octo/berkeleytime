import React, { CSSProperties, ReactNode } from "react";
import { range } from "utils/range";
import { dayToLongName, timeToHourString } from "utils/date";

export type CardData = {
  key?: string | number;
  day: number;
  startTime: number;
  endTime: number;
  card: ReactNode;

  /** **Do not directly provide** */
  overlapNum?: number;

  /** **Do not directly provide** */
  overlapIndex?: number;
};

type CourseCalendarProps = {
  days?: number[];
  startTime?: number;
  endTime?: number;
  cards: CardData[];
};

const CELL_HEIGHT = 60;
const MIN_HEIGHT = 20;
const INTER_CELL_PADDING = 0;

/**
 * Takes a list of cards and returns copies with the `numOverlaps` property set.
 */
function calculateOverlaps(cards: CardData[]): CardData[] {
  const events = cards.sort((a, b) => a.startTime - b.startTime);

  let finalCards: CardData[][] = [];
  let currrentEndTime: number = -Infinity;

  let currentOverlap: CardData[] | null = null;

  for (let i = 0; i < events.length; i++) {
    const c = cards[i];

    // If the current course doesn't overlaps
    if (c.startTime >= currrentEndTime) {
      currentOverlap = [];
      finalCards.push(currentOverlap);
    }

    currentOverlap!.push(c);
    currrentEndTime = Math.max(c.endTime, currrentEndTime);
  }

  return finalCards.flatMap((group) =>
    group.map((item, index) => ({
      ...item,
      overlapIndex: index,
      overlapNum: group.length,
    }))
  );
}

function calculateCellStyle(
  calendarStartTime: number,
  { startTime, endTime, overlapNum = 0, overlapIndex = 0 }: CardData
): CSSProperties {
  const visualStartTime = startTime - calendarStartTime;
  const height = Math.max(MIN_HEIGHT, (endTime - startTime) * CELL_HEIGHT);
  return {
    top: visualStartTime * CELL_HEIGHT,
    height: height,
    left: `calc(${(overlapIndex / overlapNum) * 100}% + ${
      overlapIndex * INTER_CELL_PADDING
    }px)`,
    width: `calc(${((overlapNum - overlapIndex) / overlapNum) * 100}% - ${
      (overlapNum - 1) * INTER_CELL_PADDING
    }px)`,
    "--calendar-card-lines": Math.max(1, Math.floor(height / 40)),
  } as CSSProperties;
}

const CourseCalendar = ({
  days = [1, 2, 3, 4, 5],
  startTime = 8,
  endTime = 20,
  cards = [],
}: CourseCalendarProps) => {
  const hourSlots = range(startTime, endTime);
  const cardsByDay = days.map((day) =>
    cards
      .filter((c) => c.day === day)
      .filter((c) => !!c.startTime && !!c.endTime)
      .sort((a, b) => a.startTime - b.startTime)
  );

  return (
    <div className="course-calendar">
      <div className="course-calendar__content">
        <div className="course-calendar__time" />
        <div className="course-calendar__week">
          {days.map((dayIndex) => (
            <div
              key={dayIndex}
              className="course-calendar__day course-calendar__header"
            >
              <span>{dayToLongName(dayIndex)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="course-calendar__content course-calendar__body">
        <div className="course-calendar__time">
          {hourSlots.map((hour) => (
            <div key={hour} style={{ height: CELL_HEIGHT }}>
              <span>{timeToHourString(hour)}</span>
            </div>
          ))}
        </div>
        <div className="course-calendar__week">
          {days.map((day, dayIndex) => (
            <div key={day} className="course-calendar__day">
              <div>
                {calculateOverlaps(cardsByDay[dayIndex]).map((card) => (
                  <div
                    key={card.key}
                    className="course-card__positioner"
                    style={calculateCellStyle(startTime, card)}
                  >
                    {card.card}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseCalendar;
