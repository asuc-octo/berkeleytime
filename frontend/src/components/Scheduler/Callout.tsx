import React, { ReactNode } from 'react';

type CalloutProps = {
    type?: "info" | "warning",
    state?: "default" | "error",
    message: ReactNode
};

const icons = {
    "info": (
        <svg width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 5h2v2H9V5zM9 9h2v6H9V9z" />
            <path fillRule="evenodd" clipRule="evenodd" d="M0 10C0 4.48 4.48 0 10 0s10 4.48 10 10-4.48 10-10 10S0 15.52 0 10zm2 0c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8-8 3.59-8 8z" />
        </svg>
    ),
    "warning": (
        <svg width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.4381 15H8.54022V13H10.4381V15Z" />
            <path d="M10.4381 11H8.54022V5H10.4381V11Z" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.9785 10C18.9785 15.52 14.7273 20 9.48915 20C4.25101 20 -0.000209808 15.52 -0.000209808 10C-0.000209808 4.48 4.25101 0 9.48915 0C14.7273 0 18.9785 4.48 18.9785 10ZM17.0806 10C17.0806 5.59 13.674 2 9.48915 2C5.30431 2 1.89766 5.59 1.89766 10C1.89766 14.41 5.30431 18 9.48915 18C13.674 18 17.0806 14.41 17.0806 10Z" />
        </svg>
    )
};

const Callout = ({
    type = "info",
    state = "default",
    message
}: CalloutProps) => {
    return (
        <div className={`callout callout--state-${state}`}>
            {icons[type]}
            <p>{message}</p>
        </div>
    )
};

export default Callout;