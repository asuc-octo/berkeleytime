import React from 'react';
import { Nav } from 'react-bootstrap';
import btn_google_signin from 'assets/svg/profile/btn_google_signin.svg';
import { ReactComponent as GoogleIcon } from '../../assets/svg/profile/google.svg';

type Props = {
  hideLogin: () => void;
};

const LoginButton = ({ hideLogin }: Props) => {

  // TODO: potentially add loading state for this button?
  return (
    <Nav.Link
      className="login-btn bt-bold bt-btn-primary btn-bt-md"
      eventKey={6}
      onClick={() => { window.location.href = "/api/login/"; }}
    >
      <GoogleIcon className="login-img" /> Sign in with CalNet
    </Nav.Link>
  );
};

export default LoginButton;
