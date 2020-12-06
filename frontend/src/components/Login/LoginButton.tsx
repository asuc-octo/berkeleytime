import React from 'react';
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from 'react-google-login';
import { Nav } from 'react-bootstrap';
import { useLogin } from '../../graphql/hooks/user';
import { useHistory } from 'react-router';
import BTLoader from 'components/Common/BTLoader';

const LoginButton = () => {
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
        history.push('/profile');
      }
    });
  }

  if (loading) {
    return <BTLoader />;
  }

  // TODO: potentially add loading state for this button?
  return (
    <GoogleLogin
      clientId="***REMOVED***"
      render={(renderProps) => (
        <Nav.Link
          className="bt-bold"
          eventKey={6}
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          Login
        </Nav.Link>
      )}
      onSuccess={
        onSignIn as (
          response: GoogleLoginResponse | GoogleLoginResponseOffline
        ) => void
      }
      onFailure={(error) =>
        alert('Sign-in failed with ' + JSON.stringify(error))
      }
      cookiePolicy="single_host_origin"
      scope="https://www.googleapis.com/auth/calendar"
      hostedDomain="berkeley.edu"
    />
  );
};

export default LoginButton;
