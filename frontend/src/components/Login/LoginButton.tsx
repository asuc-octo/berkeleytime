import React from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { Nav } from 'react-bootstrap';
import { useLoginMutation } from '../../graphql/graphql';
import { Redirect } from 'react-router';

const LoginButton = () => {
  const [login, { loading, data }] = useLoginMutation();

  function onSignIn(response: GoogleLoginResponse) {
    const tokenId = response.tokenId;
    login({
      variables: {
        token: tokenId
      }
    });
  }

  // If there's already a user
  if (!!data?.login?.user) {
    console.log(data);
    // return <Redirect to="/profile" />
  }

  // TODO: potentially add loading state for this button?
  return (
    <GoogleLogin
      clientId="***REMOVED***"
      render={renderProps => (
        <Nav.Link
          className="bt-bold"
          eventKey={6}
          onClick={renderProps.onClick}
          disabled={renderProps.disabled}
        >
          Login
        </Nav.Link>
      )}
      onSuccess={onSignIn as (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void}
      onFailure={error => alert('Sign-in failed with ' + JSON.stringify(error))}
      cookiePolicy="single_host_origin"
      scope="https://www.googleapis.com/auth/calendar"
      hostedDomain="berkeley.edu"
    />
  );
};

export default LoginButton;
