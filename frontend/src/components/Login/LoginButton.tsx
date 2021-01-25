import React from 'react';
import { Nav } from 'react-bootstrap';
import btn_google_signin from 'assets/svg/profile/btn_google_signin.svg';
import { Button } from 'bt/custom';
import { ReactComponent as GoogleIcon } from '../../assets/svg/profile/google.svg';

type Props = {
  hideLogin: () => void;
};

const LoginButton = ({ hideLogin }: Props) => {

  // TODO: potentially add loading state for this button?
  return (
    <Button className="login-btn bt-bold" href={{ as_link: '/api/login/' }}>
      <GoogleIcon className="login-img" /> Sign in with Google
    </Button>
  );
};

export default LoginButton;
