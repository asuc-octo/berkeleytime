import React, { PureComponent } from 'react';
import GoogleLogin from 'react-google-login';

class Login extends PureComponent {
  static onSignIn(response) {
    console.log(response);
  }

  render() {
    return (
      <div className="login-container">
        <div className="login">
          <GoogleLogin
            clientId="***REMOVED***"
            onSuccess={Login.onSignIn}
            cookiePolicy="single_host_origin"
          />
        </div>
      </div>
    );
  }
}

export default Login;