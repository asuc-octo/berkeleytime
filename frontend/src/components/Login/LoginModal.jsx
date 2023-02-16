import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import LoginButton from './LoginButton';
import close from 'assets/svg/common/close.svg';

export class LoginModal extends Component {
  render() {
    return (
      <Modal show={this.props.showLogin} onHide={this.props.hideLogin} className="login">
        <button className="link-btn back-btn" onClick={this.props.hideLogin}>
          <img src={close} alt="close"/>
        </button>
        <h3 className="bt-h3 bt-bold mb-2">Welcome to Berkeleytime</h3>
        <p className="bt-p login-text">
          Sign in to save favorite classes and <br/> get notifications of course updates.
        </p>
        <LoginButton hideLogin={this.props.hideLogin} />
      </Modal>
    );
  }
}

export default LoginModal;
