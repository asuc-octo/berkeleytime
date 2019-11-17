import React, { Component } from 'react';

class Releases extends Component {
  render() {
    return (
      <div className="releases">
        <div className="releases-container">
            <div>Berkeleytime Releases</div>
            {/* {Releases.logs.map(item => <Log {...item} />)} */}
        </div>
      </div>
    );
  }
}

Releases.logs = [
  {
    date: 'September 5th, 2019',
    new: [],
    fixes: []
  },
  {
    date: 'September 5th, 2019',
    new: [],
    fixes: []
  },
];

export default Releases;