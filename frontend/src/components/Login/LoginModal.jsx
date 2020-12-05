import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';

export class LoginModal extends Component {
  render() {
    return (
      <Modal
        show={this.props.showLogin}
        onHide={this.props.hideLogin}
        className="login"
      >
        <button className="link-btn back-btn" onClick={this.props.hideLogin}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="16" fill="#C4C4C4" />
            <path
              d="M24 15H11.83L17.42 9.41L16 8L8 16L16 24L17.41 22.59L11.83 17H24V15Z"
              fill="white"
            />
          </svg>
        </button>
        <LoginButton />
        <br />
        <div className="legal-text">
          By using this feature, you are agreeing <br /> to our{' '}
          <Link to="/legal/privacy">Privacy Policy</Link> and{' '}
          <Link to="/legal/terms">Terms of Service</Link>.
        </div>
      </Modal>
    );
  }
}

export default LoginModal;
