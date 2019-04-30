import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

function Explore({ title, desc, action, link, symbol, img, reverse }) {
  if (!reverse) {
    return (
      <div className="landing-explore landing-explore-reverse">
        <div className="level">
          <div className="level-left landing-explore-desc has-text-centered">
            <FontAwesome className={`landing-explore-icon app-icon`} name={symbol} size="5x" />
            <h3>{title}</h3>
            <p>{desc}</p>
            <Link to={link}>{action} <FontAwesome name="long-arrow-right" /></Link>
          </div>
          <div className="level-right has-text-centered landing-explore-img-wrapper">
            <img className="landing-explore-img box-shadow" src={img} alt="explore" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="landing-explore">
      <div className="level">
        <div className="level-left landing-explore-desc has-text-centered is-hidden-tablet">
          <FontAwesome className={`landing-explore-icon app-icon`} name={symbol} size="5x" />
          <h3>{title}</h3>
          <p>{desc}</p>
          <Link to={link}>{action} <FontAwesome name="long-arrow-right" /></Link>
        </div>
        <div className="level-left has-text-centered landing-explore-img-wrapper">
          <img className="landing-explore-img box-shadow" src={img} alt="explore" />
        </div>
        <div className="level-right landing-explore-desc has-text-centered is-hidden-mobile">
          <FontAwesome className={`landing-explore-icon app-icon`} name={symbol} size="5x" />
          <h3>{title}</h3>
          <p>{desc}</p>
          <Link to={link}>{action} <FontAwesome name="long-arrow-right" /></Link>
        </div>
      </div>
    </div>
  );
}

export default Explore;
