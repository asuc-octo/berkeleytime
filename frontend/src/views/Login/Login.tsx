import React from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline, GoogleLogout } from 'react-google-login';
import { useLoginMutation } from '../../graphql/graphql';

const Login = () => {
  const [login, { loading, data }] = useLoginMutation();

  function onSignIn(response: GoogleLoginResponse) {
    /*
    Response Format:
    {
      accessToken,
      googleId,
      profileObj: {
        email, familyName, givenName, googleId, imageUrl, name
      },
      tokenId,
      tokenObj: {
        access_token, expires_at, expires_in, first_issued_at, id_token,
        idpId, login_hint, scope, session_state, token_type
      }
    }
    */

    // probably not needed anymore since users automatically limited to same org
    if (response.profileObj.email.split('@')[1] !== 'berkeley.edu') {
      alert("Please use your UC Berkeley email");
      return;
    }

    const tokenId = response.tokenId;
    login({
      variables: {
        token: tokenId
      }
    });
  }

  return (
    <div className="login-container">
      <div className="login">
        <GoogleLogin
          clientId="***REMOVED***"
          onSuccess={onSignIn as (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void}
          onFailure={error => alert('Sign-in failed with ' + JSON.stringify(error))}
          cookiePolicy="single_host_origin"
          scope="https://www.googleapis.com/auth/calendar"
        />
      </div>
      <div className="logout">
        <GoogleLogout
          clientId="***REMOVED***"
          buttonText="Sign out"
          onLogoutSuccess={() => console.log('Sign out success')}
        />
      </div>
    </div>
  );
}

export default Login;