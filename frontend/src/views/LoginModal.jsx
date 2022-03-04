import google_login from "assets/svg/profile/btn_google_signin.png";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Modal, Form } from "react-bootstrap";
import { Button } from "react-bootstrap";

export class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = { showModal: true };
  }

  render() {
    return (
      <Modal show={this.state.showModal} className="login">
        <button className="link-btn">
          <img className="login-btn" src={google_login}></img>
        </button>
        <button
          onClick={() => this.setState({ showModal: false })}
          className="link-btn"
        >
          Button
        </button>
        Learn more about our Privacy Policy...
      </Modal>
    );
  }
}

export default LoginModal;
