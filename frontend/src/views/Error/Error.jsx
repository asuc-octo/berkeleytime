import React from 'react';
import { Link } from 'react-router-dom';
import empty_graph from '../../assets/img/images/empty-graph.png';

function Error() {
  return(
      <div className="app-container">
        <div className="level error">
            <div className="level-left">
              <div className="error-heading">
                <h1>404</h1>
                <h2>Uh oh.</h2>
                <p>Looks like the page you were looking for couldn't be found.</p>
                <p>Here are a couple things you can do.</p>
                <div className="error-buttons">
                <button type="button" className="button error-info"><Link to="/catalog"><b>Back to Classes</b></Link></button>
                <button type="button" className="button error-bugs"><a href="https://docs.google.com/forms/d/e/1FAIpQLSdP9GySJRnQmmYFxdoxmcw1Ar_uw-cPXqRdXpJg-Lg2SPksaw/viewform"><b>Report a Bug</b></a></button>
                </div>
              </div>
              <div className="level-right">
                <img className="error-img" src={empty_graph} alt="empty_graph" />
              </div>
          </div>
        </div>
      </div>
  );
}

export default Error;