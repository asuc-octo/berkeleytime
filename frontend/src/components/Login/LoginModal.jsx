import close from "assets/svg/common/close.svg";
import { H3, P } from "bt/custom";
import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

import LoginButton from "./LoginButton";

export class LoginModal extends Component {
  render() {
    return (
      <Modal
        show={this.props.showLogin}
        onHide={this.props.hideLogin}
        className="login"
      >
        <button className="link-btn back-btn" onClick={this.props.hideLogin}>
          <img src={close} />
        </button>
        <H3 bold className="mb-2">
          Welcome to Berkeleytime
        </H3>
        <P className="login-text">
          Sign in to save favorite classes and <br /> get notifications of
          course updates.
        </P>
        <LoginButton hideLogin={this.props.hideLogin} />
      </Modal>
    );
  }
}

export default LoginModal;
