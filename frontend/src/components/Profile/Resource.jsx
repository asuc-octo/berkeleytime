import React, { PureComponent } from 'react';

class Resource extends PureComponent {
  render() {
    const { text, link, color } = this.props;

    return (
      <div className="profile-row">
        <a href={link} target="_blank" rel="noopener noreferrer">
          <p style={{color:color}}>{text}</p>
        </a>
      </div>
    );
  }
}

export default Resource;