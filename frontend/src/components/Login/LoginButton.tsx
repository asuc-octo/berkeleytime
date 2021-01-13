import React from 'react';
import { Nav } from 'react-bootstrap';
import btn_google_signin from 'assets/svg/profile/btn_google_signin.svg';

type Props = {
  hideLogin: () => void;
};

const LoginButton = ({ hideLogin }: Props) => {

  // TODO: potentially add loading state for this button?
  return (
    <Nav.Link
      href="/api/login/"
      className="login-btn bt-bold"
      eventKey={6}
    >
      <img className="login-img" src={btn_google_signin} alt="" />
    </Nav.Link>
  );
};

export default LoginButton;
