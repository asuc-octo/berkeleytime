import React, { PureComponent } from 'react';

class Resource extends PureComponent {
  render() {
    const { text, link } = this.props;

    return (
      <div className="profile-row">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <p className={`resource-text-${text === 'Delete Account' ? 'red' : 'blue'}`}>{text}</p>
        </a>
      </div>
    );
  }
}

export default Resource;
