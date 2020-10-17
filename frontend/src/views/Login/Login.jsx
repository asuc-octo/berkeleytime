import React, { PureComponent } from 'react';
import GoogleLogin, { GoogleLogout } from 'react-google-login';
import axios from 'axios';

class Login extends PureComponent {
  static onSignIn(response) {
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
    console.log(response);

    // probably not needed anymore since users automatically limited to same org
    if (response.profileObj.email.split('@')[1] !== 'berkeley.edu') {
      alert("Please use your UC Berkeley email");
      return;
    }

    Login.postUserLogin(response);
  }

  static postUserLogin(response) {
    const tokenId = response.tokenId;
    axios.post(`/api/user/login/`,
      {
        tokenId: tokenId
      }
    ).then(res => {
        // handle response
        console.log(res);
      },
      error => console.log('An error occurred.', error),
    );
  }

  render() {
    return (
      <div className="login-container">
        <div className="login">
          <GoogleLogin
            clientId="***REMOVED***"
            onSuccess={Login.onSignIn}
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
            scope="https://www.googleapis.com/auth/calendar"
          />
        </div>
      </div>
    );
  }
}

export default Login;