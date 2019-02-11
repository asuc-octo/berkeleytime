import React, { Component } from 'react';


import Button from '../../elements/CustomButton/CustomButton';
import logo from '../../assets/img/images/about/octo.jpg';

class Jumbotron extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section className="jumbotron">
        <div className="jumbotron-content">
          <h1 className="jumbotron-title">BerkeleyTime</h1>
          <h4 className="jumbotron-subheading">Course discovery, simplified.</h4>
          <Button className="jumbotron-explore-btn btn-fill" bsStyle="primary">Explore courses now</Button>
          <Button className="jumbotron-sign-up-btn" bsStyle="primary">Sign Up</Button>
        </div>
        <div className="jumbotron-image">
          <img className="jumbotron-img" src={logo} alt="jumbotron" />
        </div>
      </section>
    );
  }
}

export default Jumbotron;
