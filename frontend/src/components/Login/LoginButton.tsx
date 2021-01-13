import React from 'react';
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login';
import { Nav } from 'react-bootstrap';
import { useLogin } from '../../graphql/hooks/user';
import { useHistory } from 'react-router';
import BTLoader from 'components/Common/BTLoader';
import btn_google_signin from 'assets/svg/profile/btn_google_signin.svg';


type Props = {
  hideLogin: () => void;
};

const LoginButton = ({ hideLogin }: Props) => {
  const [login, { loading }] = useLogin();
  const history = useHistory();

  function onSignIn(response: GoogleLoginResponse) {
    const tokenId = response.tokenId;
    login({
      variables: {
        token: tokenId,
      },
    }).then((result) => {
      // If the login was successful.
      if (result.data?.login?.user) {
        hideLogin();
        history.push('/profile');
      }
    });
  }

  if (loading) {
    return <BTLoader />;
  }

  // TODO: potentially add loading state for this button?
  return (
    <Nav.Link
      className="login-btn bt-bold"
      eventKey={6}
      onClick={() => { window.location.href = "/api/login/"; }}
    >
      <img className="login-img" src={btn_google_signin} alt="" />
    </Nav.Link>
  );
};

export default LoginButton;
