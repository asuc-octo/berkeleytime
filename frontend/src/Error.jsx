import React from 'react';
import { Link } from 'react-router-dom';

function Error() {
  return(
      <div className="app-container">
        <div className="level error">
            <div className="level-left has-text-centered">
              <div className="error-heading">
                <h1>404</h1>
                <h2>Uh oh.</h2>
                <p>Looks like the page you were looking for couldn't be found. Here are a couple things you can do.</p>
                <div className="error-buttons">
                <button type="button" className="button is-info is-rounded error-classes"><Link to="/catalog">Back to Classes</Link></button>
                <button type="button" className="button is-rounded error-bugs"><a href="https://docs.google.com/forms/d/e/1FAIpQLSdP9GySJRnQmmYFxdoxmcw1Ar_uw-cPXqRdXpJg-Lg2SPksaw/viewform">Report a Bug</a></button>
                </div>
              </div>
          </div>
        </div>
      </div>
  );
}

export default Error;