import React from "react";
import Color from "color";

export type CourseCardProps = {
    title: string,
    description: string,
    color: string
};

const CourseCard = ({
    title,
    description,
    color
}: CourseCardProps) => {
    const isLightCard = Color(color).luminosity() > 0.5;

    return (
        <div
            className="course-card"
            style={{
                background: color,
                color: isLightCard ? "#535353" : "#FFF"
            }}
        >
            <div className="couse-card__title">{title}</div>
            <p>{description}</p>
        </div>
    );
};

export default CourseCard;