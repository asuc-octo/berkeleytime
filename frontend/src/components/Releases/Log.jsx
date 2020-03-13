import React from 'react';

function Log({ date, whatsNew, fixes }) {
    return (
        <div className="releases-log">
            <div className="releases-log-date">
                <h3>{date}</h3>
            </div>
            <div className="releases-log-list">
                <h2>What's New</h2>
                <ul>
                    {whatsNew.map(item => <li><span dangerouslySetInnerHTML={{ __html: item }} /></li>)}
                </ul>
            </div>
            <div className="releases-log-list">
                <h2>Bug Fixes</h2>
                <ul>
                    {fixes.map(item => <li><span dangerouslySetInnerHTML={{ __html: item }} /></li>)}
                </ul>
            </div>
        </div>
    );
}

export default Log;
