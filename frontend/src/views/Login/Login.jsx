import React, { Component } from 'react';
import { withRouter } from 'react-router';
import GoogleLogin, { GoogleLogout } from 'react-google-login';
import axios from 'axios';

class Login extends Component {
  constructor(props) {
    super(props);

    this.onSignIn = this.onSignIn.bind(this);
  }

  onSignIn(response) {
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
    const { history } = this.props;
    const tokenId = response.tokenId;
    axios.post(`/api/user/login/`,
      {
        tokenId: tokenId
      }
    ).then(res => {
        history.push('/profile');
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
            onSuccess={this.onSignIn}
            onFailure={error => alert('Sign-in failed with ' + JSON.stringify(error))}
            cookiePolicy="single_host_origin"
            scope="https://www.googleapis.com/auth/calendar"
            hostedDomain="berkeley.edu"
          />
        </div>
        <div className="logout">
          <GoogleLogout
            clientId="***REMOVED***"
            buttonText="Sign out"
            onLogoutSuccess={() => console.log('Sign out success')}
            scope="https://www.googleapis.com/auth/calendar"
            hostedDomain="berkeley.edu"
          />
        </div>
      </div>
    );
  }
}

export default withRouter(Login);