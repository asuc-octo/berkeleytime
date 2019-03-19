import React from 'react';
import emptyImage from "../../assets/img/images/empty-graph.png";

class GraphEmpty extends React.PureComponent {
  render() {
    const {pageType} = this.props;
    return (
      <div className="graph-empty">
        <div className="graph-empty-content">
          <img className="graph-empty-image" src={emptyImage}/>
          <h3 className="graph-empty-heading">
            You have not added any classes!
          </h3>
          <h4 className="graph-empty-subheading">
            Begin by selecting a course to view {pageType} distributions
          </h4>
        </div>
      </div>
    )
  }
}

export default GraphEmpty;