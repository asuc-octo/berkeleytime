import React, { CSSProperties } from "react";
import CourseCard, { CourseCardProps } from "./CouseCard";
import { range } from "utils/range";
import { dayToString, timeToHourString } from "utils/time";
import { start } from "repl";

type CourseCalendarProps = {
    days?: number[],
    startTime?: number,
    endTime?: number,
    cards: (CourseCardProps & {
        key?: string | number,
        day: number,
        startTime: number,
        endTime: number,
    })[]
};

const CELL_HEIGHT = 60;
const MIN_HEIGHT = 20;

function calculateCellStyle(
    calendarStartTime: number,
    calendarendTime: number,
    { startTime, endTime }: {
        startTime: number,
        endTime: number
    }
): CSSProperties {
    const visualStartTime = startTime - calendarStartTime;
    return {
        top: visualStartTime * CELL_HEIGHT,
        height: Math.max(MIN_HEIGHT, (endTime - startTime) * CELL_HEIGHT),
        left: 0
    };
}

const CourseCalendar = ({
    days = [1, 2, 3, 4, 5],
    startTime = 8,
    endTime = 18,
    cards = []
}: CourseCalendarProps) => {
    const hourSlots = range(startTime, endTime);
    const cardsByDay = days.map(day => cards.filter(c => c.day == day));

    return (
        <div className="course-calendar">
            <div className="course-calendar__content">
                <div className="course-calendar__time" />
                <div className="course-calendar__week">
                    {days.map(dayIndex => (
                        <div
                            key={dayIndex}
                            className="course-calendar__day course-calendar__header"
                        >
                            <span>{dayToString(dayIndex)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="course-calendar__content course-calendar__body">
                <div className="course-calendar__time">
                    {hourSlots.map((hour, index) => (
                        <div
                            key={hour}
                            style={{ height: CELL_HEIGHT }}
                        >
                            <span>{timeToHourString(hour)}</span>
                        </div>
                    ))}
                </div>
                <div className="course-calendar__week">
                    {days.map((day, dayIndex) => (
                        <div
                            key={day}
                            className="course-calendar__day"
                        >
                            <div>
                                {cardsByDay[dayIndex].map(card => (
                                    <div
                                        key={card.key || `${card.title}${card.description}`}
                                        className="course-card__positioner"
                                        style={calculateCellStyle(startTime, endTime, card)}
                                    >
                                        <CourseCard {...card} />
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