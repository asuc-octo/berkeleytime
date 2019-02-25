import React, { Component } from 'react';

class ClassCard extends Component {
  constructor(props) {
    super(props);
    this.remove = this.remove.bind(this);
  }

  remove() {
    const { removeClass, classNum } = this.props
    if (removeClass) {
      removeClass(classNum)
    }
  }

  render() {
    const info = this.props;

    return (
      <div className="card card-class">
        <div className="content">
          <div className="columns">
            <div className="classNum column">
              {info.classNum}
            </div>
            <div className="classInfo column">
              {info.semester}
              <br />
              {info.faculty}
            </div>
          </div>
          <div className="columns">
            <div className="classTitle column is-three-quarters">
              {info.title}
            </div>
            <div className="column">
              <button type="button" onClick={this.remove} className="delete" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClassCard;
